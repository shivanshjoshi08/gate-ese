const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// Register ts-node to compile TypeScript
require("ts-node").register({
  compilerOptions: {
    module: "commonjs"
  }
});

// Polyfill fetch if needed (Node 18+ has it natively)

const { listPracticeQuestionRows } = require("../backend/services/question.service");
const { leanRowToPracticeQuestion } = require("../backend/mappers/question.mapper");

async function run() {
  try {
    const result = await listPracticeQuestionRows({ sourceType: "pyq", limit: 100 });
    console.log(`Fetched ${result.items.length} pyq items`);
    
    let q53 = result.items.find(r => r.importKey === "gate_ce_2024_53");
    if (q53) {
      console.log("Found Q.53 in DB output!");
      const mapped = leanRowToPracticeQuestion(q53);
      console.log("Mapped Q.53 successfully:", mapped ? mapped.displayId : "null");
    } else {
      console.log("Did not find Q.53 in the items!");
    }
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
