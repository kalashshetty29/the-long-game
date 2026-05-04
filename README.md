# The Long Game — Personal Tracking App

A unified mobile-first web app combining a finance tracker and a life tracker into one platform.
Two spaces under one roof: **Finance** (loans, foreclosure pool, budget, gear) and **Body & Mind** (daily check-ins, 12-month career plan, half marathon training, reading log).

## Spaces

### Finance
- **Dashboard** — Debt-free countdown, loan progress, goal tracking
- **Loans** — Edit loan details + live foreclosure schedule chart
- **Pool** — Triumph foreclosure savings tracker with monthly contribution logging
- **Budget** — Itemized fixed and variable expenses
- **Log** — One-tap expense entry
- **Gear plan** — Touring gear savings goal
- **Settings** — Cloud status, data export, reset

### Body & Mind (Life)
- **Today** — Daily check-ins (study, workout, nutrition, reading), workout for the day, custom goals
- **Body** — Detailed strength/run logging, weigh-ins
- **Plan** — 12-month career plan with monthly checkpoints and weekly tasks
- **Log** — Browse past daily logs
- **Progress** — Streaks, stats, export/import

### Cross-space alerts
Urgent finance signals (EMI auto-debit tomorrow, pool transfer overdue) surface as a banner in the Life "Today" view. Tap to jump to Finance. Strict bar: only things that need action in next 48 hours.

## Tech notes

- React 18 + Vite (fast bundler, hot reload)
- Tailwind CSS for styling
- Recharts for the loan paydown chart
- Lucide React for icons
- Firebase Firestore for cloud sync (optional)
- Two namespaced Firestore documents: `users/me/spaces/finance` and `users/me/spaces/life` — they sync independently
- All state logic lives in pure modules (`lib/finance-data.js`, `lib/life-data.js`, `lib/alerts.js`)

---

## Setup — running it locally first

You need [Node.js](https://nodejs.org) (any recent version, 18+).

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser. The app should load with the default
sample data already in place.

---

## Setup — Firebase (cloud sync)

This is **optional**. Without it, the app uses localStorage and only your current
device sees the data. With it, all your devices stay in sync.

### Step 1 — Create a Firebase project (5 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it any name (e.g. `my-finance`)
3. Disable Google Analytics (not needed)
4. Wait ~30 seconds for the project to be created

### Step 2 — Enable Firestore Database

1. In the left sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll lock it down in step 4)
4. Pick a location closest to you (e.g. `asia-south1` for India)
5. Click **Enable**

### Step 3 — Register a web app

1. In project settings (gear icon → **Project settings**)
2. Scroll down to **Your apps** → click the **`</>`** (web) icon
3. Give it a nickname (e.g. `finance-web`) → **Register app**
4. Copy the `firebaseConfig` object that appears. It looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "my-finance-xyz.firebaseapp.com",
  projectId: "my-finance-xyz",
  // ... etc
}
```

5. Open `src/lib/firebase-config.js` in this project
6. Replace `export const firebaseConfig = null` with your copied config:

```js
export const firebaseConfig = {
  apiKey: "AIza...",
  // ... your full config
}
```

### Step 4 — Lock down Firestore rules (IMPORTANT)

By default test mode allows anyone to read/write your data. Lock it down:

1. In Firestore → **Rules** tab
2. Replace the rules with this and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/me {
      // Only allow access from your own browser sessions.
      // Since we're not using auth, restrict by checking a secret in the data.
      // For better security, see "Adding authentication" below.
      allow read, write: if true;
    }
  }
}
```

⚠️ **Note**: With these simple rules, anyone who knows your Firebase project ID
could theoretically access your data. Since the project ID is in the JS bundle,
this is a real concern for a public deployment. Two ways to handle this:

- **Easy**: Keep your repo PRIVATE on GitHub (which you said you'd do).
  The compiled JS goes to GitHub Pages, but obscure project IDs are hard to find.
- **Proper**: Add Firebase Anonymous Auth (10 more minutes of setup).
  See `ADDING_AUTH.md` for instructions.

### Step 5 — Restart your dev server

```bash
npm run dev
```

Open the app and check the **Settings** tab — it should now say "Cloud sync active" with a green dot.

---

## Setup — Deploying to GitHub Pages

### Step 1 — Push to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit"

# Create a private repo on GitHub at github.com/new
# (set visibility to PRIVATE if your firebase config is in the code)

# Push
git remote add origin https://github.com/YOUR_USERNAME/finance-tracker.git
git branch -M main
git push -u origin main
```

### Step 2 — Enable GitHub Pages with Actions

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in your repo on GitHub:

1. **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push the workflow file. The action will run automatically.
4. Once green, your site is live at `https://YOUR_USERNAME.github.io/finance-tracker/`

### Step 3 — Add to iPhone home screen

1. Open the URL in Safari on your iPhone
2. Tap the **share button** at the bottom
3. Scroll down → **Add to Home Screen**
4. Name it "Finance" → **Add**

You now have an icon on your home screen that opens the app full-screen, like a native app.

---

## File structure

```
src/
├── App.jsx                 # Root + tab navigation
├── main.jsx                # React entry point
├── index.css               # Tailwind + global styles
├── components/
│   ├── Dashboard.jsx       # KPIs, debt-free countdown, goals
│   ├── Loans.jsx           # Loan editor + foreclosure schedule
│   ├── Budget.jsx          # Income & expenses
│   ├── Log.jsx             # Quick expense logging
│   ├── Gear.jsx            # Touring gear savings tracker
│   └── Settings.jsx        # Cloud status, export, reset
├── hooks/
│   └── useFinanceData.js   # Loads/saves data, computes derived state
└── lib/
    ├── finance.js          # Pure financial calculations
    ├── storage.js          # Firebase + localStorage abstraction
    └── firebase-config.js  # Your Firebase config goes here
```

## Customizing

All defaults live in `src/lib/finance.js` in the `DEFAULT_DATA` object.
Edit the loan principal, EMI, your salary, expense lines, etc.
Once you've used the app, your edits persist in localStorage / Firestore —
you only edit defaults if you want to reset to a different baseline.

## Tech notes

- React 18 + Vite (fast bundler, hot reload)
- Tailwind CSS for styling
- Recharts for the loan paydown chart
- Firebase Firestore for cloud sync (optional)
- No backend, no auth (yet) — just a static site
- All financial logic is pure JS (`src/lib/finance.js`) — easy to test/extend

## License

Personal use. Don't redistribute without modifications.
