const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const list = await genAI.listModels();
    for (const m of list.models) {
      console.log(`Model: ${m.name}, Methods: ${m.supportedGenerationMethods}`);
    }
  } catch (err) {
    console.error('List models failed:', err.message);
  }
}

listModels();
