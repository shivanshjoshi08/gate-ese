const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("ts-node").register({ compilerOptions: { module: "commonjs" } });

const { listPracticeQuestionRows } = require("../backend/services/question.service");

async function run() {
  try {
    const result = await listPracticeQuestionRows({ sourceType: "pyq", search: "gate_ce_2024_53", limit: 10 });
    console.log(`Found ${result.items.length} items`);
    if (result.items.length > 0) {
      console.log("Item ID:", result.items[0].importKey);
    }
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
