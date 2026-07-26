const http = require("http");

http.get("http://localhost:3000/api/questions/practice?bank=ai&search=gate_ce_2024", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      console.log(`Found ${parsed.dbQuestions.length} questions`);
      const q65 = parsed.dbQuestions.find(q => q.displayId === "gate_ce_2024_65");
      console.log(JSON.stringify(q65, null, 2));
    } catch (e) {
      console.error(e);
      console.log("Raw response:", data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
