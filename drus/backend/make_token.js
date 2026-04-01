import db from './server/db.js';
import jwt from 'jsonwebtoken';

const user = db.prepare("SELECT * FROM users WHERE email = 'testuser@gmail.com'").get();
if (!user) {
  console.error('User not found');
  process.exit(1);
}

const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'drus-secret-key-2026', { expiresIn: '24h' });
console.log(token);
