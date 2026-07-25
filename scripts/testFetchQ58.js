async function run() {
  try {
    let page = 1;
    let found = false;
    let totalItems = 0;
    while (true) {
      const res = await fetch(`http://localhost:3000/api/questions/practice?sourceType=practice&page=${page}&limit=50`);
      const data = await res.json();
      if (!data.dbQuestions || data.dbQuestions.length === 0) break;
      
      totalItems += data.dbQuestions.length;
      console.log(`Page ${page}: got ${data.dbQuestions.length} items`);
      
      const q58 = data.dbQuestions.find(q => q.displayId === "gate_ce_2024_58" || (q.id && q.id.includes("58")) || (q.question && q.question.includes("2 m")));
      if (q58) {
        console.log("Found Q.58:");
        console.log(JSON.stringify(q58, null, 2));
        found = true;
      }
      
      if (page >= (data.totalPages || 1)) break;
      page++;
    }
    console.log(`Total fetched: ${totalItems}`);
    if (!found) console.log("Q.58 NOT FOUND in API response!");
  } catch (err) {
    console.error(err);
  }
}
run();
