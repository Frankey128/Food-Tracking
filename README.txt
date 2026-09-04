FRANKEY'S FOOD FUN TIMES
=======================

A one-file web app for logging what you eat and seeing daily totals of
protein, fat, carbohydrate and fibre (plus calories), with a rough A-E
nutritional-quality grade for each item and for the day. Macro estimates
come from the Anthropic (Claude) API from a short description you type;
you can also enter the numbers by hand.

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
   - Until a key is set, a small note under the Add box reminds you -
     manual entry and barcode scanning work fine without one either way.

3. Settings -> Cloud sync -> enter the Worker URL and the backend
   password, then Connect. Do this on every device with the SAME URL and
   password. After that, every add/edit/delete syncs automatically.
   (See CLOUD SYNC below. Without it, data stays on that one device.)
   - If you haven't set this up yet, a banner above the totals says so
     ("Not syncing to your other devices yet") until you dismiss it or
     connect. The little pill next to the theme toggle (top right) always
     shows sync status - tap it any time to jump straight to these
     settings, and once connected it shows how long ago it last synced.

4. Add food: type e.g. "2 slices wholemeal toast with butter, boiled egg"
   and press Add.
   - Next to the box is a small optional "g/ml" field for the total
     weight or volume (drinks work in ml too). Fill it and the AI works
     to that amount; leave it blank and the AI estimates it itself.
     "+ Enter macros manually" also has an optional Weight (g/ml).
   - Items you've logged twice or more show up in a small "+ Quick add"
     dropdown next to "Take photo" - pick one to log it again instantly
     with the same numbers, no AI call needed.
   - The day's log lists newest at the top.
   - Deleting a row shows a "Deleted - Undo" toast for a few seconds if
     you tap it by mistake.
   - If you give no amount, the AI assumes ONE STANDARD ADULT PORTION.
   - Each AI row keeps a "Portion (g)" - the assumed weight, shown on the
     row. Open Edit, change it, and protein/fat/carbs/kcal rescale to
     match (from the value it opened with; for older entries it reads the
     baseline out of the "Amount" text). No AI call - it's just maths.
   - The AI often tidies the name; Edit shows "Your original text" so what
     you actually typed is kept (and shown on the row as  typed: "...").
   - "Re-estimate" now lives INSIDE the Edit form. It stays greyed out
     until you change the Name or Amount, then it re-runs the AI (on name
     + amount) and fills the fields - nothing is saved until you press
     Save, so it can't wipe your other edits. Save shows a "Saved" toast.
   - Fibre (g) is tracked alongside protein/fat/carbs. It shows on the
     row, in the day totals, and in History. The optional Daily goals in
     Settings include a fibre target (UK adults are advised ~30 g/day).

NUTRITIONAL QUALITY (A-E)
   - Every AI, photo and barcode item gets a rough quality grade for a
     typical UK adult: A (best) to E (worst), in the spirit of Nutri-Score
     / UK front-of-pack guidance - fibre, protein and whole foods pull it
     up; saturated fat, sugar, salt and heavy processing pull it down.
   - Barcode items use the pack's real Nutri-Score from Open Food Facts
     when it's published. When it isn't (common for own-brand), the app
     works out a Nutri-Score itself from the per-100 g numbers OFF
     returns - done in the browser, no AI. Only if those numbers are too
     incomplete to score does it fall back to a tiny text AI call (name +
     numbers, no image). The row notes which method was used. Manual
     entries are ungraded unless you pick a grade in Edit.
   - The day's grade (shown by the date and in History) is the kcal-
     weighted average of that day's graded items. "What A-E means" under
     the totals spells out the bands. It's a guide, not medical advice -
     edit any grade in the Edit form.

5. Add from a photo / screenshot:
   - "Take photo" opens the camera; "Choose image" picks an existing
     photo/screenshot; on desktop you can also paste (Ctrl+V).
     Works on a nutrition label, a recipe, a menu, an app screenshot, or
     a plated meal.
   - You then get an optional NOTE box - type things the image can't tell
     the AI on its own, e.g. "the strawberry one", "I had 2", "the 500 g
     pack", "just the chicken, no rice" - then "Read image".
   - Claude reads it; you say how much you had (grams, servings, "N of M
     servings", or % of the plate); it logs the scaled macros.
   The image is shrunk in the browser before sending (to keep token cost
   down) and is NEVER stored - only the numbers it produced are kept.

6. Barcodes (same "Take photo" / "Choose image" buttons - no separate one):
   - The app tries to read a barcode in the picture FIRST. If it finds
     one, it looks the product up in Open Food Facts (free, no key, no AI
     tokens) and jumps to the portion step - type grams / servings eaten.
   - If there's no barcode, or the product isn't in Open Food Facts, it
     falls back to reading the pack with Claude (step 5).
   - Needs a sharp, straight, fairly close shot of the barcode. Decoding
     is done in the browser (native BarcodeDetector, or the ZXing library
     loaded from a CDN on iOS). Open Food Facts is strong on UK/EU brands,
     patchier for own-brand and other regions; its data is crowd-sourced,
     so check the numbers - they land in the editable fields like any
     other entry. Barcode rows are badged "Barcode".

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
                        "protein":9, "fat":12, "carbs":30, "fiber":4,
                        "kcal":260, "grade":"C", "gradeNote":"white bread, added fat",
                        "source":"ai", "deleted":false, "updated":1693... }

  Download .csv   - one row per entry, header line first. Opens straight
                    into Excel / Google Sheets. Columns:
                      id,date,ts,updated,deleted,source,item,qty,grams,
                      text,protein,fat,carbs,fiber,kcal,grade,gradeNote,note
                    ("grams" = assumed portion weight; "text" = what you
                    originally typed; "grade" = A-E quality, "gradeNote" =
                    why.)

  Copy to clipboard - the JSON, for pasting elsewhere.

Import / restore takes a .json or .csv file (or pasted text) and merges
it in by entry, so re-importing a backup never creates duplicates.

If you edit the CSV in Excel: keep the "date" column formatted as TEXT.
Excel turns "2026-08-30" into its own date format or a serial number, and
the app expects the plain YYYY-MM-DD string.

Deleting a row keeps it with deleted = true (a "1" in the CSV) so the
deletion syncs too. "Erase all data on this device" only clears that
browser; if cloud sync is on, it comes back on the next sync.

What leaves your devices:
 - the food text you type, and label/recipe/meal photos you read with the
   AI - to the Anthropic API (photos are shrunk first and never stored);
 - a scanned barcode number - to Open Food Facts, to look the product up
   (the barcode is decoded in the browser; the image is not sent);
 - for a barcode with no published Nutri-Score AND no scoreable numbers,
   the product name + its per-100 g macros go to the Anthropic API for a
   grade (this is the only time the barcode flow uses AI);
 - your log - to your own Cloudflare Worker, when cloud sync is on.


-------------------------------------------------------------------------
SECURITY NOTES
-------------------------------------------------------------------------

Your Anthropic API key and Cloud sync password live only in this
browser's storage - never in the page's source, never in the repo.
Treat both like passwords: the API key can spend against your Anthropic
account (set a low monthly limit); the sync password is the only thing
protecting your log on the Worker, since anyone with it has full
read/write access. If you ever suspect either has leaked, revoke/rotate
it (delete and reissue the API key in the Anthropic console; change
APP_PASSWORD in the Worker's settings, which disconnects every device
until they're reconnected with the new one).

The page also ships:
 - a Content-Security-Policy that blocks browser-plugin content and
   base-tag hijacking, and a no-referrer policy (this is a static site
   on GitHub Pages, which can't set its own server response headers, so
   a couple of protections - like stopping the page being framed by
   another site - aren't available; the CSP allows inline scripts/styles
   since the app is deliberately one plain HTML file with no build step)
 - Subresource Integrity on the one third-party script it loads (ZXing,
   the iPhone barcode-reading fallback) - the exact file is hashed, so a
   compromised CDN serving something else would be refused rather than
   silently run with access to what's in this browser's storage
 - CSV exports escape any cell that looks like a spreadsheet formula
   (leading =, +, -, @), a standard guard against formula-injection
   attacks when a CSV is later opened in Excel/Sheets
 - the Cloudflare Worker compares the sync password byte-for-byte in
   constant time, rather than a plain string ==, so response timing
   can't be used to guess it a character at a time


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
