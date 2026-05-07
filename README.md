# Guthrie Syllabus Submission

GitHub Pages frontend + Google Apps Script backend for collecting structured teacher syllabus content.

## Files

- `index.html` — main form
- `styles.css` — Guthrie-styled layout
- `script.js` — form behavior, draft save, submission
- `data/syllabusData.js` — teacher/course roster data
- `apps-script/Code.gs` — Google Apps Script backend for the response spreadsheet
- `assets/` — Guthrie logos and campus image assets

## Setup

### 1. Upload files to GitHub

Add these files to the repository:

`https://github.com/Guthrie-Center/guthrie-syllabus-submission.git`

Recommended: upload everything except this README can be edited as needed.

### 2. Turn on GitHub Pages

In GitHub:

Settings > Pages > Build and deployment

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

Save.

Your form will eventually publish at something like:

`https://guthrie-center.github.io/guthrie-syllabus-submission/`

### 3. Create Apps Script backend

Open the Google Sheet named **Guthrie Syllabus Submission**.

Go to:

Extensions > Apps Script

Paste the contents of:

`apps-script/Code.gs`

Save.

Deploy:

Deploy > New deployment > Web app

Settings:

- Execute as: Me
- Who has access: Anyone with the link

Copy the Web App URL.

### 4. Add the Apps Script URL to the form

Open `script.js`.

Replace:

`PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`

with the Web App URL from Apps Script.

Commit the updated file.

### 5. Test

Open the GitHub Pages form.

Submit a test entry.

Confirm the Google Sheet now has a tab named:

`Submissions`

and that the test row appears.

## Notes

- Teachers can use **Save Draft on This Computer** before submitting.
- Drafts are saved in the browser only, not the Google Sheet.
- Submitted responses are upserted by syllabus key, so a teacher can resubmit the same course and replace the prior row.
- Campus policy language is not collected here; it will be inserted later into the final branded syllabus.
