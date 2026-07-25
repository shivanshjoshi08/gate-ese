const katex = require('katex');

const str = 'y = \\frac{e^x}{2} + Ce^{-x}';
try {
  const html = katex.renderToString(str, {
    displayMode: false,
    throwOnError: false,
  });
  console.log(html);
} catch (err) {
  console.log('Error:', err);
}
