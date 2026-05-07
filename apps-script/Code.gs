/**
 * Guthrie Syllabus Submission Backend
 *
 * Recommended setup:
 * 1. Open the Google Sheet named "Guthrie Syllabus Submission".
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into Code.gs.
 * 4. Deploy > New deployment > Web app.
 * 5. Execute as: Me.
 * 6. Who has access: Anyone with the link.
 * 7. Copy the Web App URL into script.js CONFIG.WEB_APP_URL.
 */

const SUBMISSIONS_SHEET = "Submissions";

function doPost(e) {
  try {
    const payloadText = e.parameter.payload || "{}";
    const payload = JSON.parse(payloadText);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSubmissionsSheet_(ss);
    const row = flattenPayload_(payload);
    upsertByKey_(sheet, row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: "Guthrie Syllabus Submission backend is live." });
}

function getOrCreateSubmissionsSheet_(ss) {
  let sheet = ss.getSheetByName(SUBMISSIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SUBMISSIONS_SHEET);
  }
  const headers = getHeaders_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    if (existing[0] !== "Key") {
      sheet.clear();
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getHeaders_() {
  const base = [
    "Key","Status","Submitted At",
    "Teacher","Email","Program","Course","Semester","Blocks","Room","Conference",
    "Tutorial Day/Time","Course Description","Class-Specific Expectations",
    "Certification","Testing Month","Certification Notes","CTSO",
    "Professional Dress","Supplies / Course Fees","Confirmation"
  ];
  const units = [];
  for (let i = 1; i <= 6; i++) {
    units.push(`Unit ${i} Title`, `Unit ${i} Topics`, `Unit ${i} Hands-On`, `Unit ${i} Assessment`);
  }
  const admin = ["Admin Review Status","Admin Notes","Approved Final Date"];
  return base.concat(units).concat(admin);
}

function flattenPayload_(payload) {
  const r = payload.record || {};
  const a = payload.responses || {};
  const key = r.id || [r.teacher, r.course, r.semester, r.blocks].join(" | ");
  const row = [
    key,
    payload.status || "Submitted for Review",
    payload.submittedAt || new Date().toISOString(),
    r.teacher || "",
    r.email || "",
    r.program || "",
    r.course || "",
    r.semester || "",
    r.blocks || "",
    r.room || "",
    r.conference || "",
    a.tutorialTime || "",
    a.courseDescription || "",
    a.classExpectations || "",
    a.certification || "",
    a.testingMonth || "",
    a.certificationNotes || "",
    a.ctso || "",
    a.professionalDress || "",
    a.suppliesFees || "",
    a.confirmation ? "Yes" : ""
  ];
  for (let i = 1; i <= 6; i++) {
    row.push(
      a[`unit${i}Title`] || "",
      a[`unit${i}Topics`] || "",
      a[`unit${i}HandsOn`] || "",
      a[`unit${i}Assessment`] || ""
    );
  }
  row.push("Submitted for Review", "", "");
  return row;
}

function upsertByKey_(sheet, row) {
  const key = row[0];
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const idx = keys.indexOf(key);
    if (idx >= 0) {
      const targetRow = idx + 2;
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sheet.appendRow(row);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
