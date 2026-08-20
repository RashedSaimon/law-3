# Deploying to Netlify

This project is fully configured for seamless deployment on **Netlify** using Netlify Functions and Netlify CDN for static assets.

---

## 🚀 Quick Deployment Guide

### Option 1: Deploy via GitHub (Recommended)
1. **Push your code to GitHub** (or export this project as a ZIP / Git repository).
2. Go to [Netlify](https://app.netlify.com) and click **"Add new site"** > **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build Command:** `npm run build`
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. *(Optional)* In **Site configuration > Environment variables**, you can set:
   - `SESSION_SECRET` (e.g. any random secure string)
   - Firebase variables from `.env.example` if you prefer environment variables over committing `firebase-applet-config.json`.
6. Click **"Deploy site"**.

---

### Option 2: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Link or initialize site:
   ```bash
   netlify init
   ```
3. Test locally with Netlify Dev:
   ```bash
   netlify dev
   ```
4. Deploy to production:
   ```bash
   netlify deploy --prod
   ```

---

## 🛠 Architecture & How It Works
- **Static Assets:** Files in `public/assets/` and `public/uploads/` are served with global Netlify CDN caching.
- **Serverless Backend:** Dynamic routes and the CMS admin control panel are powered by an Express handler wrapped with `serverless-http` under `netlify/functions/server.ts`.
- **Database:** Connects directly to Google Cloud Firestore, keeping all content, articles, team members, and settings synced across deployments.
