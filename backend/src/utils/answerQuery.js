import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.Index("advanced-rag-pipeline").namespace("subtitles_vectors");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const callOpenAI = async (messages, parseJson = false) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    response_format: parseJson ? { type: "json_object" } : { type: "text" },
  });
  const content = completion.choices[0].message.content;
  if (parseJson) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI:", content);
      return {};
    }
  }
  return content;
};

const checkGuardrail = async (query) => {
  const messages = [
    {
      role: "system",
      content:
        'You are an AI guardrail. Determine if the user\'s query is safe, appropriate, and answerable. Reply in JSON format: {"safe": boolean, "reason": "string"}',
    },
    { role: "user", content: query },
  ];
  return await callOpenAI(messages, true);
};

const generateStepBackQuery = async (query) => {
  const messages = [
    {
      role: "system",
      content:
        "You are an AI assistant. Your task is to generate a broader 'step-back' question for the user's query that helps retrieve underlying concepts and general knowledge related to the original query.",
    },
    { role: "user", content: query },
  ];
  return await callOpenAI(messages, false);
};

const generateSubQuestions = async (
  query,
  stepBackQuery,
  extraKeywords = [],
) => {
  let userContent = `Original Query: ${query}\nStep-Back Query: ${stepBackQuery}`;
  if (extraKeywords.length > 0) {
    userContent += `\nInclude these concepts: ${extraKeywords.join(", ")}`;
  }
  const messages = [
    {
      role: "system",
      content:
        'Break down the original query and the step-back query into a JSON list of up to 4 focused sub-questions that would help gather comprehensive information from a search database. Format: {"subQuestions": ["q1", "q2"]}',
    },
    { role: "user", content: userContent },
  ];
  const res = await callOpenAI(messages, true);
  return res.subQuestions || [];
};

const formatTimestamp = (ms) => {
  if (ms === undefined || ms === null || isNaN(ms)) return "00:00:00";
  const totalSeconds = Math.floor(Number(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

const retrieveContext = async (queries) => {
  let allHits = [];
  for (const q of queries) {
    const searchResponse = await index.searchRecords({
      query: { inputs: { text: q }, topK: 5 },
      fields: ["text", "start", "end"],
    });
    const hits =
      searchResponse.result?.hits ||
      searchResponse.hits ||
      searchResponse.matches ||
      [];
    allHits = allHits.concat(hits);
  }

  const uniqueHitsMap = new Map();
  for (const hit of allHits) {
    const uniqueKey =
      hit.id || hit.fields?.text || hit.metadata?.text || hit.text;
    if (uniqueKey && !uniqueHitsMap.has(uniqueKey)) {
      uniqueHitsMap.set(uniqueKey, hit);
    }
  }

  // Take top 7 unique results
  const uniqueHits = Array.from(uniqueHitsMap.values()).slice(0, 7);

  const contextObjects = uniqueHits
    .map((hit) => {
      const data = hit.fields || hit.metadata || hit;
      return {
        text: data.text,
        start_time: formatTimestamp(data.start),
        end_time: formatTimestamp(data.end),
      };
    })
    .filter((item) => item.text);

  return JSON.stringify(contextObjects, null, 2);
};

const generateAnswer = async (query, context) => {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. Use the provided JSON array of retrieved context (which includes subtitles and their pre-formatted start_time and end_time in hh:mm:ss format) along with your own general knowledge to comprehensively answer the user's question. Always cite timestamps in the exact human-readable format (hh:mm:ss) from the context when referencing video segments. If the context doesn't contain the full answer, supplement it with your own knowledge but state clearly when you are doing so.",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`,
    },
  ];
  return await callOpenAI(messages, false);
};

const checkRelevance = async (query, context) => {
  const messages = [
    {
      role: "system",
      content:
        'You are a relevance checker. Determine whether the retrieved context is semantically related to the user\'s query. The context comes from video subtitles. If the context has NO meaningful relation to the query, mark it as irrelevant. Reply in JSON format: {"relevant": boolean, "reason": "string"}',
    },
    {
      role: "user",
      content: `Query: ${query}\n\nRetrieved Context:\n${context}`,
    },
  ];
  return await callOpenAI(messages, true);
};

const generateAnswerFromGeneralKnowledge = async (query) => {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. The user asked a question that is not covered in the retrieved video context. Provide a comprehensive, accurate, and detailed answer to the user's question using your general knowledge. At the end of your response, add a short, clear note stating that the provided video context does not contain specific information about this topic, so your answer is based on general knowledge.",
    },
    {
      role: "user",
      content: query,
    },
  ];
  return await callOpenAI(messages, false);
};

const evaluateAnswer = async (query, context, answer) => {
  const messages = [
    {
      role: "system",
      content:
        'You are an expert evaluator. Evaluate the provided answer based on how well it addresses the user\'s question, uses the provided context accurately, incorporates general knowledge appropriately, and avoids hallucinations. Score the answer out of 10. Also extract any missing keywords or topics that could improve the answer if retrieved. Reply in JSON format: {"score": number, "missingKeywords": ["string", ...], "feedback": "string"}',
    },
    {
      role: "user",
      content: `Question: ${query}\n\nContext used:\n${context}\n\nAnswer given:\n${answer}`,
    },
  ];
  return await callOpenAI(messages, true);
};

export const answerQuery = async (queryText) => {
  try {
    console.log("Checking guardrails...");
    const guardrail = await checkGuardrail(queryText);
    if (guardrail.safe === false) {
      return `I'm sorry, I cannot answer that query. Reason: ${guardrail.reason}`;
    }

    console.log("Generating step-back query...");
    const stepBackQuery = await generateStepBackQuery(queryText);

    let currentKeywords = [];
    let bestAnswer = "";
    let maxScore = 0;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`\n--- Attempt ${attempt} ---`);
      console.log("Generating sub-questions...");
      const subQuestions = await generateSubQuestions(
        queryText,
        stepBackQuery,
        currentKeywords,
      );

      console.log("Retrieving context from Pinecone...");
      // Original query, step-back query, plus specific sub-questions
      const queriesToRun = [queryText, stepBackQuery, ...subQuestions];
      const context = await retrieveContext(queriesToRun);

      // On first attempt, check if the context is relevant to the query
      if (attempt === 1) {
        console.log("Checking relevance...");
        const relevance = await checkRelevance(queryText, context);
        if (relevance.relevant === false) {
          console.log(
            "Context is not relevant. Answering using general knowledge..."
          );
          return await generateAnswerFromGeneralKnowledge(queryText);
        }
      }

      console.log("Generating answer...");
      const answer = await generateAnswer(queryText, context);

      console.log("Evaluating answer...");
      const evaluation = await evaluateAnswer(queryText, context, answer);
      console.log(
        `Score: ${evaluation.score}/10. Feedback: ${evaluation.feedback}`,
      );

      if (evaluation.score > maxScore) {
        maxScore = evaluation.score;
        bestAnswer = answer;
      }

      if (evaluation.score >= 7) {
        console.log("Score is >= 7. Returning answer.");
        return answer;
      } else {
        console.log("Score is < 7. Extracting keywords for next attempt...");
        if (
          evaluation.missingKeywords &&
          evaluation.missingKeywords.length > 0
        ) {
          currentKeywords = [
            ...new Set([...currentKeywords, ...evaluation.missingKeywords]),
          ];
        }
      }
    }

    console.log("Max attempts reached. Returning best answer so far.");
    return bestAnswer;
  } catch (error) {
    console.error("Error answering query:", error);
    throw error;
  }
};


