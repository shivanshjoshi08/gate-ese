async function run() {
  try {
    const res = await fetch("http://localhost:3000/practice?bank=ai");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log(text.substring(0, 1000));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
