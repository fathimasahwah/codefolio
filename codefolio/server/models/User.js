import mongoose from 'mongoose';

export const TEMPLATES = ['minimalist', 'cyberpunk', 'corporate'];
export const CATEGORIES = ['Frontend', 'Backend', 'DevOps'];

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 600 },
  techStack: [String],
  repoLink: String,
  liveLink: String,
  screenshot: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_-]{3,30}$/ },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  templateId: { type: String, enum: TEMPLATES, default: 'minimalist' },
  pro: { type: Boolean, default: false },
  customDomain: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  profile: {
    name: { type: String, trim: true, maxlength: 80 },
    bio: { type: String, trim: true, maxlength: 500 },
    resumeUrl: String,
    socials: [{ _id: false, label: String, url: String }],
  },
  projects: [projectSchema],
  skills: [{ _id: false, category: { type: String, enum: CATEGORIES }, items: [String] }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
