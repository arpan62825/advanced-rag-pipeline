import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateResponse = async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.status(200).json({ data: response.output_text });
  } catch (error) {
    console.error("Error generating response:", error);
  }

  console.log(response.output_text);
};
