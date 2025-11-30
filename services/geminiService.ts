import { GoogleGenAI } from "@google/genai";
import { Document } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a summary and suggested tags for a document.
 */
export const generateDocMetadata = async (content: string, title: string) => {
  if (!apiKey) return { summary: "API Key missing", tags: [] };

  try {
    const prompt = `
      Analyze the following document content. 
      1. Provide a concise summary (max 2 sentences) in Traditional Chinese.
      2. Suggest up to 5 relevant tags (keywords).
      
      Output JSON format:
      {
        "summary": "string",
        "tags": ["tag1", "tag2"]
      }

      Title: ${title}
      Content: ${content.substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return { summary: "", tags: [] };
    
    return JSON.parse(text) as { summary: string, tags: string[] };
  } catch (error) {
    console.error("Gemini metadata error:", error);
    return { summary: "AI generation failed.", tags: [] };
  }
};

/**
 * Answers a user question based on the context of all documents.
 * This simulates a RAG (Retrieval Augmented Generation) system.
 */
export const askKnowledgeBase = async (query: string, documents: Document[]) => {
  if (!apiKey) return "請先設定 Google Gemini API Key 才能使用 AI 智慧問答。";

  try {
    // In a real app, we would use embeddings search here. 
    // For this demo, we concatenate relevant text fits in context window.
    const context = documents.map(d => `
      ---
      Title: ${d.title}
      ID: ${d.id}
      Content: ${d.content.substring(0, 1000)}...
      ---
    `).join("\n");

    const prompt = `
      You are a helpful Knowledge Management assistant for a small company.
      Use the provided context documents below to answer the user's question in Traditional Chinese.
      If the answer is not in the documents, state that you don't know based on the internal knowledge base.
      Cite the document Title if you use information from it.

      Context:
      ${context}

      User Question: ${query}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Good balance of speed and reasoning
      contents: prompt,
    });

    return response.text || "無法生成回答。";

  } catch (error) {
    console.error("Gemini Q&A error:", error);
    return "AI 服務暫時無法使用，請稍後再試。";
  }
};