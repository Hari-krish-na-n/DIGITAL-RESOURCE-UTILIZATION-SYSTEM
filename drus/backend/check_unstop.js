import db from './server/db.js';
const unstops = db.prepare("SELECT * FROM learning_courses WHERE platform_id = 'unstop'").all();
console.log(JSON.stringify(unstops, null, 2));
const comps = db.prepare("SELECT * FROM competitions WHERE platform = 'unstop'").all();
console.log(JSON.stringify(comps, null, 2));
db.close();
