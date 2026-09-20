# SardaSir ERP - Complete Backup

**Backup Date:** 2026-09-21  
**Backup Purpose:** Complete project backup with all credentials, code, and history  
**Backup Privacy:** PRIVATE REPO - Contains sensitive information (API keys, database credentials)

---

## 📁 What's in this Backup

This repository contains **the complete SardaSir ERP project** including:

- ✅ All source code (React frontend, TypeScript)
- ✅ All git history and branches (`lawmind-latest`, `master`, `main`)
- ✅ `.env` files with Supabase credentials
- ✅ Database migration files
- ✅ Build outputs (`dist/` folder)
- ✅ Node modules reference
- ✅ **`lawmind-deploy-main` branch — the ACTUAL LIVE production app** (full `src/`, `api/`, `migrations/`, its own `.env`) pushed here separately because it lives in its own nested git repo

### ⚠️ IMPORTANT — Branch Map (read this first)

This backup repo has **4 branches**, each holding a different piece of the project. They are NOT the same content — pick the right one:

| Branch | Source | What it contains |
|--------|--------|-------------------|
| `main` | Parent repo's `lawmind-latest` | Old/legacy `dist/`, `Sardasirproject/`, root `.env`, `.vercel` — **does NOT contain the live app's source code** |
| `lawmind-latest` | Parent repo | Same as `main` above (identical) |
| `master` | Parent repo's `master` branch | Legacy branch, split history |
| **`lawmind-deploy-main`** | **`LawmindDeploy/` (its own independent repo)** | **The real, live, deployed LawMind AI app** — full `src/`, `api/`, `migrations/`, `package.json`, its own `.env`. This is what's running at lawmind-ai.vercel.app. **If you only restore one branch, restore this one.**

---

## 🔐 Sensitive Information Stored Here

**KEEP THIS REPO PRIVATE** - Contains:

| Item | Location | Type |
|------|----------|------|
| Supabase URL | `.env`, `Sardasirproject/.env` | Database Endpoint |
| Supabase Anon Key | `.env`, `Sardasirproject/.env` | API Key |
| Supabase RLS Policies | `LawmindDeploy/migrations/` | Database Rules |
| Vercel Project ID | `.vercel/project.json` | Deployment Config |
| Cloudinary API Keys | `.env` | File Storage Keys |

⚠️ **If this repo is ever made public, rotate ALL credentials immediately.**

---

## 🔗 Related Repositories

| Repo | Purpose | Status |
|------|---------|--------|
| [Lawmind_Ai](https://github.com/Sauravambuskar/Lawmind_Ai) | Live LawMind App | Production |
| [Sardasirproject](https://github.com/Sauravambuskar/Sardasirproject) | Parent/Utility Repo | Legacy |
| **Backup_SardaSirERP** (this repo) | Complete Backup | Backup Only |

---

## 📊 Project Structure

```
E:\SARDA SIR PROJECT\SardaSir_AI/
├── .git/                          # Parent git repo
├── .env                           # Supabase & API credentials
├── .vercel/                       # Vercel deployment config
├── LawmindDeploy/                 # LIVE APP (nested .git)
│   ├── src/                       # React source code
│   ├── api/                       # Vercel serverless functions
│   ├── migrations/                # Database migrations
│   ├── package.json               # Dependencies
│   ├── vercel.json                # Vercel config
│   └── dist/                      # Production build
├── Sardasirproject/               # Utility/testing folder
│   ├── .env                       # Another credentials file
│   ├── artifacts/                 # Artifacts & backups
│   └── scripts/                   # Utility scripts
└── dist/                          # Legacy build output
```

---

## 🚀 How to Restore This Backup

### Option 1: Clone the entire backup
```bash
git clone https://github.com/Sauravambuskar/Backup_SardaSirERP.git
cd Backup_SardaSirERP
npm install  # in LawmindDeploy folder
```

### Option 2: Pull into existing project
```bash
cd /path/to/existing/project
git remote add backup https://github.com/Sauravambuskar/Backup_SardaSirERP.git
git fetch backup --all
git merge backup/lawmind-latest  # or your branch name
```

---

## 🔑 Credentials Location

**All `.env` files in this backup contain real, active credentials:**

1. **Root `.env`** — Supabase connection details
2. **`Sardasirproject/.env`** — Additional environment variables
3. **`LawmindDeploy/.env`** — API keys for the live app

**To use this backup:**
- These credentials are **live and active** on the production Supabase instance
- If credentials are compromised, rotate them immediately in Supabase dashboard
- Never share this repo link publicly

---

## 📝 Git Branches in this Backup

| Branch | Purpose | Last Commit |
|--------|---------|------------|
| `lawmind-latest` | Parent repo, current work | c6d780e7 |
| `master` | Legacy branch | 1d3a56af |
| `main` (LawmindDeploy) | Live app main branch | c2126b5 |

---

## ⚠️ Known Issues in This Backup

1. **Nested Git Repositories** - `LawmindDeploy/.git` is a separate repo inside parent repo (confusing structure)
2. **No `.gitignore`** - `node_modules/` and `dist/` are tracked (large repo size)
3. **Credentials in Git History** - `.env` files are committed (security risk)
4. **Untracked Folders** - `.vscode/`, `LawmindDeploy/` folders are untracked in parent

**These will be fixed in cleanup branch.**

---

## 🛠️ To Restore and Fix

```bash
# 1. Clone this backup
git clone https://github.com/Sauravambuskar/Backup_SardaSirERP.git
cd Backup_SardaSirERP

# 2. Keep only LawmindDeploy
rm -rf Sardasirproject dist node_modules

# 3. Create proper .gitignore
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore

# 4. Reinstall dependencies
cd LawmindDeploy
npm install
npm run build

# 5. Push clean version to production
git push origin main
```

---

## 👤 Project Owner

**Saurav Ambuskar**  
📧 Stuartsjam@gmail.com  
🎯 Project: AI Law Mind (ERP for Lawyers)  
🏢 Location: Akola & Washim, Maharashtra, India  

---

## 📅 Backup History

| Date | Action | Details |
|------|--------|---------|
| 2026-09-21 | Initial Backup | Complete project push to Backup_SardaSirERP |
| - | - | - |

---

## ⚡ Emergency Recovery

**If production is down and you need to recover:**

1. Clone this backup repo
2. The `.env` files have live credentials - use them immediately
3. Ensure Supabase is accessible
4. Redeploy from `LawmindDeploy` folder
5. Verify all API connections

---

**Last Updated:** 2026-09-21  
**Repo Status:** BACKUP (Private, Credentials Stored)  
**Keep This Link Safe** 🔐
