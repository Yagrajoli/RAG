import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export const indexingController = async (req, res) => {
  try {
    const { url } = req.body;

    let pdfDocs = null;
    let webDocs = null;

    // pdf upload

   if (req.file) {
      const filePath = req.file.path;
      console.log("PDF path:", filePath);

      const pdfLoader = new PDFLoader(filePath);
      pdfDocs = await pdfLoader.load();
    }

    // website URL
     if (url) {
      console.log("URL:", url);

      const webLoader = new CheerioWebBaseLoader(url);
      webDocs = await webLoader.load();
    }

   if (!req.file && !url) {
      return res.status(400).json({
        message: "Please provide a PDF file or a URL",
      });
    }

    /** -----------------------------
     *  EMBEDDINGS
     * ------------------------------*/
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    /** -----------------------------
     *  STORE PDF DOCS IF PRESENT
     * ------------------------------*/
    if (pdfDocs) {
      await QdrantVectorStore.fromDocuments(pdfDocs, embeddings, {
        url: process.env.QDRANT_DB_URL,
        collectionName: "pdf_collection",
      });
    }

    /** -----------------------------
     *  STORE WEB DOCS IF PRESENT
     * ------------------------------*/
    if (webDocs) {
      await QdrantVectorStore.fromDocuments(webDocs, embeddings, {
        url: process.env.QDRANT_DB_URL,
        collectionName: "web_collection",
      });
    }

    res.status(200).json({
      message: "Indexing completed",
      pdfIndexed: !!pdfDocs,
      webIndexed: !!webDocs,
      pdfCollection: pdfDocs ? "my_new_collection" : null,
      webCollection: webDocs ? "web_collection" : null,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Indexing failed",
      error: error.message,
    });
  }
};
