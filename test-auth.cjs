const https = require('https');

const apiKey = "AIzaSyABQ-O6Bfbm8dE2z5zZhSl5--nFefSrzQ4";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

const data = JSON.stringify({
  email: "testdiagnostics2026@lottery.com",
  password: "password123",
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
    console.log("RESPONSE:", body);
  });
});

req.on('error', (e) => {
  console.error("ERROR:", e);
});

req.write(data);
req.end();
