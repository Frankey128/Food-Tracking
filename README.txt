FRANKEY'S FOOD FUN TIMES
=======================

A one-file web app for logging what you eat and seeing daily totals of
protein, fat and carbohydrate (plus calories). Macro estimates come from
the Anthropic (Claude) API from a short description you type; you can also
enter the numbers by hand.

Live at:  https://frankey128.github.io/Food-Tracking/
Source:   GitHub repo  Frankey128/Food-Tracking  (this folder is the repo)

Files in this folder:
  index.html        the whole app
  worker/worker.js  the Cloudflare Worker that does cross-device sync
  README.txt        this file
  robots.txt        keeps the page out of search engines
  .nojekyll         tells GitHub Pages to serve the file as-is (no build)
  food-data.json    a local backup, if you've exported one (git-ignored)


-------------------------------------------------------------------------
USING IT
-------------------------------------------------------------------------

1. Open the live URL on any device (PC, phone, tablet). On a phone/tablet:
   Share -> Add to Home Screen for an app icon.

2. Settings -> paste an Anthropic API key (needed for the AI estimates;
   manual entry works without one).
   - Get one at https://console.anthropic.com  (API billing is separate
     from a Claude.ai subscription; a card is required).
   - Set a low monthly spend limit on the key. This app costs well under
     a cent a day.
   - Model dropdown: Opus (best), Sonnet (cheaper), Haiku (cheapest).

3. Settings -> Cloud sync -> enter the Worker URL and the backend
   password, then Connect. Do this on every device with the SAME URL and
   password. After that, every add/edit/delete syncs automatically.
   (See CLOUD SYNC below. Without it, data stays on that one device.)

4. Add food: type e.g. "2 slices wholemeal toast with butter, boiled egg"
   and press Add. Edit any row to fix the numbers. "Re-estimate" on an
   AI row re-runs the estimate from that row's current name.

5. Add from a photo / screenshot: "Photo / label" -> take a photo or pick
   an image (a nutrition label, a recipe, a menu, an app screenshot, or a
   plated meal). Claude reads it, then you say how much you had (grams,
   servings, "N of M servings", or % of the plate) and it logs the scaled
   macros. On desktop you can also paste a screenshot (Ctrl+V).
   The image is shrunk in the browser before sending (to keep token cost
   down) and is NEVER stored - only the numbers it produced are kept.

MOVING BETWEEN DAYS
   - The < and > arrows step one day; "Today" jumps back to today.
   - Tap the date to pick any date from a calendar.
   - The selected day's totals show in the header, under the date.
   - The History card lists every day you've logged, newest first, with
     that day's totals and a calorie bar. 7d / 30d / 90d / All changes
     the range; tap a day to open it; the line above shows the averages.


-------------------------------------------------------------------------
CLOUD SYNC  (Cloudflare Worker + KV)
-------------------------------------------------------------------------

worker/worker.js is deployed as a Cloudflare Worker (via the Cloudflare
dashboard - paste the file into the Worker's code editor and Deploy).

It needs:
  - a KV namespace bound to the variable name  LOG
  - a secret  APP_PASSWORD  (the password you type into the app)

Endpoints (both require  Authorization: Bearer <APP_PASSWORD> ):
  GET  /data   returns the whole log
  PUT  /data   merges the posted log into the stored one (by entry id +
               "updated" timestamp, tombstones respected) and returns it

Because merging happens on the server, two devices saving at the same
time can't lose each other's entries. If the site URL changes, edit
ALLOWED_ORIGINS at the top of worker.js.


-------------------------------------------------------------------------
YOUR DATA
-------------------------------------------------------------------------

The log grows forever - the app never trims old entries, and History can
show all of it. Settings -> Export & backup gives you:

  Download .json  - one object with an "entries" array. Example entry:
                      { "id":"...", "date":"2026-08-30",
                        "item":"Toast with butter", "qty":"2 slices (~80 g)",
                        "protein":9, "fat":12, "carbs":30, "kcal":260,
                        "source":"ai", "deleted":false, "updated":1693... }

  Download .csv   - one row per entry, header line first. Opens straight
                    into Excel / Google Sheets. Columns:
                      id,date,ts,updated,deleted,source,item,qty,text,
                      protein,fat,carbs,kcal,note

  Copy to clipboard - the JSON, for pasting elsewhere.

Import / restore takes a .json or .csv file (or pasted text) and merges
it in by entry, so re-importing a backup never creates duplicates.

If you edit the CSV in Excel: keep the "date" column formatted as TEXT.
Excel turns "2026-08-30" into its own date format or a serial number, and
the app expects the plain YYYY-MM-DD string.

Deleting a row keeps it with deleted = true (a "1" in the CSV) so the
deletion syncs too. "Erase all data on this device" only clears that
browser; if cloud sync is on, it comes back on the next sync.

Nothing leaves your devices except the food text you type, which goes to
the Anthropic API for the estimate, and your log, which goes to your own
Cloudflare Worker when cloud sync is on.


-------------------------------------------------------------------------
PUBLISHING A CHANGE
-------------------------------------------------------------------------

Edit index.html, then:

  git -C "<this folder>" add index.html
  git -C "<this folder>" commit -m "..."
  git -C "<this folder>" push origin main

GitHub Pages redeploys in about a minute. Hard-refresh (Ctrl+Shift+R).
If you changed worker/worker.js, also paste it into the Cloudflare Worker
editor and Deploy.
