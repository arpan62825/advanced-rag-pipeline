import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.Index("advanced-rag-pipeline").namespace("subtitles_vectors");

const addToPinecone = async (chunks) => {
  try {
    const batchSize = 90;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await index.upsertRecords({ records: batch });
    }

    console.log("Successfully added to Pinecone");
  } catch (error) {
    console.error("Error adding to Pinecone:", error);
  }
};

export default addToPinecone;
