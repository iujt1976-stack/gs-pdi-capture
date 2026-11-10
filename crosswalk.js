/**
 * W1: claim code -> PDI check crosswalk. DATA ONLY lives in warranty-crosswalk.json. This file loads and validates it.
 * No text matching anywhere. A claim code either has an entry, or it is "unmapped" (counted apart, never guessed).
 *
 * File shape:
 *   { "version": "2026-11-03-draft1", "status": "DRAFT-UNAPPROVED" | "APPROVED",   // version may be a string or a number
 *     "approvedBy": null | "Jason Thompson", "approvedAt": null | "YYYY-MM-DD",
 *     "codes": {
 *        "1019": { "group": "Exterior Seal / Anti-Wick",
 *                  "checks": [ { "lane": "R", "key": "exterior_seal_antiwick" } ] },       // may list several checks
 *        "1053": { "group": "Slide Out Floor", "notOnChecklist": true }
 *     } }
 * One entry has EITHER non-empty "checks" OR notOnChecklist:true, never both, never neither.
 * "checks" is a list of {lane,key} (not one lane + keys) because one claim group can be caught by checks in several lanes.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.GS_CROSSWALK = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var LANES = ["R", "S", "E", "I", "U"];
  var TYPES = ["towable", "motorized"];
  var TOY = [null, { toyHauler: true, thWall: true }, { toyHauler: true, thWall: false }];

  // Every canonical check key that exists in lane-data, in any pack version, either unit type, any toy-hauler flag.
  // Returns { "R": { key: {versions:[...], types:[...]} }, ... }
  function universe(api) {
    var out = {};
    LANES.forEach(function (L) { out[L] = {}; });
    Object.keys(api.packs).forEach(function (vs) {
      var v = Number(vs);
      LANES.forEach(function (L) {
        TYPES.forEach(function (t) {
          TOY.forEach(function (o) {
            var ks = api.keys(L, t, o, v);
            ks.forEach(function (k) {
              var e = out[L][k] || (out[L][k] = { versions: [], types: [] });
              if (e.versions.indexOf(v) < 0) e.versions.push(v);
              if (e.types.indexOf(t) < 0) e.types.push(t);
            });
          });
        });
      });
    });
    return out;
  }

  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }

  // Returns { ok, errors:[], warnings:[], stats:{codes, mapped, notOnChecklist, checksUsed, oldPackOnly:[...] }, approved }
  // opts.requireApproved: treat an unapproved file as an error (the build uses this; the page does not).
  function validate(cw, api, opts) {
    opts = opts || {};
    var errors = [], warnings = [];
    var stats = { codes: 0, mapped: 0, notOnChecklist: 0, checksUsed: 0, oldPackOnly: [] };
    if (!isObj(cw)) return { ok: false, errors: ["crosswalk is not an object"], warnings: [], stats: stats, approved: false };
    if (!((typeof cw.version === "string" && cw.version.trim()) || (typeof cw.version === "number" && isFinite(cw.version)))) errors.push("version missing");
    if (!isObj(cw.codes)) { errors.push("codes missing"); return { ok: false, errors: errors, warnings: warnings, stats: stats, approved: false }; }
    var approved = cw.status === "APPROVED" && typeof cw.approvedBy === "string" && cw.approvedBy.trim() !== "" &&
      typeof cw.approvedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cw.approvedAt);
    if (cw.status === "APPROVED" && !approved) errors.push("status APPROVED but approvedBy / approvedAt (YYYY-MM-DD) missing or malformed");
    if (cw.status !== "APPROVED" && cw.status !== "DRAFT-UNAPPROVED") errors.push("status must be APPROVED or DRAFT-UNAPPROVED");
    if (opts.requireApproved && !approved) errors.push("crosswalk is not approved (approvedBy / approvedAt)");

    var U = universe(api);
    var used = {}, oldOnly = {};
    Object.keys(cw.codes).forEach(function (code) {
      stats.codes++;
      var e = cw.codes[code];
      var where = "code " + code;
      if (!/^[0-9A-Za-z]{2,12}$/.test(code)) errors.push(where + ": claim code format");
      if (!isObj(e)) { errors.push(where + ": entry is not an object"); return; }
      if (typeof e.group !== "string" || !e.group.trim()) errors.push(where + ": group missing");
      var hasChecks = Array.isArray(e.checks) && e.checks.length > 0;
      var not = e.notOnChecklist === true;
      if (hasChecks && not) errors.push(where + ": has checks AND notOnChecklist");
      else if (!hasChecks && !not) errors.push(where + ": neither checks nor notOnChecklist");
      if (e.checks !== undefined && !Array.isArray(e.checks)) errors.push(where + ": checks must be a list");
      if (not) stats.notOnChecklist++;
      if (hasChecks) {
        stats.mapped++;
        var seen = {};
        e.checks.forEach(function (c, i) {
          var w = where + " check " + (i + 1);
          if (!isObj(c)) { errors.push(w + ": not an object"); return; }
          if (LANES.indexOf(c.lane) < 0) { errors.push(w + ": lane '" + c.lane + "' is not one of " + LANES.join("")); return; }
          if (typeof c.key !== "string" || !c.key) { errors.push(w + ": key missing"); return; }
          if (c.key !== api.canon(c.key)) { errors.push(w + ": '" + c.key + "' is an alias; use canonical '" + api.canon(c.key) + "'"); return; }
          var u = U[c.lane][c.key];
          if (!u) {
            var elsewhere = LANES.filter(function (L) { return U[L][c.key]; });
            errors.push(w + ": key '" + c.key + "' does not exist in lane " + c.lane + (elsewhere.length ? " (it exists in " + elsewhere.join(",") + ")" : " or any other lane"));
            return;
          }
          var id = c.lane + ":" + c.key;
          if (seen[id]) errors.push(w + ": duplicate " + id); seen[id] = 1;
          used[id] = 1;
          var cur = api.currentPackV;
          if (u.versions.indexOf(cur) < 0) oldOnly[id] = u.versions.slice();
          if (c.lane === "U") warnings.push(w + ": maps to a U-lane check");
        });
      }
    });
    stats.checksUsed = Object.keys(used).length;
    stats.oldPackOnly = Object.keys(oldOnly).map(function (k) { return { check: k, versions: oldOnly[k] }; });
    if (stats.oldPackOnly.length) warnings.push(stats.oldPackOnly.length + " mapped check(s) exist only in older pack versions");
    return { ok: errors.length === 0, errors: errors, warnings: warnings, stats: stats, approved: approved };
  }

  // Exact lookup. Never fuzzy. Returns null for an unmapped code.
  function resolve(cw, code) {
    if (!cw || !cw.codes) return null;
    var k = String(code == null ? "" : code).trim();
    return Object.prototype.hasOwnProperty.call(cw.codes, k) ? cw.codes[k] : null;
  }

  return { universe: universe, validate: validate, resolve: resolve, LANES: LANES };
});
