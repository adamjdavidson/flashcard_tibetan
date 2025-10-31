#!/usr/bin/env node
/**
 * Quick test script to verify Gemini API key works for image generation
 * 
 * Usage:
 *   GEMINI_API_KEY=your-key-here node test-gemini-api.js
 */

const apiKey = process.env.GEMINI_API_KEY || process.env.IMAGE_GENERATION_API_KEY;

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY or IMAGE_GENERATION_API_KEY environment variable not set');
  console.log('\nUsage:');
  console.log('  GEMINI_API_KEY=your-key node test-gemini-api.js');
  process.exit(1);
}

async function testGeminiImageGeneration() {
  console.log('🧪 Testing Gemini API key for image generation...\n');
  console.log(`📡 Using API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    const modelName = 'gemini-2.5-flash-image';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: 'Create a simple illustration of an eye, educational style, clean background'
        }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    };

    console.log('📤 Sending request to Gemini API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Error: ${JSON.stringify(errorData, null, 2)}`);
      
      if (response.status === 403) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - Check if API key is correct');
        console.log('   - Make sure Generative Language API is enabled in Google Cloud Console');
        console.log('   - Verify API key restrictions allow this usage');
      } else if (response.status === 400) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - Check if the model name is correct');
        console.log('   - Verify request format matches Gemini API spec');
      }
      process.exit(1);
    }

    const data = await response.json();

    if (data.candidates && 
        data.candidates[0]?.content?.parts && 
        data.candidates[0].content.parts[0]?.inlineData?.data) {
      console.log('✅ SUCCESS! API key works for image generation!\n');
      console.log(`📦 Response received: ${data.candidates.length} candidate(s)`);
      console.log(`🖼️  Image data size: ${data.candidates[0].content.parts[0].inlineData.data.length} bytes (base64)`);
      console.log(`📐 MIME type: ${data.candidates[0].content.parts[0].inlineData.mimeType || 'image/png'}\n`);
      console.log('✅ Your API key is configured correctly and ready to use!');
      console.log('\n📝 Next step: Add it to .env.local as:');
      console.log(`   GEMINI_API_KEY=${apiKey}`);
      console.log(`   IMAGE_GENERATION_API_KEY=${apiKey}`);
      console.log(`   IMAGE_GENERATION_SERVICE=gemini`);
    } else {
      console.error('❌ Unexpected response format:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check your internet connection');
    console.error('   - Verify API key is correct');
    console.error('   - Make sure you can access generativelanguage.googleapis.com');
    process.exit(1);
  }
}

testGeminiImageGeneration();

