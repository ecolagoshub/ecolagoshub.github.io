# Eco Lagos Planner

## Where to edit what
| I want to change…                         | Open this file            |
|-------------------------------------------|---------------------------|
| Colours (green / white)                   | `css/base.css` (top)      |
| Logo, company name, greeting, menu names  | `js/common.js` (top)      |
| Login / Sign up page layout               | `login.html`, `css/login.css`, `js/login.js` |
| Add task page                             | `add.html`, `css/add.css`, `js/add.js`       |
| Calendar page                             | `calendar.html`, `css/calendar.css`, `js/calendar.js` |
| Month list page                           | `month.html`, `css/month.css`, `js/month.js` |
| Task card look / countdown wording        | `js/common.js` (`cardHTML`, `countdown`) and `css/base.css` |
| Firebase keys                             | `firebase-config.js`      |
| Who is allowed in                         | `firestore.rules` + `config/access` in Firestore |

`js/firebase.js` handles login checking and saving; you rarely need to touch it.

## Setup
### 1. Firebase
1. console.firebase.google.com > Add project.
2. Build > Authentication > Get started > enable **Email/Password**.
3. Build > Firestore Database > Create database (production mode).
4. Firestore > **Rules** tab: paste `firestore.rules` > Publish.
5. Firestore > **Data** tab: collection `config`, document ID `access`, field `code` (string) = your secret access code.
6. Project settings > Your apps > Web (`</>`) > register app. Paste the config into `firebase-config.js`.

### 2. GitHub Pages
1. Create a GitHub repo and upload everything in this folder (keep the `css`, `js`, `icons` folders).
2. Repo > Settings > Pages > Source: `main` branch, `/ (root)` > Save.
3. Site address: `https://USERNAME.github.io/REPO/`
4. Firebase > Authentication > Settings > **Authorized domains** > add `USERNAME.github.io`.

### 3. Use it
- Open the site > **Sign up** > email, password, access code.
- Share the code with anyone you want to allow. Change `code` in Firestore to stop new sign-ups.
- Phone: Android Chrome > menu > Install app. iPhone Safari > Share > Add to Home Screen.

## After editing a file
Upload the changed file to GitHub (replace the old one). Refresh the page; if you still see the old version, close and reopen the app once.
