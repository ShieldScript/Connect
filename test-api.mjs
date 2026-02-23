import fetch from 'node-fetch';

const baseUrl = 'https://connect-nu-three.vercel.app';

console.log('Testing API endpoints...\n');

// Test 1: Health check
try {
  console.log('1. Testing /api/health...');
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthResponse.json();
  console.log('✓ Health check:', healthData);
} catch (error) {
  console.log('❌ Health check failed:', error.message);
}

// Test 2: Home page
try {
  console.log('\n2. Testing home page...');
  const homeResponse = await fetch(baseUrl);
  console.log('Status:', homeResponse.status);
  console.log('Headers:', Object.fromEntries(homeResponse.headers));
  
  if (homeResponse.status === 200) {
    const contentType = homeResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const html = await homeResponse.text();
      console.log('✓ Home page loaded, length:', html.length);
      
      // Check for error messages in HTML
      if (html.includes('Application error')) {
        console.log('⚠️ Found "Application error" in HTML');
        const errorMatch = html.match(/Application error[^<]*/);
        if (errorMatch) console.log('Error text:', errorMatch[0]);
      }
    } else {
      console.log('Response:', await homeResponse.text());
    }
  } else {
    console.log('❌ Status:', homeResponse.status);
    console.log('Response:', await homeResponse.text());
  }
} catch (error) {
  console.log('❌ Home page failed:', error.message);
}
