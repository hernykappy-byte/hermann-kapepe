# Grand Quiz - World Quiz Platform

An interactive full-stack trivia platform featuring real-time blitz rounds, regional & team standings, AI question generation with per-option factual breakdowns, and offline question fallbacks.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` in `.env` (optional: the application includes a comprehensive built-in offline question bank if no API key is set).

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```
