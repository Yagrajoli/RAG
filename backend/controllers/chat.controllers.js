import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatController = async (req, res) => {
  try {
    const { userQuery, collections } = req.body;

    if (!userQuery) {
      return res.status(400).json({ message: "userQuery is required" });
    }
    if (!collections) {
      return res.status(400).json({ message: "collections is required" });
    }

    // Ensure collections is array
    const collectionsArray = Array.isArray(collections)
      ? collections
      : [collections];

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    let allDocuments = [];

    // -----------------------------
    // Fetch from ALL collections
    // -----------------------------
    for (const col of collectionsArray) {
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_DB_URL,
          // host:process.env.CLUSTER_ENDPOINT,
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: col,
        }
      );

      const retriever = vectorStore.asRetriever({
        k: 5,
        searchType: "similarity",
      });

      const docs = await retriever.invoke(userQuery);

      allDocuments.push(
        ...docs.map((d) => ({
          content: d.pageContent,
          metadata: d.metadata,
          sourceCollection: col,
        }))
      );
    }


    // Prepare context for GPT

    const contextString = allDocuments
      .map(
        (d, idx) =>
          `Source: ${d.sourceCollection}\nPage: ${
            d.metadata?.loc?.pageNumber || "N/A"
          }\nContent: ${d.content}`
      )
      .join("\n\n-----------------\n\n");

    const SYSTEM_PROMPT = `
You are an intelligent assistant. 
Answer ONLY based on the provided document/web context.
If the answer is not present in the context, say "I don't have enough information".

Always include page numbers if available.

Context:
${contextString}
    `.trim();

    
    // GPT Answer

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    const answer = response.choices[0].message.content;

    return res.status(200).json({
      answer,
      sources: allDocuments.map((d) => d.metadata || "N/A"),
    });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      message: "Error during chat",
      error: error.message,
    });
  }
};
