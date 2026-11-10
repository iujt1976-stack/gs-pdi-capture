/* GS PDI r7a -- Lane History (read-only). Shared by aggregator.html, edit.html and traveler.html.
 * Never writes anything. Talks to /.netlify/functions/lane-history only.
 *   GSHistory.worth(lane)            true when a lane record says there is more than one sitting (or an Add Inspection)
 *   GSHistory.mount(host, opts)      opts: { unit, lane, api }. A collapsed "History" block that loads when it is opened.
 *   GSHistory.fetchCompact(unit, api) -> { E: {sittings:[{by,date,...}], ...}, ... } for lanes with more than one sitting
 *   GSHistory.line(h)                "3 sittings: Alice 10/14, Bob 10/15, Alice 10/15"
 */
(function (w) {
  var CSS = ".gsh{margin:8px 0 10px;border:1px solid #c7ccd1;border-radius:6px;background:#fafbfc;font-size:.82rem;color:#111}" +
    ".gsh>summary{cursor:pointer;padding:10px 12px;min-height:44px;font-weight:700;list-style:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
    ".gsh>summary::-webkit-details-marker{display:none}.gsh>summary:before{content:'\\25B8';color:#555}.gsh[open]>summary:before{content:'\\25BE'}" +
    ".gsh .gsh-body{padding:2px 12px 12px}.gsh h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#555;margin:12px 0 4px}" +
    ".gsh .gsh-sit{border-top:1px solid #e2e5e8;padding:7px 0}.gsh .gsh-sit:first-child{border-top:0}" +
    ".gsh .gsh-meta{color:#555}.gsh .gsh-tag{display:inline-block;font-size:.7rem;font-weight:700;border-radius:4px;padding:1px 6px;margin-left:4px;vertical-align:1px}" +
    ".gsh .gsh-warn{background:#fdebd0;color:#7e5109}.gsh .gsh-bad{background:#fadbd8;color:#922b21}.gsh .gsh-ok{background:#d5f5e3;color:#145a32}.gsh .gsh-note{background:#e8eaf6;color:#283593}" +
    ".gsh .gsh-seq{padding:3px 0}.gsh .p{color:#1e8449;font-weight:700}.gsh .f{color:#c0392b;font-weight:700}.gsh .n{color:#7f8c8d;font-weight:700}" +
    ".gsh .gsh-err{color:#922b21;padding:8px 0}" +
    "@media (prefers-color-scheme:dark){.gsh{background:#1b2230;border-color:#364152;color:#f0f2f5}.gsh h4,.gsh .gsh-meta{color:#a4a9b3}.gsh .gsh-sit{border-color:#2b3445}}" +
    "@media print{.gsh{display:none!important}}";
  function css() {
    if (w.document.getElementById("gsh-css")) return;
    var s = w.document.createElement("style"); s.id = "gsh-css"; s.textContent = CSS; w.document.head.appendChild(s);
  }
  function esc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function md(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || "")); return m ? (Number(m[2]) + "/" + Number(m[3])) : ""; }
  function when(iso) {
    var d = new Date(iso); if (!iso || isNaN(d)) return md(iso);
    var h = d.getHours(), mi = String(d.getMinutes()).padStart(2, "0"), ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    return (d.getMonth() + 1) + "/" + d.getDate() + " " + h + ":" + mi + " " + ap;
  }
  function mins(sec) { var m = Math.round((Number(sec) || 0) / 60); return m < 1 ? "<1 min" : m + " min"; }
  function val(v) { return v === "pass" ? '<span class="p">PASS</span>' : v === "fail" ? '<span class="f">FAIL</span>' : v === "na" ? '<span class="n">N/A</span>' : esc(String(v || "").toUpperCase()); }
  function first(n) { return String(n || "?").split(/\s+/)[0]; }
  function laneName(l) { return (w.gsLanes && w.gsLanes.short) ? w.gsLanes.short(l) : ("Lane " + l); }

  function worth(lane) {
    if (!lane || lane.mergedInto) return false;
    return (Number(lane.passCount) || 1) > 1 || !!lane.assistInspector || lane.assistOnly === true || lane.rainRunMissing === true;   // r8a: a Rain lane waiting on its water test answer
  }

  function line(h) {
    var real = (h.sittings || []).filter(function (s) { return !s.ghost; });
    var ghosts = (h.sittings || []).length - real.length;
    if (real.length < 2 && !ghosts) return "";
    var t = real.length + " sitting" + (real.length === 1 ? "" : "s") + ": " + real.map(function (s) { return first(s.by) + " " + md(s.at || s.date); }).join(", ");
    if (ghosts) t += " (+" + ghosts + " possible duplicate" + (ghosts === 1 ? "" : "s") + ")";
    return t;
  }

  function seqHtml(c) {
    var parts = c.seq.map(function (x) {
      var tag = x.naOverFail ? ' <span class="gsh-tag gsh-warn">N/A over fail: fail stays</span>' : (x.cleared ? ' <span class="gsh-tag gsh-ok">cleared the fail</span>' : "");
      return val(x.to) + " (" + esc(first(x.by)) + " " + esc(md(x.at)) + ")" + tag;
    });
    return parts.join(" then ") + ' <span class="gsh-meta">&middot; now ' + (c.current ? val(c.current) : "—") + "</span>" +
      (c.differs ? ' <span class="gsh-tag gsh-warn">differs from the current record</span>' : "");
  }

  function render(h, lane) {
    var o = [];
    var f = h.flags || {};
    if (f.disagree) o.push('<div class="gsh-sit"><span class="gsh-tag gsh-bad">LANE FLAGGED</span> The attributed fields on this lane and the saved sittings do not agree. Both are shown. The record on file (what the page above reads) is unchanged.</div>');
    if (f.incomplete) o.push('<div class="gsh-sit"><span class="gsh-tag gsh-warn">INCOMPLETE</span> This lane has more sittings than the ' + esc(h.readCap) + ' that are read; the oldest ' + esc(h.readCap) + ' are shown.</div>');
    var p = h.partial;
    if (p && (p.assistOnly || p.viaAddInspection) && !p.complete) {
      var cnt = p.unmarked ? (p.of ? p.unmarked + " of " + p.of + " unmarked" : p.unmarked + " unmarked") : "not complete";
      o.push('<div class="gsh-sit"><b>' + esc(laneName(lane)) + ": " + esc(cnt) + ", started by " + esc(p.startedBy || "?") + (p.viaAddInspection ? " via Add Inspection" : "") + "</b></div>");
    }
    if (h.rainRun && h.rainRun.missing) o.push('<div class="gsh-sit"><span class="gsh-tag gsh-warn">NOT COMPLETE</span> <b>Water test result missing</b></div>');
    o.push("<h4>Sittings, oldest first</h4>");
    (h.sittings || []).forEach(function (s) {
      var m = s.marks || {};
      var x = '<div class="gsh-sit"><b>' + s.n + ". " + esc(s.by || "?") + "</b> &middot; " + esc(s.label) +
        (s.ghost ? ' <span class="gsh-tag gsh-warn">possible duplicate</span>' : "") +
        '<div class="gsh-meta">' + esc(when(s.at)) + " &middot; " + (s.timed ? esc(mins(s.durationSec)) : "not timed") +
        " &middot; <span class=\"p\">P " + (m.pass || 0) + '</span> <span class="f">F ' + (m.fail || 0) + '</span> <span class="n">N/A ' + (m.na || 0) + "</span>" +
        (s.defects ? " &middot; " + s.defects + " finding" + (s.defects === 1 ? "" : "s") : "") +
        (s.laneInspector && s.laneInspector !== s.by ? " &middot; lane inspector " + esc(s.laneInspector) : "") + "</div>";
      if (s.ghost) x += '<div class="gsh-meta">' + esc(s.ghost.rule) + (s.ghost.addsNothing ? " It adds no mark and no finding that another sitting does not already have." : "") + "</div>";
      if (s.rainRun && s.rainRun.result) {
        // r8a: this sitting's water test answer, and any admin correction of it
        var wn = { roof: "Roof", slide_roof: "Slide roof", ceiling: "Ceiling", wall: "Wall", floor: "Floor", window_compartment: "Window / compartment", other_exterior_components: "Other exterior components", other: "Other" };
        var rn = { no_leak: "No leak", leaked: "Leaked", not_tested: "Not tested" };
        var rtxt = function (r) { return (rn[r.result] || r.result) + ((r.result === "leaked" && (r.where || []).length) ? " &mdash; " + r.where.map(function (k) { return esc(wn[k] || k); }).join(", ") : "") + (r.note ? " &mdash; " + esc(r.note) : ""); };
        x += '<div class="gsh-meta"><b>Water test:</b> ' + rtxt(s.rainRun) + "</div>";
        (s.rainRunEdits || []).forEach(function (e) { x += '<div class="gsh-meta">Water test corrected by ' + esc(e.by) + " " + esc(md(e.at)) + (e.reason ? " &mdash; " + esc(e.reason) : "") + (e.from ? " (was: " + rtxt(e.from) + ")" : "") + "</div>"; });
      }
      (s.adminEdits || []).forEach(function (e) { x += '<div class="gsh-meta">Admin edit by ' + esc(e.who) + " " + esc(md(e.at)) + (e.reason ? " &mdash; " + esc(e.reason) : "") + "</div>"; });
      o.push(x + "</div>");
    });
    if (h.truncated) o.push('<div class="gsh-meta">Showing sittings ' + (h.offset + 1) + "&ndash;" + (h.offset + h.sittings.length) + " of " + h.total + '. <a href="#" class="gsh-more">Show more</a></div>');
    var changed = Object.keys(h.checks || {}).filter(function (k) { var c = h.checks[k]; return c.seq.length > 1 || c.seq.some(function (x) { return x.naOverFail; }); });
    if (changed.length) {
      o.push("<h4>Checks that changed hands</h4>");
      changed.forEach(function (k) { var c = h.checks[k]; o.push('<div class="gsh-seq"><b>' + esc(c.label || k) + ":</b> " + seqHtml(c) + "</div>"); });
    }
    if ((h.defects || []).length) {
      o.push("<h4>Findings</h4>");
      h.defects.forEach(function (d) {
        var st = d.cleared ? ' <span class="gsh-tag gsh-ok">CLEARED by ' + esc(d.cleared.by) + " " + esc(md(d.cleared.at)) + "</span>"
          : (d.laterPass ? ' <span class="gsh-tag gsh-note">later PASS by ' + esc(d.laterPass.by) + " " + esc(md(d.laterPass.at)) + " &mdash; old record, still counted</span>" : "");
        o.push('<div class="gsh-seq"><b>' + esc(d.point || d.checkKey || "Finding") + "</b>" + (d.desc && d.desc !== d.point ? " &mdash; " + esc(d.desc) : "") +
          ' <span class="gsh-meta">raised by ' + esc(d.by || "?") + " " + esc(md(d.at)) + "</span>" + st + "</div>");
      });
    }
    if ((h.photos || []).length || (h.orphanPhotos || []).length) {
      o.push("<h4>Photos</h4>");
      (h.photos || []).forEach(function (p2) {
        o.push('<div class="gsh-seq">' + esc(String(p2.key).split("/").slice(-1)[0]) + ' <span class="gsh-meta">&middot; for ' + esc(p2.check || p2.defectCheck || "?") + " &middot; " + (p2.sitting ? "sitting " + p2.sitting + " by " + esc(p2.by || "?") + " (" + esc(p2.source) + ")" : "sitting unknown") + "</span>" +
          (p2.mismatch ? ' <span class="gsh-tag gsh-bad">sits on a different finding than it was taken for</span>' : "") +
          (p2.sharedWith ? ' <span class="gsh-tag gsh-bad">same file on ' + p2.sharedWith.length + " findings</span>" : "") + "</div>");
      });
      if ((h.orphanPhotos || []).length) o.push('<div class="gsh-meta">' + h.orphanPhotos.length + " photo file" + (h.orphanPhotos.length === 1 ? "" : "s") + " on this lane that no finding points to.</div>");
    }
    o.push('<div class="gsh-meta" style="margin-top:8px">' + (h.source === "attributed" ? "Source: the lane’s own who-and-when record" + (h.verified === true ? ", checked against the saved sittings." : ".") : "Source: rebuilt from the saved sittings (older lane; nothing is stored for it). Read-only.") + "</div>");
    return o.join("");
  }

  function mount(host, o) {
    css();
    o = o || {};
    var api = o.api || w.API || "/.netlify/functions";
    var det = w.document.createElement("details");
    det.className = "gsh"; det.setAttribute("data-lane", o.lane);
    var sum = w.document.createElement("summary"); sum.textContent = "History"; det.appendChild(sum);
    var body = w.document.createElement("div"); body.className = "gsh-body"; det.appendChild(body);
    var loaded = false, offset = 0;
    function load() {
      body.innerHTML = '<div class="gsh-meta">Loading&hellip;</div>';
      return w.fetch(api + "/lane-history?unit=" + encodeURIComponent(o.unit) + "&lane=" + encodeURIComponent(o.lane) + (offset ? "&offset=" + offset : "")).then(function (r) {
        return r.text().then(function (t) { var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) {} if (!r.ok) throw new Error(j.error || ("Server " + r.status)); return j; });
      }).then(function (h) {
        loaded = true;
        var n = h.realTotal != null ? h.realTotal : h.total;
        sum.innerHTML = "History &middot; " + n + " sitting" + (n === 1 ? "" : "s") +
          (h.flags && h.flags.ghosts ? ' <span class="gsh-tag gsh-warn">' + h.flags.ghosts + " possible duplicate</span>" : "") +
          (h.flags && h.flags.disagree ? ' <span class="gsh-tag gsh-bad">flagged</span>' : "") +
          (h.partial && h.partial.viaAddInspection && !h.partial.complete ? ' <span class="gsh-tag gsh-note">started via Add Inspection</span>' : "");
        body.innerHTML = render(h, o.lane);
        var more = body.querySelector(".gsh-more");
        if (more) more.onclick = function (e) { e.preventDefault(); offset = h.offset + h.limit; load(); };
        if (o.onLoaded) o.onLoaded(h);
      }).catch(function (e) { body.innerHTML = '<div class="gsh-err">History could not be loaded: ' + esc(e.message || e) + "</div>"; loaded = false; });
    }
    det.addEventListener("toggle", function () { if (det.open && !loaded) load(); });
    host.appendChild(det);
    return det;
  }

  function fetchCompact(unit, api) {
    api = api || w.API || "/.netlify/functions";
    return w.fetch(api + "/lane-history?unit=" + encodeURIComponent(unit) + "&lane=all&compact=1").then(function (r) { return r.ok ? r.json() : { lanes: {} }; }).then(function (j) { return (j && j.lanes) || {}; }).catch(function () { return {}; });
  }

  w.GSHistory = { worth: worth, mount: mount, fetchCompact: fetchCompact, line: line };
})(window);
