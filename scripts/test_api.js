const http = require('http');

async function test() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/questions/practice?sourceType=practice&page=1&limit=50', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

test().then(console.log).catch(console.error);
