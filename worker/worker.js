// Food Tracker sync backend - Cloudflare Worker + KV
// Deployed via the Cloudflare dashboard (paste this into the Worker's "Edit code" editor).
//
// Required binding:  KV namespace  ->  variable name  LOG
// Required secret:   APP_PASSWORD
// If the site URL ever changes, edit ALLOWED_ORIGINS.
//
// Endpoints (all require  Authorization: Bearer <APP_PASSWORD> ):
//   GET  /data  -> returns the stored log  {version, entries:[]}
//   PUT  /data  -> body is {version, entries:[]}; merged into the stored log by
//                  entry id + `updated` (tombstones respected); returns the merged result.

const ALLOWED_ORIGINS = [
  "https://frankey128.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];
const KV_KEY = "foodlog";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== "/data") return json({ error: "not found" }, 404, cors);
    if (!authOk(request, env)) return json({ error: "unauthorized" }, 401, cors);

    if (request.method === "GET") {
      const stored = await env.LOG.get(KV_KEY);
      return json(stored ? safeParse(stored) : { version: 1, entries: [] }, 200, cors);
    }

    if (request.method === "PUT") {
      let incoming;
      try { incoming = await request.json(); }
      catch { return json({ error: "bad JSON body" }, 400, cors); }
      if (!incoming || !Array.isArray(incoming.entries))
        return json({ error: "expected {version, entries:[]}" }, 400, cors);
      const stored = await env.LOG.get(KV_KEY);
      const current = stored ? safeParse(stored) : { version: 1, entries: [] };
      const merged = mergeLogs(current, incoming);
      await env.LOG.put(KV_KEY, JSON.stringify(merged));
      return json(merged, 200, cors);
    }

    return json({ error: "method not allowed" }, 405, cors);
  },
};

function authOk(request, env) {
  const pw = env.APP_PASSWORD || "";
  if (!pw) return false;
  const auth = request.headers.get("Authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const header = request.headers.get("X-App-Password") || "";
  return (bearer && bearer === pw) || (header && header === pw);
}
function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, X-App-Password, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  });
}
function safeParse(s) {
  try { const j = JSON.parse(s); return j && Array.isArray(j.entries) ? j : { version: 1, entries: [] }; }
  catch { return { version: 1, entries: [] }; }
}
function mergeLogs(a, b) {
  const map = new Map();
  for (const e of (a.entries || [])) if (e && e.id) map.set(e.id, e);
  for (const e of (b.entries || [])) {
    if (!e || !e.id) continue;
    const cur = map.get(e.id);
    if (!cur || (e.updated || 0) >= (cur.updated || 0)) map.set(e.id, e);
  }
  return { version: 1, entries: [...map.values()] };
}
