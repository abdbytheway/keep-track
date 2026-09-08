# Keep Track

A simple monthly expense tracker. Sign in with Google, log expenses, see a monthly
summary and category breakdown, and export any month as a PDF. Built as a static
site (no backend server) using Firebase for auth + storage, deployable straight
to GitHub Pages.

## Features

- Google sign-in (Firebase Authentication)
- Add / delete expense transactions (category, amount, merchant, date, notes)
- Dashboard: monthly totals, average per transaction, top category, 3-month spending trend, category breakdown
- Full transaction ledger with search, category filter, sorting, and pagination
- PDF export of any month's expenses
- Data retention: only the current month + previous 2 months (rolling 3-month window) are ever kept — older data is automatically deleted on sign-in

## Project structure

```
index.html          Sign-in page
dashboard.html       Main dashboard
transactions.html    Full expense ledger
settings.html         Account + data controls
assets/js/            All app logic (ES modules)
firestore.rules       Firestore security rules (per-user data isolation)
firestore.indexes.json Required Firestore composite index definitions
```

## Firebase setup

1. Create a project at https://console.firebase.google.com (this one is set up as **Keep Track**).
2. **Authentication → Sign-in method** → enable **Google**.
3. **Firestore Database** → create a database (production mode is fine — the rules below lock it down).
4. Firestore → **Rules** → paste in the contents of `firestore.rules` from this repo → Publish.
5. Firestore → **Indexes** → **Add index** → collection `transactions`, fields `monthKey` (Ascending) then `date` (Descending) → Create. (Matches `firestore.indexes.json` in this repo.) The dashboard and transaction ledger queries by month and sorts by date, so this composite index is required — without it, Firestore throws a `failed-precondition` error and the dashboard silently shows no data.
6. **Project settings → General → Your apps** → add a **Web app** → copy the `firebaseConfig` object.
7. Paste those values into `assets/js/firebase-config.js` in this repo.
8. In Authentication → Settings → **Authorized domains**, add your GitHub Pages domain (e.g. `<username>.github.io`) so sign-in works once deployed.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
3. Your app will be live at `https://<username>.github.io/<repo-name>/`.

## Data model

Firestore: `users/{uid}/transactions/{transactionId}`

```
{
  amount: number,
  category: "housing" | "food" | "transport" | "shopping" | "entertainment" | "utilities" | "health" | "other",
  merchant: string,
  note: string,
  date: "YYYY-MM-DD",
  monthKey: "YYYY-MM",
  createdAt: server timestamp
}
```

## Local preview

No build step — just serve the folder statically, e.g.:

```
python3 -m http.server 8080
```

then open `http://localhost:8080`. (Opening `index.html` directly via `file://`
won't work because ES modules and Firebase's SDK require an http(s) origin.)
