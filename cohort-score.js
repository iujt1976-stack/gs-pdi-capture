/* W1 cohort scoring: PURE functions, no network, no DOM. The page (cohort.html) and the node tests both load this file.
   Six outcomes per claim line:
     flagged        1 Flagged, still paid   (ANY mapped check was flagged on that unit)
     clean          2 Inspected clean, paid (EVERY mapped check that applies to the unit type was inspected and passed) = a true miss
     notInspected   3 Lane not inspected
     notOnChecklist 4 Not on checklist (the crosswalk says so)
     unmapped       4b Unmapped code (W1.1 V1: the code is not in the crosswalk at all; shown on its own, never folded into "not on checklist")
     noCheck        5 No check for this unit type (excluded from the escape rate, shown with dollars)
     unknown        6 Unknown (a read failed: the page refuses to score instead, so this stays 0)
   Escape rate = clean / (clean + flagged). */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.GS_COHORT = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var OUT = ["flagged", "clean", "notInspected", "notOnChecklist", "unmapped", "noCheck", "unknown"];
  var LABEL = { flagged: "Flagged, still paid", clean: "Inspected clean, paid (true miss)", notInspected: "Lane not inspected", notOnChecklist: "Not on checklist", unmapped: "Unmapped code (not in the crosswalk)", noCheck: "No check for this unit type", unknown: "Unknown (read failed)" };
  var PREFIX = { "1": "51", "2": "76", "4": "53" };

  function serialOf(v) { v = String(v == null ? "" : v).trim(); if (v.indexOf("-") >= 0) v = v.split("-").pop().trim(); return v.replace(/\D/g, ""); }
  function yearOf(h) { var y = String(h && h.year == null ? "" : h.year).trim().replace(/\.0$/, ""); return /^\d{4}$/.test(y) ? y : "other"; }
  function days(a, b) { // whole days from date a to date b (YYYY-MM-DD)
    var x = Date.parse(a + "T00:00:00Z"), y = Date.parse(b + "T00:00:00Z"); if (isNaN(x) || isNaN(y)) return null; return Math.round((y - x) / 86400000);
  }
  function isTestSerial(serial, settings) {
    var n = Number(serial), s = settings || {};
    if ((s.testSerials || []).map(String).indexOf(String(serial)) >= 0) return true;
    return (s.testSerialRanges || []).some(function (r) { return Number.isFinite(n) && n >= Number(r.from) && n <= Number(r.to); });
  }
  // W1.1 E2: a lane record that was merged away (mergedInto) is not a live lane: it is skipped everywhere a lane is read
  function liveRec(r) { return r && !r.mergedInto ? r : null; }
  function plantOf(serial, data) {
    var lanes = (data && data.lanes) || {}, best = "", bestAt = "";
    Object.keys(lanes).forEach(function (l) {
      var r = liveRec(lanes[l]); if (!r || !r.plant) return; var p = String(r.plant).trim(); if (!/^(51|53|57|76)$/.test(p)) return;
      var at = String(r.timestamp || r.endedAt || ""); if (!best || at > bestAt) { best = p; bestAt = at; }
    });
    if (best) return best;
    return PREFIX[String(serial).charAt(0)] || "";   // unit-rules: 1xxxxx = 51, 2xxxx = 76, 4xxxx = 53; anything else (incl. 57) cannot be told from the serial
  }
  function unitTypeOf(data) {
    var lanes = (data && data.lanes) || {}, t = null, at = "";
    Object.keys(lanes).forEach(function (l) { var r = liveRec(lanes[l]); if (!r || !r.unitType) return; var a = String(r.timestamp || r.endedAt || ""); if (t === null || a > at) { t = r.unitType; at = a; } });
    return t === "motorized" ? "motorized" : "towable";   // same default the capture server uses
  }
  function canonOf(api, k) { return api && api.canon ? api.canon(k) : k; }

  /** State of ONE mapped check {lane,key} on one unit: flagged | clean | notInspected | noCheck, plus whether it was flagged via the U lane. */
  function checkState(data, api, utype, flags, lane, key) {
    var lanes = (data && data.lanes) || {}, ck = canonOf(api, key), viaU = false, flagged = false;
    Object.keys(lanes).forEach(function (l) {
      var r = liveRec(lanes[l]); if (!r) return;
      (r.defects || []).forEach(function (d) { if (d && d.checkKey && canonOf(api, d.checkKey) === ck && !d.superseded) { flagged = true; if (l === "U") viaU = true; } });
    });
    var rec = liveRec(lanes[lane]);
    if (rec && rec.checks) Object.keys(rec.checks).forEach(function (k) { if (canonOf(api, k) === ck && rec.checks[k] === "fail") flagged = true; });
    if (flagged) return { st: "flagged", viaU: viaU };
    if (!rec) return { st: "notInspected" };
    var mark = null; Object.keys(rec.checks || {}).forEach(function (k) { if (canonOf(api, k) === ck && rec.checks[k]) mark = rec.checks[k]; });
    if (mark === "pass" || mark === "na") return { st: "clean" };
    var ks = api.keys(lane, utype, utype === "towable" ? flags : null, api.verOf(rec));
    var inPack = ks.indexOf(ck) >= 0;
    var laneComplete = typeof rec.unmarkedCount === "number" && rec.unmarkedCount === 0;
    if (!inPack || laneComplete) return { st: "noCheck" };
    return { st: "notInspected" };
  }

  /** Outcome of one claim line given the unit's PDI data. */
  function scoreLine(h, cw, CW, data, api) {
    var e = CW.resolve(cw, h.code);
    if (!e) return { out: "unmapped", why: "code not in crosswalk" };
    if (e.notOnChecklist) return { out: "notOnChecklist", why: "crosswalk: not on checklist" };
    var utype = unitTypeOf(data), flags = { toyHauler: !!(data && data.toyHauler), thWall: !!(data && data.thWall) };
    var states = e.checks.map(function (c) { var s = checkState(data, api, utype, flags, c.lane, c.key); s.lane = c.lane; s.key = c.key; return s; });
    var f = states.filter(function (s) { return s.st === "flagged"; });
    if (f.length) return { out: "flagged", viaU: f.every(function (s) { return s.viaU; }), why: f.map(function (s) { return s.lane + ":" + s.key; }).join(", ") };
    var applies = states.filter(function (s) { return s.st !== "noCheck"; });
    if (!applies.length) return { out: "noCheck", why: "no mapped check exists for this unit type" };
    if (applies.some(function (s) { return s.st === "notInspected"; })) return { out: "notInspected", why: applies.filter(function (s) { return s.st === "notInspected"; }).map(function (s) { return s.lane + ":" + s.key; }).join(", ") };
    return { out: "clean", why: applies.map(function (s) { return s.lane + ":" + s.key; }).join(", ") };
  }

  function blank() { var o = {}; OUT.forEach(function (k) { o[k] = 0; }); return o; }
  function r2(n) { return Math.round(n * 100) / 100; }

  /** ctx: { hits, units:[{unit,firstDate}], unitData:{serial:getUnitJson}, cw, CW, api, settings, today, year:'all'|'2026'|'2027'|..., exposure:{table} } */
  function score(ctx) {
    var cw = ctx.cw, CW = ctx.CW, api = ctx.api, settings = ctx.settings || {}, year = ctx.year || "all", today = ctx.today;
    var testExcluded = [], unknownPlant = [], cohort = {}; var seen = {}; var nonTest = 0;
    (ctx.units || []).forEach(function (u) {
      var s = serialOf(u.unit); if (!s || seen[s]) return; seen[s] = 1;
      if (isTestSerial(s, settings)) { testExcluded.push(s); return; }
      nonTest++;
      var d = ctx.unitData[s]; if (!d) return;   // PDI file is only read for serials that have a claim line; the rest are counted, not read
      var p = plantOf(s, d);
      if (!p) { unknownPlant.push(s); return; }
      cohort[p + "|" + s] = { plant: p, serial: s, pdiDate: u.firstDate || "", data: d };
    });
    var counts = blank(), dollars = blank(), w1Flagged = 0, perPlant = {}, units = {}, byMonth = {}, policy = { lines: 0, dollars: 0 };
    var lines = [];
    (ctx.hits || []).forEach(function (h) {
      var key = String(h.plant) + "|" + serialOf(h.unit); var c = cohort[key]; if (!c) return;
      if (year !== "all" && yearOf(h) !== year) return;
      var r = scoreLine(h, cw, CW, c.data, api); var cost = Number(h.cost) || 0;
      counts[r.out]++; dollars[r.out] = r2(dollars[r.out] + cost); if (r.out === "flagged" && r.viaU) w1Flagged++;
      if (h.policy) { policy.lines++; policy.dollars = r2(policy.dollars + cost); }
      var pp = perPlant[c.plant] || (perPlant[c.plant] = { counts: blank(), dollars: blank(), units: {} });
      pp.counts[r.out]++; pp.dollars[r.out] = r2(pp.dollars[r.out] + cost); pp.units[c.serial] = 1;
      var u = units[key] || (units[key] = { plant: c.plant, serial: c.serial, pdiDate: c.pdiDate, offline: "", cost: 0, counts: blank(), lines: 0 });
      u.cost = r2(u.cost + cost); u.counts[r.out]++; u.lines++; if (!u.offline && h.offline) u.offline = String(h.offline).slice(0, 10);
      lines.push([c.plant, c.serial, h.claim || "", String(h.code), cost, r.out]);
    });
    Object.keys(units).forEach(function (k) {
      var u = units[k]; u.notes = [];
      if (u.offline && u.pdiDate) { var lag = days(u.offline, u.pdiDate); if (lag !== null && lag > 14) u.notes.push("PDI recorded " + lag + " days after build"); u.lag = lag; }
      if (u.offline && today) { var age = days(u.offline, today); if (age !== null && age < 90) u.notes.push("built " + age + " days ago, claims still arriving"); }
      var m = u.offline ? u.offline.slice(0, 7) : "unknown"; var b = byMonth[m] || (byMonth[m] = { month: m, units: 0, counts: blank(), dollars: 0 });
      b.units++; b.dollars = r2(b.dollars + u.cost); OUT.forEach(function (o) { b.counts[o] += u.counts[o]; });
    });
    // W1.1 E5: defects with no checkKey cannot flag a claim (free text). Counted on the claimed units, live lanes only, superseded ones left out.
    var untied = { defects: 0, total: 0, units: 0 };
    Object.keys(units).forEach(function (k) {
      var lanes = (cohort[k] && cohort[k].data && cohort[k].data.lanes) || {}, any = false;
      Object.keys(lanes).forEach(function (l) {
        var r = liveRec(lanes[l]); if (!r) return;
        (r.defects || []).forEach(function (d) { if (!d || d.superseded) return; untied.total++; if (!d.checkKey) { untied.defects++; any = true; } });
      });
      if (any) untied.units++;
    });
    var denom = counts.clean + counts.flagged;
    var rate = denom ? Math.round(1000 * counts.clean / denom) / 10 : null;
    var cohortUnits = nonTest - unknownPlant.length, claimedUnits = Object.keys(units).length;
    var exposure = (ctx.exposure && ctx.exposure.table) || {}; var exposureLoaded = Object.keys(exposure).length > 0;
    return { year: year, cohortUnits: cohortUnits, claimedUnits: claimedUnits, counts: counts, dollars: dollars, w1Flagged: w1Flagged, escapeRatePct: rate, denominator: denom,
      perPlant: perPlant, units: Object.keys(units).map(function (k) { return units[k]; }).sort(function (a, b) { return b.cost - a.cost; }),
      byMonth: Object.keys(byMonth).sort().map(function (k) { return byMonth[k]; }), testExcluded: testExcluded.sort(), unknownPlant: unknownPlant.sort(),
      policy: policy, exposureLoaded: exposureLoaded, untied: untied, lines: lines };
  }
  /** W1.1 E7: a stale get-unit read. A signature of what a read says about the lanes; the page reads a unit twice and trusts it only when the reads agree. */
  function laneSig(r) {
    if (!r) return "-";
    var marked = Object.keys(r.checks || {}).filter(function (k) { return r.checks[k]; }).map(function (k) { return k + ":" + r.checks[k]; }).sort().join(",");
    var defs = (r.defects || []).filter(function (d) { return d && !d.superseded; }).map(function (d) { return (d.checkKey || "") + "/" + (d.id || ""); }).sort().join(",");
    return [r.passCount || 0, String(r.timestamp || r.endedAt || ""), r.unmarkedCount, r.laneComplete ? 1 : 0, r.mergedInto ? "M" : "", marked, defs].join("|");
  }
  function unitSig(d) {
    var lanes = (d && d.lanes) || {};
    return Object.keys(lanes).sort().map(function (l) { return l + "=" + laneSig(lanes[l]); }).join(";") + "#" + (d && d.toyHauler ? 1 : 0) + (d && d.thWall ? 1 : 0);
  }
  /** reads = async function () -> get-unit json; sleep = async function (ms). Two reads that agree are the answer. If they differ, a third read decides by majority; no majority = throw (the page then refuses to score). */
  async function readStable(read, sleep, gapMs) {
    var a = await read(); await sleep(gapMs == null ? 1200 : gapMs);
    var b = await read();
    if (unitSig(a) === unitSig(b)) return { data: b, reads: 2, differed: false };
    await sleep(gapMs == null ? 1200 : gapMs);
    var c = await read(), sc = unitSig(c);
    if (sc === unitSig(b)) return { data: c, reads: 3, differed: true };
    if (sc === unitSig(a)) return { data: c, reads: 3, differed: true };
    throw new Error("three reads of this unit disagree (stale read); nothing is scored from it");
  }
  return { OUT: OUT, LABEL: LABEL, liveRec: liveRec, unitSig: unitSig, readStable: readStable, serialOf: serialOf, yearOf: yearOf, isTestSerial: isTestSerial, plantOf: plantOf, unitTypeOf: unitTypeOf, checkState: checkState, scoreLine: scoreLine, score: score };
});
