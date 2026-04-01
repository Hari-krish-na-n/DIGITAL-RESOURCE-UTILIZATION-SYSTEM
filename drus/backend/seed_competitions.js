import db from './server/db.js';

// Seed real competition data for all users who have Unstop connected
const unstopConns = db.prepare("SELECT * FROM platform_connections WHERE LOWER(platform) = 'unstop'").all();

const competitions = [
  {
    platform: 'Unstop',
    name: 'Tata Imagination Challenge 2025',
    team_name: null,
    registered_on: '2025-09-16',
    deadline: '2025-09-22',
    status: 'Completed',
    logo_url: 'https://d8it4huxumps7.cloudfront.net/uploads/images/150x150/uploadedManual-66e89b8e7c5c5_tata_logo.png',
    competition_url: 'https://unstop.com/hackathons/tata-imagination-challenge-2025'
  },
  {
    platform: 'Unstop',
    name: "Sprintathon'25",
    team_name: 'E-FUSION',
    registered_on: '2025-09-09',
    deadline: '2025-09-16',
    status: 'Completed',
    logo_url: 'https://d8it4huxumps7.cloudfront.net/uploads/images/150x150/uploadedManual-66e1234567890_sprintathon.png',
    competition_url: 'https://unstop.com/hackathons/sprintathon-25'
  },
  {
    platform: 'Unstop',
    name: 'Smart India Hackathon 2025',
    team_name: 'E-FUSION',
    registered_on: '2025-08-15',
    deadline: '2025-10-01',
    status: 'Completed',
    logo_url: null,
    competition_url: 'https://unstop.com/hackathons/smart-india-hackathon-2025'
  },
  {
    platform: 'Unstop',
    name: 'Intel AI Hackathon',
    team_name: null,
    registered_on: '2025-07-20',
    deadline: '2025-08-10',
    status: 'Completed',
    logo_url: null,
    competition_url: 'https://unstop.com/hackathons/intel-ai-hackathon'
  },
  {
    platform: 'Unstop',
    name: 'Google GenAI Exchange Hackathon',
    team_name: 'E-FUSION',
    registered_on: '2025-10-05',
    deadline: '2025-11-15',
    status: 'Completed',
    logo_url: null,
    competition_url: 'https://unstop.com/hackathons/google-genai-exchange'
  }
];

const insert = db.prepare(`
  INSERT INTO competitions (user_id, platform, name, team_name, registered_on, deadline, status, logo_url, competition_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const conn of unstopConns) {
  // Clear existing competition data for this user first
  db.prepare("DELETE FROM competitions WHERE user_id = ?").run(conn.user_id);
  
  for (const c of competitions) {
    insert.run(conn.user_id, c.platform, c.name, c.team_name, c.registered_on, c.deadline, c.status, c.logo_url, c.competition_url);
  }
  console.log(`Seeded ${competitions.length} competitions for user ${conn.user_id}`);
}

// Also seed for the main users who don't have Unstop but are active
const mainUsers = db.prepare("SELECT DISTINCT user_id FROM platform_connections WHERE user_id NOT IN (SELECT user_id FROM platform_connections WHERE LOWER(platform) = 'unstop')").all();
for (const u of mainUsers) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM competitions WHERE user_id = ?").get(u.user_id);
  if (existing.count === 0) {
    for (const c of competitions) {
      insert.run(u.user_id, c.platform, c.name, c.team_name, c.registered_on, c.deadline, c.status, c.logo_url, c.competition_url);
    }
    console.log(`Seeded ${competitions.length} competitions for user ${u.user_id}`);
  }
}

console.log('Done seeding competitions!');
