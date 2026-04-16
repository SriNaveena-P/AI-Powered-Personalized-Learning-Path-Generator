require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testKey(key, name) {
  console.log(`\n--- Testing ${name} ---`);
  if (!key) { console.log('SKIPPING: Key is empty'); return false; }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello, are you working?');
    const text = result.response.text();
    console.log('✅ SUCCESS:', text);
    return true;
  } catch (err) {
    console.error(`❌ FAILED ${name}:`, err.message);
    if (err.stack) console.error(err.stack);
    return false;
  }
}

async function run() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract all keys including commented ones
  const keys = envContent.match(/AIzaSy[a-zA-Z0-9_-]+/g) || [];
  console.log(`Found ${keys.length} potential keys in .env`);
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const success = await testKey(key, `Key #${i+1}`);
    if (success) {
      console.log(`\n🏆 Key #${i+1} IS WORKING! Use this key.`);
    }
  }
}

run();
