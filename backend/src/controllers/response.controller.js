import { answerQuery } from "../utils/answerQuery.js";

export const generateResponse = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res
      .status(400)
      .json({ error: "Query is required in the request body." });
  }

  try {
    const result = await answerQuery(query);
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error generating response:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
