/* Ops PIN bootstrap — one PIN per browser (localStorage), 12h gate. */
(function () {
  var KEY = "gs-ops-pin";
  var OK = "gs-ops-ok";
  function pin() { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function setPin(p) {
    try { localStorage.setItem(KEY, p); } catch (e) {}
    try { sessionStorage.setItem(KEY, p); } catch (e) {}
  }
  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    opts = opts || {};
    var headers = {};
    if (!(opts.headers && opts.headers.forEach)) headers = Object.assign({}, opts.headers || {});
    var p = pin();
    if (p && String(url).indexOf("/.netlify/functions/") >= 0) headers["X-Ops-Pin"] = p;
    opts.headers = headers;
    return _fetch.call(this, url, opts);
  };
  window.opsHeaders = function () {
    var p = pin();
    var h = { "Content-Type": "application/json" };
    if (p) h["X-Ops-Pin"] = p;
    return h;
  };
  window.requireOps = function () {
    if (!pin()) {
      var entered = window.prompt("Ops PIN");
      if (!entered) { window.location.href = "index.html"; return false; }
      setPin(entered.trim());
    }
    var okAt = 0;
    try { okAt = Number(localStorage.getItem(OK) || 0); } catch (e) {}
    if (okAt && Date.now() - okAt < 12 * 3600 * 1000) return true;
    fetch("/.netlify/functions/ops-gate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Ops-Pin": pin() },
      body: JSON.stringify({ pin: pin() })
    }).then(function (res) { return res.text().then(function (raw) {
      var d = {};
      try { d = raw ? JSON.parse(raw) : {}; } catch (e) {}
      return { res: res, d: d };
    }); }).then(function (x) {
      if (x.res.ok && x.d.ok) {
        try { localStorage.setItem(OK, String(Date.now())); } catch (e) {}
      } else {
        try { localStorage.removeItem(KEY); localStorage.removeItem(OK); sessionStorage.removeItem(KEY); } catch (e) {}
        alert("Wrong PIN");
        window.location.href = "index.html";
      }
    }).catch(function () {});
    return true;
  };
})();
