const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Testing gemini-1.5-flash...');
    const result = await models.generateContent('Hi');
    console.log('Success!', result.response.text());
  } catch (err) {
    console.error('gemini-1.5-flash failed:', err.message);
  }

  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Testing gemini-pro...');
    const result = await models.generateContent('Hi');
    console.log('Success!', result.response.text());
  } catch (err) {
    console.error('gemini-pro failed:', err.message);
  }
}

listModels();
