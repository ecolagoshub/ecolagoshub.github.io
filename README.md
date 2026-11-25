# Eco Lagos Planner – setup

## 1. Firebase
1. console.firebase.google.com > Add project.
2. Build > Authentication > Get started > enable **Email/Password**.
3. Build > Firestore Database > Create database (production mode).
4. Firestore > **Rules** tab: paste the contents of `firestore.rules` > Publish.
5. Firestore > **Data** tab: create collection `config`, document ID `access`, field `code` (string) = your secret access code.
6. Project settings > Your apps > Web (`</>`) > register app. Copy the config into `firebase-config.js`.

## 2. GitHub Pages
1. Create a GitHub repo and upload everything in this folder (keep `icons/`).
2. Repo > Settings > Pages > Source: `main` branch, `/ (root)` > Save.
3. Your site will be at `https://USERNAME.github.io/REPO/`.
4. Firebase > Authentication > Settings > **Authorized domains** > add `USERNAME.github.io`.

## 3. Use it
- Open the site, tap **Sign up**, enter email, password and your access code. You are now a member.
- Give the code to anyone you want to allow. To lock out new sign-ups, change the `code` value in `config/access`.
- On the phone: Chrome > menu > Install app / Add to Home screen. iPhone: Safari > Share > Add to Home Screen.

## Notes
- Each person sees only their own tasks.
- The code is checked by Firestore rules on the server, so it cannot be bypassed from the browser. Use a long, hard-to-guess code, since anyone can try guesses.
- Existing members stay members when you change the code; remove a person by deleting their user in Authentication.
