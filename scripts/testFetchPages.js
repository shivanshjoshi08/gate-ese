async function run() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    console.log(`Fetching page ${page}...`);
    const res = await fetch(
      `http://localhost:3000/api/questions/practice?sourceType=practice&page=${page}&limit=50`
    );
    const data = await res.json();
    all.push(...(data.dbQuestions ?? []));
    totalPages = data.totalPages ?? 1;
    page += 1;
  }
  console.log(`Fetched total ${all.length} questions.`);
  console.log(all.map(q => q.displayId).filter(id => id && id.includes("58")));
}
run();
