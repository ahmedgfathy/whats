// Quick backend connectivity test
const https = require('https');
const http = require('http');

const testUrls = [
  'http://localhost:3001/api/health',
  'http://localhost:3002/api/health',
  'http://localhost:3001/api/properties?limit=3',
  'http://localhost:3001/api/stats'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ 
            url, 
            status: res.statusCode, 
            success: true, 
            data: parsed 
          });
        } catch (e) {
          resolve({ 
            url, 
            status: res.statusCode, 
            success: false, 
            error: 'Invalid JSON response',
            data: data.substring(0, 200) 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ 
        url, 
        success: false, 
        error: error.message 
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ 
        url, 
        success: false, 
        error: 'Timeout' 
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing backend connectivity...\n');
  
  for (const url of testUrls) {
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.status}`);
      if (url.includes('health')) {
        console.log(`   Response: ${JSON.stringify(result.data)}`);
      } else if (url.includes('properties')) {
        console.log(`   Properties found: ${Array.isArray(result.data) ? result.data.length : 'Unknown'}`);
      } else if (url.includes('stats')) {
        console.log(`   Stats: ${JSON.stringify(result.data)}`);
      }
    } else {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${result.error}`);
      if (result.data) {
        console.log(`   Response: ${result.data.substring(0, 100)}...`);
      }
    }
    console.log('');
  }
}

runTests().catch(console.error);
