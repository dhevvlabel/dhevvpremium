import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemInstruction } = req.body;
    
    // Only use Gemini as requested
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").replace(/['"]/g, '').trim();

    if (!geminiKey) {
      return res.status(401).json({ 
        error: "Gemini API Key (GEMINI_API_KEY) belum dikonfigurasi di Dashboard Vercel." 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      // Prepare Gemini format
      const history = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: systemInstruction || "Anda adalah asisten virtual Dhevv Premium.",
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      });

      const responseText = response.text;

      if (responseText) {
        return res.status(200).json({
          choices: [{
            message: { content: responseText }
          }]
        });
      }

      throw new Error("Empty response from AI");

    } catch (err: any) {
      console.error("Gemini Error:", err);
      return res.status(500).json({ error: `AI Error: ${err.message || 'Gemini Failed'}` });
    }
  } catch (error: any) {
    console.error("Vercel AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
