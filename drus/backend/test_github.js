import db from './server/db.js';
import jwt from 'jsonwebtoken';

(async () => {
    const user = db.prepare("SELECT * FROM users WHERE email = 'testuser@gmail.com'").get();
    if (!user) return console.log('user not found');

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'drus-secret-key-2026', { expiresIn: '24h' });

    console.log("Connecting platform...");
    const res1 = await fetch('http://localhost:5001/api/platforms/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            platforms: {
                github: { username: 'torvalds', connected: true }
            }
        })
    });
    console.log(await res1.json());

    console.log("Syncing Github...");
    const res2 = await fetch('http://localhost:5001/api/platforms/github/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status:', res2.status);
    console.log(await res2.json());
})();
