const http = require('http');

http.get('http://localhost:3000/practice?bank=ai', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("HTML length:", data.length);
    if (data.includes('No questions found matching your criteria')) {
      console.log("Found 'No questions found' in HTML!");
    } else {
      console.log("Questions ARE showing!");
    }
  });
}).on('error', (err) => {
  console.error(err);
});
