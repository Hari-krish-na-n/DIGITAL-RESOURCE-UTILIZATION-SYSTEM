import db from './server/db.js';

// Check schema
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
console.log('Users schema:', schema?.sql);

// Check all users
const users = db.prepare('SELECT id, username, email, password FROM users').all();
console.log('Users count:', users.length);
users.forEach(u => {
    console.log('User:', { id: u.id, username: u.username, email: u.email, hasPassword: !!u.password, pwdLen: u.password?.length });
});
