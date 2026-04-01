import db from './server/db.js';

const row = db.prepare('SELECT COUNT(*) as c FROM github_repos').get();
console.log('github_repos count', row.c);
