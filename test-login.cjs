const https = require('https');

const apiKey = "AIzaSyABQ-O6Bfbm8dE2z5zZhSl5--nFefSrzQ4";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

const data = JSON.stringify({
  email: "smswinsms@gmail.com",
  password: "admin123",
  returnSecureToken: true
});

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    const parsed = JSON.parse(body);
    if (parsed.error) {
       console.log("ERROR MESSAGE:", parsed.error.message);
    } else {
       console.log("SUCCESS! Logged in as:", parsed.email);
    }
  });
});

req.on('error', (e) => {
  console.error("NETWORK ERROR:", e);
});

req.write(data);
req.end();
