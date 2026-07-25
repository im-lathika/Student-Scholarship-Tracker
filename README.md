# Student Scholarship Application & Disbursement Tracker

**Problem in two lines:** Scholarship applications pass through several stages (verification, sanction,
disbursement) tracked separately, so nobody can instantly tell a student where their application stands, and
applications quietly stall for months. This tracker records every application's stage in one place and
highlights the ones stuck longest.

## How to Run
1. Download/clone this folder (it contains `index.html`, `index.css`, `index.js`).
2. Open `index.html` directly in a browser (double-click it), **or** open the folder in VS Code and run it
   with the "Live Server" extension for the best experience.
3. No install, no build step, no server required — it is plain HTML/CSS/JS.
4. Data is stored in your browser's `localStorage`, so it persists between reloads on the same browser.
   To reset to the original 20 sample records, clear the site's local storage (DevTools → Application →
   Local Storage → delete `scholarship_records_v3`) and reload.

## What Each Field Means
| Field | Meaning | Example / Allowed values |
|---|---|---|
| application_id | Unique ID, auto-generated | APP-0001 |
| student_id | College-assigned student ID | STU1001 |
| student_name | Full name of the student | Suriya |
| scheme | Which scholarship scheme was applied for | State Merit Scholarship, etc. |
| applied_date | Date the application was submitted | YYYY-MM-DD |
| documents_status | Verification status of submitted documents | Pending / Incomplete / Verified / Rejected |
| stage | Current stage of the application | Submitted / Document Verification / Forwarded for Sanction / Sanctioned / Disbursed / Rejected |
| sanctioned_amount | Amount approved (₹), 0 until sanctioned | number |
| disbursed_date | Date money was disbursed, blank until then | YYYY-MM-DD or blank |
| stage_since | Internal field: date the record entered its current stage | YYYY-MM-DD |

## How the Derived Value ("Days at Stage") Is Calculated
Every time a record's **stage** is changed, `stage_since` is automatically reset to today's date.
"Days at Stage" = (today's date − `stage_since`), in whole days. This number is what the scholarship
section uses to see which applications have been sitting the longest — it is never entered by hand, so it
cannot go out of sync with reality. The summary strip at the top also counts how many applications have
been stuck 30+ days at a non-final stage.

## Awkward Sample Cases Included (Task 1 / tested in Task 4)
- **APP-0006** has a missing student name → shown as "Missing name" instead of a blank cell.
- **APP-0003** has an unusually old applied date (Sep 2025) and is still stuck in verification.
- **APP-0019** is intentionally out of ID order in the dataset — proves sorting/filtering doesn't depend
  on record insertion order.
- Deleting or viewing a record that no longer exists shows a clear "record not found" message rather
  than a blank screen.

## States Handled (Task 4)
- **Loading**: a spinner is shown while data loads.
- **Empty**: shown when a search/filter combination matches zero records.
- **Error**: shown if stored data can't be read; includes a Retry button.
- **Save/Delete failure**: shown as a toast message; a failed delete rolls back to the previous list so no
  data is silently lost.
- **Field-level validation**: for example, a Disbursed Date cannot be entered unless Stage is set to
  "Disbursed" — the form blocks save and shows the exact reason until it's fixed.

## Design
The UI uses a dark theme with a purple/indigo accent, built to be usable on both desktop and mobile
(table view collapses into stacked cards on small screens).

## What Is Not Finished
- Data is stored in the browser's localStorage rather than a real backend database (Flask/Express/etc.),
  since this is an Easy-level, no-backend-required assessment — the app is structured so that `backend.load()`
  and `backend.save()` in `index.js` could be swapped for real API calls without changing the UI code.
- No login/authentication for the clerk vs officer roles — both currently see the same screen.
