/* Floor PIN — shared crew code. Not the Ops PIN. Server checks every request. */
(function () {
  var KEY = "gs-floor-pin-v1";
  var OK = "gs-floor-ok-v1";
  function pin() {
    try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }
  function setPin(p) {
    try { localStorage.setItem(KEY, p); } catch (e) {}
    try { sessionStorage.setItem(KEY, p); } catch (e) {}
  }
  function clearPin() {
    try { localStorage.removeItem(KEY); localStorage.removeItem(OK); sessionStorage.removeItem(KEY); } catch (e) {}
  }
  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    opts = opts || {};
    var headers = {};
    if (!(opts.headers && opts.headers.forEach)) headers = Object.assign({}, opts.headers || {});
    var p = pin();
    if (p && String(url).indexOf("/.netlify/functions/") >= 0) headers["X-Floor-Pin"] = p;
    opts.headers = headers;
    // The PIN this request actually carried. The delayed clear below only
    // fires if THAT SAME PIN is still the one stored, so a response to an
    // earlier request (e.g. the first no-PIN probe) can never wipe a PIN the
    // person has typed in since.
    var sent = p;
    return _fetch.call(this, url, opts).then(function (res) {
      if (res.status === 401 && sent && String(url).indexOf("/.netlify/functions/") >= 0) {
        // Only clear the remembered floor PIN for a FLOOR-specific 401 --
        // not for an ops-pin-gated or photo-token-gated endpoint 401ing for
        // its own unrelated reason, which used to wipe a perfectly good
        // floor PIN along with it. Read a clone so the caller still gets
        // the original response body untouched.
        try {
          res.clone().text().then(function (raw) {
            var reason = "";
            try { reason = JSON.parse(raw || "{}").error || ""; } catch (e) {}
            if (reason === "floor pin required" || reason === "bad pin" || reason === "floor pin not configured") {
              if (pin() === sent) clearPin();
            }
          }).catch(function () {});
        } catch (e) {}
      }
      return res;
    });
  };
  window.floorHeaders = function () {
    var p = pin();
    var h = { "Content-Type": "application/json" };
    if (p) h["X-Floor-Pin"] = p;
    return h;
  };
  window.requireFloor = function () {
    // Decide from the PIN this check CARRIED, not from whatever is in storage
    // when the answer comes back (the fetch wrapper may have cleared it by then).
    var had = pin();
    fetch("/.netlify/functions/floor-gate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Floor-Pin": had },
      body: JSON.stringify({ pin: had })
    }).then(function (res) { return res.text().then(function (raw) {
      var d = {};
      try { d = raw ? JSON.parse(raw) : {}; } catch (e) {}
      return { res: res, d: d };
    }); }).then(function (x) {
      if (x.res.ok && x.d.open) return;
      if (x.res.ok && x.d.ok) {
        try { localStorage.setItem(OK, String(Date.now())); } catch (e) {}
        return;
      }
      if (!had) {
        var entered = window.prompt("Floor PIN");
        if (!entered) { document.body.innerHTML = "<p style='padding:24px;font:700 18px sans-serif'>Floor PIN required.</p>"; return; }
        setPin(entered.trim());
        window.location.reload();
        return;
      }
      clearPin();
      alert("Wrong Floor PIN");
      window.location.reload();
    }).catch(function () {});
    return true;
  };
})();
