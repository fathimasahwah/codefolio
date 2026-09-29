import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI);
await User.deleteMany({ username: { $in: ['demo1', 'demo2', 'demo3'] } });
const passwordHash = await bcrypt.hash('password123', 10);
const mk = (username, extra) => ({ username, email: `${username}@example.com`, passwordHash, ...extra });
const shot = (file) => `/demo/${file}.svg`;

await User.create([
  mk('demo1', {
    templateId: 'minimalist',
    profile: { name: 'Ada Lovelace', bio: 'Full stack developer who cares about clean APIs, readable code and fast interfaces.', resumeUrl: 'https://example.com/ada.pdf', socials: [{ label: 'GitHub', url: 'https://github.com' }, { label: 'LinkedIn', url: 'https://linkedin.com' }] },
    projects: [
      { title: 'Analytical Engine', description: 'A browser simulator for a mechanical computer, with a step debugger.', techStack: ['React', 'Node', 'MongoDB'], repoLink: 'https://github.com', liveLink: 'https://example.com', screenshot: shot('analytical-engine') },
      { title: 'Notes API', description: 'REST API with JWT auth, pagination and full-text search.', techStack: ['Express', 'MongoDB'], repoLink: 'https://github.com' },
    ],
    skills: [{ category: 'Frontend', items: ['React', 'CSS', 'Vite'] }, { category: 'Backend', items: ['Node', 'Express', 'MongoDB'] }, { category: 'DevOps', items: ['Docker'] }],
  }),
  mk('demo2', {
    templateId: 'cyberpunk', pro: true,
    profile: { name: 'Neo Kumar', bio: 'Security-minded engineer building fast, neon-bright developer tools.', socials: [{ label: 'GitHub', url: 'https://github.com' }] },
    projects: [{ title: 'PortScan.js', description: 'Async port scanner with a live terminal UI.', techStack: ['Node', 'WebSocket'], repoLink: 'https://github.com', screenshot: shot('portscan') }],
    skills: [{ category: 'Backend', items: ['Node', 'Express'] }, { category: 'DevOps', items: ['Docker', 'Nginx', 'GitHub Actions'] }],
  }),
  mk('demo3', {
    templateId: 'corporate',
    profile: { name: 'Priya Nair', bio: 'Software engineer focused on reliable, well-tested web platforms for growing teams.', socials: [{ label: 'LinkedIn', url: 'https://linkedin.com' }] },
    projects: [{ title: 'Billing Dashboard', description: 'Usage-based billing dashboard with role-based access.', techStack: ['React', 'Express', 'PostgreSQL'], repoLink: 'https://github.com', liveLink: 'https://example.com', screenshot: shot('billing') }],
    skills: [{ category: 'Frontend', items: ['React', 'TypeScript'] }, { category: 'Backend', items: ['Node', 'PostgreSQL'] }, { category: 'DevOps', items: ['AWS', 'CI/CD'] }],
  }),
]);
console.log('Seeded demo1 (minimalist), demo2 (cyberpunk, Pro), demo3 (corporate). Password: password123');
process.exit();
