/* Personal inspector code (r4). Load AFTER floor-boot.js on floor pages that save under a person's name.
 * Wraps window.fetch: for POSTs to the name-taking functions it sends X-Inspector-Code for the name in the
 * JSON body (inspector / markedBy), remembered per name in localStorage "gs-insp-codes". If the server asks
 * for a code (401 needsCode) it shows an INLINE overlay (no prompt/alert -- browsers block those), stores the
 * code and retries the same request, so page logic and the offline queue need no change.
 * Rules (10/9 floor-boot lesson): one overlay at a time; a stored code is cleared on rejection ONLY if it is
 * still the code that was sent; no reload and no automatic retry loop (one retry per code the person types).
 *
 * r4b: the same code is ALSO asked when the inspector PICKS their name (see "pick-time check" below), by calling
 * inspector-check, so a missing / wrong / reset code shows up before the lane is worked. The save-time path above
 * is untouched and remains the backstop (offline queue, stale pages, direct calls). */
(function () {
  var KEY = "gs-insp-codes";
  var RE = /\/\.netlify\/functions\/(submit-pdi|submit-assist|submit-clock|submit-meta|submit-prod)(\?|#|$)/;
  var _fetch = window.fetch;
  var overlayP = null;      // the single in-flight overlay promise
  var overlayName = "";

  function norm(n) { return String(n || "").trim().replace(/\s+/g, " "); }
  function readCodes() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function writeCodes(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function getCode(name) { return readCodes()[name] || ""; }
  function setCode(name, code) { var o = readCodes(); o[name] = code; writeCodes(o); }
  function clearIfSame(name, sent) { var o = readCodes(); if (o[name] && o[name] === sent) { delete o[name]; writeCodes(o); } }

  function isTarget(url, opts) {
    var m = String((opts && opts.method) || "GET").toUpperCase();
    return m === "POST" && RE.test(String(url));
  }
  function nameOf(opts) {
    try {
      var b = opts && opts.body;
      if (typeof b !== "string") return "";
      var j = JSON.parse(b);
      return norm(j.inspector || j.markedBy || "");
    } catch (e) { return ""; }
  }
  function plainHeaders(h) {
    var out = {};
    if (!h) return out;
    if (typeof h.forEach === "function" && !Array.isArray(h)) { h.forEach(function (v, k) { out[k] = v; }); return out; }
    if (Array.isArray(h)) { h.forEach(function (p) { out[p[0]] = p[1]; }); return out; }
    return Object.assign(out, h);
  }
  function withCode(opts, code, noSignal) {
    var o = Object.assign({}, opts);
    var h = plainHeaders(opts.headers);
    if (code) h["X-Inspector-Code"] = code;
    o.headers = h;
    if (noSignal) delete o.signal;   // the page's own 8s abort timer may have fired while the overlay was open
    return o;
  }
  function readJson(res) { return res.clone().text().then(function (t) { try { return JSON.parse(t || "{}"); } catch (e) { return {}; } }).catch(function () { return {}; }); }

  // ---- inline overlay (a real input on the page) ----
  var curCancel = null;     // r4b: cancels the overlay on screen (used when a newer name pick supersedes it)
  function showOverlay(name, mode, text, noteTitle) {
    // mode: "ask" -> resolves code string or null (cancel); "note" -> resolves null after OK
    return new Promise(function (resolve) {
      var host = document.createElement("div");
      host.id = "gs-insp-overlay";
      host.setAttribute("role", "dialog");
      host.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif";
      var card = document.createElement("div");
      card.style.cssText = "background:#fff;color:#111;border-radius:12px;padding:20px;max-width:340px;width:100%;box-shadow:0 8px 30px rgba(0,0,0,.4)";
      var title = document.createElement("div");
      title.id = "gs-insp-title";
      title.style.cssText = "font-weight:700;font-size:18px;margin-bottom:6px";
      var who = document.createElement("div");
      who.style.cssText = "font-size:14px;color:#444;margin-bottom:10px";
      who.textContent = name;
      var msg = document.createElement("div");
      msg.id = "gs-insp-msg";
      msg.style.cssText = "font-size:14px;margin:8px 0;color:#b00020;min-height:1em";
      var row = document.createElement("div");
      row.style.cssText = "display:flex;gap:8px;margin-top:12px";
      function done(v) { try { host.remove(); } catch (e) {} if (curCancel === cancelMe) curCancel = null; resolve(v); }
      var cancelMe = function () { done(null); };
      curCancel = cancelMe;
      if (mode === "ask") {
        title.textContent = "Enter your personal code";
        var inp = document.createElement("input");
        inp.id = "gs-insp-input";
        inp.type = "password"; inp.inputMode = "numeric"; inp.maxLength = 4; inp.autocomplete = "off"; inp.setAttribute("pattern", "[0-9]*");
        inp.style.cssText = "width:100%;box-sizing:border-box;font-size:28px;letter-spacing:8px;text-align:center;padding:10px;border:2px solid #888;border-radius:8px";
        var ok = document.createElement("button");
        ok.id = "gs-insp-ok"; ok.type = "button"; ok.textContent = "OK";
        ok.style.cssText = "flex:1;font-size:18px;padding:12px;border:0;border-radius:8px;background:#0a5;color:#fff;font-weight:700";
        var cancel = document.createElement("button");
        cancel.id = "gs-insp-cancel"; cancel.type = "button"; cancel.textContent = "Cancel";
        cancel.style.cssText = "flex:1;font-size:18px;padding:12px;border:0;border-radius:8px;background:#ccc;color:#111";
        var submit = function () {
          var v = (inp.value || "").trim();
          if (!/^\d{4}$/.test(v)) { msg.textContent = "Code is 4 digits."; return; }
          done(v);
        };
        ok.onclick = submit;
        cancel.onclick = function () { done(null); };
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
        msg.textContent = text || "";
        card.appendChild(title); card.appendChild(who); card.appendChild(inp); card.appendChild(msg);
        row.appendChild(ok); row.appendChild(cancel); card.appendChild(row);
        host.appendChild(card); (document.body || document.documentElement).appendChild(host);
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30);
      } else {
        title.textContent = noteTitle || "Can't save";
        msg.style.color = "#111";
        msg.textContent = text || "";
        var ok2 = document.createElement("button");
        ok2.id = "gs-insp-ok"; ok2.type = "button"; ok2.textContent = "OK";
        ok2.style.cssText = "flex:1;font-size:18px;padding:12px;border:0;border-radius:8px;background:#0a5;color:#fff;font-weight:700";
        ok2.onclick = function () { done(null); };
        card.appendChild(title); card.appendChild(who); card.appendChild(msg);
        row.appendChild(ok2); card.appendChild(row);
        host.appendChild(card); (document.body || document.documentElement).appendChild(host);
        setTimeout(function () { try { ok2.focus(); } catch (e) {} }, 30);
      }
    });
  }
  // ONE overlay at a time. Same name -> everybody shares the same answer; another name waits its turn.
  function overlay(name, mode, text, noteTitle) {
    if (overlayP && overlayName === name && mode === "ask") return overlayP;
    var run = function () {
      overlayName = name;
      var p = showOverlay(name, mode, text, noteTitle);
      overlayP = p;
      p.then(function () { if (overlayP === p) { overlayP = null; overlayName = ""; } });
      return p;
    };
    if (overlayP) return overlayP.then(run, run);
    return run();
  }

  function minutes(sec) { return Math.max(1, Math.ceil(Number(sec || 0) / 60)); }

  async function guarded(ctx, url, opts) {
    var name = nameOf(opts);
    if (!name) return _fetch.call(ctx, url, opts);
    var sent = getCode(name);
    var res = await _fetch.call(ctx, url, withCode(opts, sent, false));
    var guard = 0;
    while (guard++ < 20) {
      if (res.status !== 401 && res.status !== 403 && res.status !== 429) return res;
      var d = await readJson(res);
      if (res.status === 429 && d && d.error === "locked") {
        await overlay(name, "note", "Locked, try again in " + minutes(d.retryAfterSec) + " minutes.");
        return res;
      }
      if (res.status === 403 && d && d.error === "inspector inactive") {
        await overlay(name, "note", "This name is inactive. See your supervisor.");
        return res;
      }
      if (!(res.status === 401 && d && d.needsCode)) return res;
      // 401 needsCode
      var wrong = d.error === "inspector code wrong";
      if (sent && wrong) clearIfSame(name, sent);       // only if it is still the one that was sent
      var cur = getCode(name);
      var next;
      if (cur && cur !== sent) {
        next = cur;                                      // someone stored a newer code meanwhile: use it, no new prompt
      } else {
        next = await overlay(name, "ask", wrong ? "Wrong code. Try again." : "");
        if (!next) return res;                           // cancel: original error response, nothing dropped
        setCode(name, next);
      }
      sent = next;
      res = await _fetch.call(ctx, url, withCode(opts, sent, true));
    }
    return res;
  }


  // ======================= pick-time check (r4b) =======================
  // When the inspector selects (or a restored draft sets) a name in #inspectorSelect, ask inspector-check whether
  // the name is usable and the code is right. Same overlay, same single-overlay rule, same "clear a stored code only
  // if it is still the one that was sent" rule as the save path. On cancel / inactive / locked the dropdown goes
  // back to blank so nobody works under that name. Offline / timeout / 5xx / anything unexpected NEVER blocks:
  // the save-time check is the backstop. Runs on selection change and on a programmatic name set (draft restore)
  // only -- not on render, not on keystrokes.
  var CHECK_URL = "/.netlify/functions/inspector-check";
  var pickSeq = 0;          // latest pick wins
  var pendingName = "";     // name whose check is in flight
  var okName = "";          // name already verified this page session (programmatic re-sets are skipped)

  function checkCall(name, code) {
    // resolves {status, body} or null (offline / timeout / network error)
    var ctl = (typeof AbortController === "function") ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 8000) : null;
    var h = { "Content-Type": "application/json" };
    if (code) h["X-Inspector-Code"] = code;
    var o = { method: "POST", headers: h, body: JSON.stringify({ name: name }) };
    if (ctl) o.signal = ctl.signal;
    return _fetch.call(window, CHECK_URL, o).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.text().then(function (t) { var b = {}; try { b = JSON.parse(t || "{}") || {}; } catch (e) {} return { status: res.status, body: b }; });
    }).catch(function () { if (timer) clearTimeout(timer); return null; });
  }
  function blankSelect(sel) {
    try {
      sel.value = "";
      // pdi.html keeps a hidden copy of the name and falls back to it when the dropdown is empty: clear it too,
      // so a cancelled / locked / inactive name cannot ride into a save.
      var hid = document.getElementById("inspectorName"); if (hid) hid.value = "";
      sel.dispatchEvent(new Event("change", { bubbles: true }));   // lets the page re-sync its own copy of the name
    } catch (e) {}
    okName = ""; pendingName = "";
  }
  async function pickCheck(sel, programmatic) {
    var name = norm(sel && sel.value);
    if (programmatic && name && (name === okName || name === pendingName)) return;   // same name again (page repaint): nothing new
    var my = ++pickSeq;
    if (curCancel && overlayIsPick) { var c = curCancel; c(); }       // an earlier pick's overlay: cancel it cleanly
    if (!name) { okName = ""; pendingName = ""; return; }
    pendingName = name;
    var sent = getCode(name);
    var guard = 0;
    while (guard++ < 20) {
      var r = await checkCall(name, sent);
      if (my !== pickSeq) return;                                     // a newer pick took over
      if (!r) { pendingName = ""; return; }                           // offline / timeout: do not block
      var st = r.status, d = r.body || {};
      if (st === 200 && d.ok) { okName = name; pendingName = ""; return; }
      if (st === 429 && d.error === "locked") {
        overlayIsPick = true;
        await overlay(name, "note", "Locked, try again in " + minutes(d.retryAfterSec) + " minutes.", "Can't use this name");
        overlayIsPick = false;
        if (my === pickSeq) blankSelect(sel);
        return;
      }
      if (st === 403 && d.error === "inspector inactive") {
        overlayIsPick = true;
        await overlay(name, "note", "This name is inactive. See your supervisor.", "Can't use this name");
        overlayIsPick = false;
        if (my === pickSeq) blankSelect(sel);
        return;
      }
      if (st === 400 && /roster/i.test(String(d.error || ""))) {
        overlayIsPick = true;
        await overlay(name, "note", String(d.error), "Can't use this name");
        overlayIsPick = false;
        if (my === pickSeq) blankSelect(sel);
        return;
      }
      if (!(st === 401 && d.needsCode)) { pendingName = ""; return; } // 5xx / 404 / anything unexpected: do not block
      var wrong = d.error === "inspector code wrong";
      if (sent && wrong) clearIfSame(name, sent);                     // only if it is still the one that was sent
      var cur = getCode(name);
      var next;
      if (cur && cur !== sent) {
        next = cur;                                                   // a newer code was stored meanwhile: use it, no new prompt
      } else {
        overlayIsPick = true;
        next = await overlay(name, "ask", wrong ? "Wrong code. Try again." : "");
        overlayIsPick = false;
        if (my !== pickSeq) return;
        if (!next) { blankSelect(sel); return; }                      // cancel: nobody works under this name without the code
        setCode(name, next);
      }
      sent = next;
    }
    pendingName = "";
  }
  var overlayIsPick = false;
  document.addEventListener("change", function (e) {
    var t = e && e.target;
    if (t && t.id === "inspectorSelect") pickCheck(t, false);
  }, true);
  // A restored draft sets the dropdown from script (no change event): watch that on the element itself.
  function watchProgrammatic() {
    var sel = document.getElementById("inspectorSelect");
    if (!sel || sel.__gsInspWatch) return;
    var d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    if (!d || !d.set || !d.get) return;
    sel.__gsInspWatch = true;
    Object.defineProperty(sel, "value", {
      configurable: true,
      get: function () { return d.get.call(this); },
      set: function (v) {
        d.set.call(this, v);
        try { pickCheck(this, true); } catch (e) {}
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchProgrammatic);
  else watchProgrammatic();

  window.fetch = function (url, opts) {
    if (!isTarget(url, opts)) return _fetch.apply(this, arguments);
    return guarded(this, url, opts || {});
  };
})();
