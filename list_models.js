const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    console.log("Fetching available models from Google AI API...");
    // Note: listModels is a method on the genAI instance or uses the client.
    // In @google/generative-ai, there isn't a direct listModels, 
    // it's usually part of the GoogleAIFileManager or a lower-level call.
    // However, we can try to find valid models by testing them or checking the error message details.
    
    // Let's try the definitive listModels if available in this SDK version
    // Actually, in the Node SDK, it's often not there. Let's try gemini-1.5-flash-8b as a fallback too.
    const testModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.0-pro'
    ];

    for (const m of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("hello");
        console.log(`✅ ${m}: Available`);
      } catch (e) {
        console.log(`❌ ${m}: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Fatal Error:", err.message);
  }
}

list();
