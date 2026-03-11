# StockScan — Vercel Deployment Guide

## Deploy in 5 steps (free, ~5 minutes)

### Step 1 — Create a free Vercel account
Go to https://vercel.com and sign up (use GitHub login for easiest setup).

### Step 2 — Upload this project to GitHub
1. Go to https://github.com and create a new repository called `stockscan`
2. Upload all files from this folder into the repository

### Step 3 — Import into Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `stockscan` repo
4. Click Deploy — Vercel auto-detects it's a React app

### Step 4 — Add your Anthropic API key (IMPORTANT)
1. In Vercel: Settings → Environment Variables
2. Add: Name = ANTHROPIC_KEY, Value = your key from https://console.anthropic.com
3. Save → Redeploy

### Step 5 — Open on Android
1. Vercel gives you a URL like https://stockscan-xyz.vercel.app
2. Open in Chrome on Android
3. Tap 3-dot menu → Add to Home Screen
4. StockScan is on your phone like a native app!

## Get your Anthropic API key
Go to https://console.anthropic.com → API Keys → Create Key
