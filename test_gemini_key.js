require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Say "Hello World" if you are working.');
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
