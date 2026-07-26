const http = require("http");

http.get("http://localhost:3000/api/questions/practice?bank=ai&search=gate_ce_2024_65", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.dbQuestions[0], null, 2));
    } catch (e) {
      console.error(e);
      console.log("Raw response:", data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
