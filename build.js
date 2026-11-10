/* r9a item H: this page's build string, a gray footer label, and the "new version available" banner.
   The build string below and version.json carry the same value (scripts/make-build-id.js writes both; verify-build asserts they match).
   The check is read-only: no PIN, no cookies, no writes. It never reloads by itself and never raises an alert. */
/* 9a1 (photos off): THE photo master switch. Every page that loads build.js can read window.GS_PHOTOS.
   false = no photo capture, no photo UI, no photo uploads or timers, and photo-send.js stays inert.
   Photos back on = change PHOTOS_ENABLED to true (one line). PHOTO_MAX_SLOTS is exposed only; nothing reads a new limit yet. */
var PHOTOS_ENABLED = false;
var PHOTO_MAX_SLOTS = 8;
window.GS_PHOTOS = { ENABLED: PHOTOS_ENABLED, MAX_SLOTS: PHOTO_MAX_SLOTS };
(function (w, d) {
  var BUILD = "w3a-restore-r4-2026-11-06-266d57ae";
  w.GS_BUILD = BUILD;
  var shown = false, busy = false;
  function onReady(fn) { if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn); else fn(); }
  function label() {
    var n = d.createElement("div");
    n.id = "gsBuildLabel";
    n.style.cssText = "text-align:center;color:#8a8a8a;font:11px/1.4 system-ui,sans-serif;padding:8px 0 10px";
    n.textContent = "build " + BUILD;
    d.body.appendChild(n);
  }
  function banner() {
    if (shown) return;
    shown = true;
    var b = d.createElement("button");
    b.type = "button"; b.id = "gsStaleBanner";
    b.style.cssText = "display:block;width:100%;border:0;background:#1a5fb4;color:#fff;font:700 14px/1.3 system-ui,sans-serif;padding:10px 12px;text-align:left";
    b.textContent = "New version available. Finish this unit, then tap here to reload.";
    b.onclick = function () {
      if (busy) return;
      busy = true;
      // pages that hold work (pdi: draft + unsent photos) define w.gsBeforeReload and must say it is safe; if not, nothing reloads
      var p;
      try { p = Promise.resolve(w.gsBeforeReload ? w.gsBeforeReload() : { ok: true }); } catch (e) { p = Promise.resolve({ ok: false, reason: "could not save your work first" }); }
      p.then(function (r) {
        busy = false;
        if (r && r.ok) { w.location.reload(); return; }
        b.textContent = "Not reloading: " + ((r && r.reason) || "your work could not be saved first") + ". Tap to try again.";
      }, function () { busy = false; b.textContent = "Not reloading: your work could not be saved first. Tap to try again."; });
    };
    d.body.insertBefore(b, d.body.firstChild);
  }
  function check() {
    if (shown || !w.fetch) return;
    try {
      w.fetch("version.json?cb=" + Date.now(), { cache: "no-store" }).then(function (r) {
        if (!r.ok) return null;
        return r.json();
      }).then(function (j) {
        if (j && typeof j.build === "string" && j.build && j.build !== BUILD) onReady(banner);
      }).catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
  }
  onReady(function () {
    label();
    setTimeout(check, 2000);
    setInterval(function () { if (!d.hidden) check(); }, 600000);
    d.addEventListener("visibilitychange", function () { if (!d.hidden) check(); });
  });
})(window, document);
