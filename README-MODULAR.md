# Eco Lagos Planner — modular files

Upload all files and folders in this directory to the root of the GitHub Pages repository.

## Main files
- `index.html` — page structure and styling.
- `planner.js` — Firebase setup, authentication, shared task state and app coordination.
- `task-setup.js` — new-task form and saving.
- `calendar.js` — calendar rendering and day selection.
- `month-tasks.js` — monthly task list.
- `firebase-config.js` — Firebase web configuration (replace placeholders with the project's actual web app config).
- `firestore.rules` — Firestore security rules.
- `manifest.json`, `sw.js`, and `icons/` — installable PWA support.

Do not upload only `index.html`; the JavaScript modules must remain beside it in the repository root.
