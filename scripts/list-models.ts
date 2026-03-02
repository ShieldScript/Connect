import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log('🔍 Fetching available Gemini models...\n');
  
  try {
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    for await (const model of models) {
      console.log(`📌 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:', error);
  }
}

listModels();
