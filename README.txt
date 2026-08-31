FOOD MACRO TRACKER
==================

A one-file web app for logging what you eat and seeing daily totals of
protein, fat and carbohydrate (plus calories). Estimates come from the
Anthropic (Claude) API from a short description you type; you can also
enter the numbers by hand.

Files in this folder:
  index.html                the app
  README.txt                this file
  food-data.json (or .csv)  your data (created the first time you link it)


-------------------------------------------------------------------------
ON THE PC
-------------------------------------------------------------------------

1. Double-click index.html. It opens in your default browser.
   Use Edge or Chrome - the automatic file sync needs one of those.

2. Open "Settings" (near the bottom) and paste an Anthropic API key.
   - Get one at https://console.anthropic.com  (API billing is separate
     from a Claude.ai subscription; a card is required).
   - On the console, set a low monthly spend limit on the key. This app
     costs well under a cent per day.
   - The key is stored only in this browser.

3. Still in Settings, under "OneDrive data file" click "New .json file"
   (or "New .csv file" - see YOUR DATA below) and save it IN THIS FOLDER.
   From now on the PC reads and writes that file automatically, and
   OneDrive syncs it to your other devices.
   (On another PC / a new device, use "Link existing file" and pick it.)

4. Add food: type e.g. "2 slices wholemeal toast with butter, boiled egg"
   and press Add. Edit any row to correct the numbers.

MOVING BETWEEN DAYS
   - The < and > arrows step one day at a time; "Today" jumps back to today.
   - Tap the date itself to pick any date from a calendar.
   - The History card at the bottom lists every day you've logged, newest
     first, with that day's totals and a calorie bar. Use the 7d / 30d /
     90d / All buttons to change the range; tap a day to open it. The line
     above the list shows how many days and your averages over the range.

If adding food shows a "network / CORS" error:
   Some browsers block API calls from a file opened directly off disk.
   Fix: serve the folder over http instead. If you have the VS Code
   editor, install its "Live Server" extension, right-click index.html,
   "Open with Live Server". Any tiny static web server works.


-------------------------------------------------------------------------
ON THE iPad
-------------------------------------------------------------------------

iPad browsers can't open a local HTML file from OneDrive, and can't write
files back to OneDrive. Two ways to deal with that:

A. Host the page (it's on GitHub Pages, from the Food-Tracking repo):
   Open the Pages URL on the iPad, then Share -> Add to Home Screen so it
   runs full-screen like an app. Paste the same API key into Settings
   there. Your data still lives in OneDrive as your data file.
   To publish a change: git push - GitHub Pages redeploys in about a minute.

B. Just use it on the PC for now and add the iPad later.

Syncing the iPad's entries (until/unless you move to Microsoft sign-in):
   - After logging on the iPad: Settings -> "Copy all data", then paste
     that text into your data file in the OneDrive app (or email it to
     yourself).
   - On the PC: Settings -> paste it into "Paste data here to merge it
     in" -> "Merge pasted data". (Import / paste accept JSON or CSV.)
   - It merges entry by entry, so the two devices never overwrite each
     other. Order doesn't matter.
   - Simplest habit: log wherever you are, and merge once a day at the PC.


-------------------------------------------------------------------------
YOUR DATA
-------------------------------------------------------------------------

Your data file grows forever - the app never trims old entries, and the
History card can show all of it. It is plain text you can read and back up.

JSON  - one object, an "entries" array. Best if you never open the file
        yourself. Example entry:
          { "id": "...", "date": "2026-08-30", "item": "Toast with butter",
            "qty": "2 slices (~80 g)", "protein": 9, "fat": 12, "carbs": 30,
            "kcal": 260, "source": "ai", "deleted": false, "updated": 1693... }

CSV   - one row per entry, with a header line. Opens straight into Excel
        or Google Sheets so you can chart / pivot it yourself. Columns:
          id,date,ts,updated,deleted,source,item,qty,text,protein,fat,carbs,kcal,note

Pick whichever when you create the file. The app reads either format and,
for a linked file, writes back in that file's format. "Download .json" and
"Download .csv" in Settings export a snapshot in either format at any time.

If you edit the CSV in Excel: keep the "date" column formatted as TEXT.
Excel likes to turn "2026-08-30" into its own date format or a serial
number, and the app expects the plain YYYY-MM-DD string.

Deleting a row keeps it with deleted = true (a "1" in the CSV) so the
deletion also syncs. "Erase all data on this device" only clears this
browser; a synced file restores it on the next sync.

Nothing leaves your devices except the food description you type, which
is sent to the Anthropic API to produce an estimate.
