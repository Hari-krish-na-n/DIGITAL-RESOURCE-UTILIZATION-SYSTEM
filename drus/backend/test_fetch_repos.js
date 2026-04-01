const token = process.argv[2];
if (!token) {
  console.error('Usage: node test_fetch_repos.js <token>');
  process.exit(1);
}

const res = await fetch('http://localhost:5001/api/stats/repos', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('status', res.status);
const body = await res.text();
console.log(body);
