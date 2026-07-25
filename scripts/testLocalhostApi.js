async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/questions/practice?sourceType=pyq&page=1&limit=50");
    const data = await res.json();
    console.log(`Page 1 returned ${data.dbQuestions ? data.dbQuestions.length : 0} questions`);
    const q53 = data.dbQuestions?.find(q => q.displayId === "gate_ce_2024_53");
    if (q53) {
      console.log("Found Q.53 in Page 1!");
      console.log(q53);
    } else {
      console.log("Not in page 1. Fetching page 2...");
      const res2 = await fetch("http://localhost:3000/api/questions/practice?sourceType=pyq&page=2&limit=50");
      const data2 = await res2.json();
      const q53_2 = data2.dbQuestions?.find(q => q.displayId === "gate_ce_2024_53");
      if (q53_2) {
        console.log("Found Q.53 in Page 2!");
        console.log(q53_2);
      } else {
        console.log("Not in page 2 either!");
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
