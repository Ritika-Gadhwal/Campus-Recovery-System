const http = require('http');

// Helper to make POST/GET requests using standard Node.js http module (no dependencies needed)
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(dataString);
    req.end();
  });
};

const runTests = async () => {
  console.log('Starting API verification tests against backend running on port 5000...');

  try {
    // 1. Health Check
    console.log('\n--- 1. Verification: Health Check ---');
    const health = await request('GET', '/api/health');
    console.log(`Status: ${health.status}, Active: ${health.data.success}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register with Invalid Domain (should fail)
    console.log('\n--- 2. Verification: Registration Restriction ---');
    const registerInvalid = await request('POST', '/api/auth/register', {
      name: 'Hacker User',
      email: 'hacker@gmail.com',
      password: 'password123'
    });
    console.log(`Status: ${registerInvalid.status} (Expected: 400)`);
    console.log(`Message: ${registerInvalid.data.message}`);
    if (registerInvalid.status !== 400) throw new Error('Domain restriction failed');

    // 3. Login with Seeded Student User
    console.log('\n--- 3. Verification: Student Login ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'john.doe@mycollege.edu',
      password: 'password123'
    });
    console.log(`Status: ${loginRes.status} (Expected: 200)`);
    console.log(`Logged in: ${loginRes.data.name}, Token Issued: ${!!loginRes.data.token}`);
    if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Login failed');

    const token = loginRes.data.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 4. Get Current Profile
    console.log('\n--- 4. Verification: Get Authenticated Profile ---');
    const meRes = await request('GET', '/api/auth/me', null, authHeader);
    console.log(`Status: ${meRes.status} (Expected: 200)`);
    console.log(`Returned User Email: ${meRes.data.data?.email}`);
    if (meRes.status !== 200) throw new Error('Fetching profile failed');

    // 5. Query Seeded Items
    console.log('\n--- 5. Verification: Fetch Items & Filters ---');
    const itemsRes = await request('GET', '/api/items');
    console.log(`Status: ${itemsRes.status} (Expected: 200)`);
    console.log(`Total items seeded/found: ${itemsRes.data.data?.length}`);
    if (itemsRes.status !== 200 || !itemsRes.data.data) throw new Error('Fetching items failed');

    // 6. Test AI Matching Suggestions
    console.log('\n--- 6. Verification: AI-Based Matching Suggestions ---');
    // Let's find the ID of the 'Black Leather Wallet' (index 0) and check suggestions
    const walletItem = itemsRes.data.data.find(item => item.title.includes('Black Leather Wallet'));
    if (walletItem) {
      const suggestionsRes = await request('GET', `/api/items/${walletItem._id}/suggestions`);
      console.log(`Status: ${suggestionsRes.status} (Expected: 200)`);
      console.log(`Matches found: ${suggestionsRes.data.data?.length}`);
      suggestionsRes.data.data?.forEach(sugg => {
        console.log(`-> Suggestion: "${sugg.item.title}" - Similarity Score: ${sugg.score}%`);
      });
      if (suggestionsRes.status !== 200) throw new Error('AI matching suggestion request failed');
    } else {
      console.log('Skipping suggestions test (wallet item not found)');
    }

    console.log('\n=========================================');
    console.log('ALL BACKEND VERIFICATION CHECKS PASSED!');
    console.log('=========================================');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! VERIFICATION TEST FAILED !!!');
    console.error(error.message);
    process.exit(1);
  }
};

runTests();
