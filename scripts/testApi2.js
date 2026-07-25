async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/questions/practice?sourceType=practice");
    console.log("Status:", res.status);
    if (!res.ok) {
      console.log(await res.text());
    } else {
      const data = await res.json();
      console.log(`Success! Fetched ${data.dbQuestions?.length} questions.`);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
