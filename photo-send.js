/* Shared early photo upload. Photos optional. JPEG leaves the phone as soon as unit + slot exist. */
(function (w) {
  // 9a1: photos are switched off in build.js. Define nothing: no gsPhoto, no guard, no timers, no listeners. Pages see "no photo support".
  if (!(w.GS_PHOTOS && w.GS_PHOTOS.ENABLED)) return;
  function fetchTimeout(url, opts, ms) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, ms || 28000);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).then(function (r) {
      clearTimeout(t); return r;
    }, function (err) { clearTimeout(t); throw err; });
  }
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      var done = false;
      function finish(ok, err) {
        if (done) return;
        done = true;
        URL.revokeObjectURL(url);
        if (ok) resolve(img); else reject(err || new Error("image"));
      }
      img.onload = function () { finish(true); };
      img.onerror = function () {
        var reader = new FileReader();
        reader.onload = function () {
          var img2 = new Image();
          img2.onload = function () { resolve(img2); };
          img2.onerror = function () { reject(new Error("image")); };
          img2.src = reader.result;
        };
        reader.onerror = function () { reject(new Error("image")); };
        reader.readAsDataURL(file);
      };
      setTimeout(function () { finish(false, new Error("image timeout")); }, 12000);
      img.src = url;
    });
  }
  function compress(file) {
    return loadImage(file).then(function (img) {
      var max = 720;
      var scale = Math.min(1, max / Math.max(img.width, 1));
      var canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      var tw = 96, th = Math.max(54, Math.round(96 * canvas.height / canvas.width));
      var tCanvas = document.createElement("canvas");
      tCanvas.width = tw; tCanvas.height = th;
      tCanvas.getContext("2d").drawImage(canvas, 0, 0, tw, th);
      return {
        data: canvas.toDataURL("image/jpeg", 0.45),
        thumb: tCanvas.toDataURL("image/jpeg", 0.4)
      };
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // r9a: the per-try timeout scales with the payload. It assumes a sustained uplink of at least ~40 kbit/s (5 bytes per ms), plus 12 s
  // of fixed allowance for connection setup and the server's read-then-write. Clamped to 15 s .. 120 s. A 60 KB photo gets ~24 s,
  // a 150 KB one ~42 s. A link slower than ~40 kbit/s cannot finish a photo inside the window: it fails visibly and is retried.
  var MIN_BYTES_PER_MS = 5;
  function timeoutFor(bytes) {
    var ms = 12000 + Math.ceil((bytes || 0) / MIN_BYTES_PER_MS);
    return Math.max(15000, Math.min(120000, ms));
  }
  function logFail(info) {
    try { console.warn("[photo] failed " + JSON.stringify(info)); } catch (e) {}
  }
  // Uploads one photo and returns the server's whole answer: { ok, photoKey, attached }. tries per call (default 3), backoff 800 ms * 2^(n-1).
  async function uploadFull(opts) {
    var body = {
      stage: opts.stage || "pdi",
      unit: String(opts.unit || ""),
      lane: opts.lane != null ? String(opts.lane) : undefined,
      station: opts.station || undefined,
      sessionId: opts.sessionId || "",
      timestamp: opts.timestamp || "",
      idempKey: opts.idempKey || "",
      checkKey: opts.checkKey || "",
      inspector: opts.inspector || ((w.document && w.document.getElementById("inspectorSelect") || {}).value || ""),
      section: opts.section || "",
      defectIndex: opts.defectIndex == null ? 0 : opts.defectIndex,
      photoIndex: opts.photoIndex == null ? 0 : opts.photoIndex,
      photoData: opts.photoData
    };
    var payload = JSON.stringify(body);
    var tmo = timeoutFor(payload.length);
    var tries = opts.tries || 3;
    var lastErr = null;
    for (var attempt = 1; attempt <= tries; attempt++) {
      var t0 = Date.now(), status = 0;
      try {
        var res = await fetchTimeout((opts.api || "/.netlify/functions") + "/submit-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload
        }, tmo);
        status = res.status;
        var data = {};
        try { data = await res.json(); } catch (e) {}
        if (!res.ok) throw new Error(data.error || ("photo " + res.status));
        return data;
      } catch (err) {
        lastErr = err;
        if (err && err.name === "AbortError") lastErr = new Error("timed out after " + Math.round(tmo / 1000) + " s");
        logFail({ unit: body.unit, lane: body.lane || "", attempt: attempt, status: status, ms: Date.now() - t0, error: String(lastErr && lastErr.message || lastErr) });
        if (attempt < tries) await sleep(800 * Math.pow(2, attempt - 1));
      }
    }
    throw lastErr || new Error("photo failed");
  }
  async function upload(opts) {
    var data = await uploadFull(opts);
    return data.photoKey;
  }
  // r9a item F: for the pages with no persistent photo queue. cfg.list() returns the photos still on the phone ([{error}]), cfg.retry() sends them.
  // Shows a red notice with a Retry button, retries on online / tab visible, warns before leaving the page, and offers a submit warning.
  function guard(cfg) {
    var bar = null;
    function items() { try { return cfg.list() || []; } catch (e) { return []; } }
    function retry() { try { cfg.retry(); } catch (e) {} }
    function ensure() {
      if (bar) return bar;
      bar = document.createElement("div");
      bar.id = "gsUnsentBar";
      bar.style.cssText = "display:none;position:sticky;top:0;z-index:60;background:#b3261e;color:#fff;padding:10px 12px;font:700 14px/1.3 system-ui,sans-serif";
      var t = document.createElement("span"); t.id = "gsUnsentText";
      var b = document.createElement("button"); b.type = "button"; b.id = "gsUnsentRetry"; b.textContent = "Retry";
      b.style.cssText = "margin-left:10px;padding:6px 12px"; b.onclick = retry;
      bar.appendChild(t); bar.appendChild(b);
      document.body.insertBefore(bar, document.body.firstChild);
      return bar;
    }
    function paint() {
      var l = items(), b = ensure();
      if (!l.length) { b.style.display = "none"; return 0; }
      var err = "";
      l.forEach(function (x) { if (x && x.error) err = x.error; });
      b.firstChild.textContent = l.length + " photo" + (l.length === 1 ? "" : "s") + " not sent. " + (err ? err : "Tap Retry.");
      b.style.display = "block";
      return l.length;
    }
    w.addEventListener("online", function () { if (items().length) retry(); paint(); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden && items().length) retry(); paint(); });
    w.addEventListener("beforeunload", function (e) {
      if (items().length) { e.preventDefault(); e.returnValue = "Photos are not sent yet."; return e.returnValue; }
    });
    setInterval(paint, 2000);
    if (!w.gsBeforeReload) w.gsBeforeReload = function () {
      var n = items().length;
      return n ? { ok: false, reason: n + " photo" + (n === 1 ? " is" : "s are") + " not sent yet, and this page cannot keep them across a reload" } : { ok: true };
    };
    return {
      paint: paint,
      confirmSubmit: function () {
        var n = items().length;
        if (!n) return true;
        return w.confirm(n + " photo" + (n === 1 ? " is" : "s are") + " not uploaded yet. Submit anyway?");
      }
    };
  }
  w.gsPhoto = { compress: compress, upload: upload, uploadFull: uploadFull, timeoutFor: timeoutFor, guard: guard, maxPerDefect: 8 };
})(window);
