(function (w) {
  var REQUIRE_U = false;
  var META = {
    R: { title: "Rain, Seals, Roofs", required: true },
    S: { title: "Systems", required: true },
    E: { title: "Exterior + Underbelly", required: true },
    I: { title: "Interior", required: true },
    U: { title: "PDI Validation", required: false }
  };
  var LEGACY = ["1", "2", "3", "4"];
  var NEW = ["R", "S", "E", "I", "U"];
  var REQUIRED = ["R", "S", "E", "I"];
  var ALL = LEGACY.concat(NEW);
  function name(k) {
    k = String(k || "");
    if (META[k]) return META[k].title;
    if (k === "1") return "Systems (legacy)";
    if (k === "2") return "Roof / Underbelly (legacy)";
    if (k === "3") return "Exteriors (legacy)";
    if (k === "4") return "Interiors (legacy)";
    return "Lane " + k;
  }
  function shortName(k) {
    k = String(k || "");
    if (k === "R") return "Rain";
    if (k === "S") return "Systems";
    if (k === "E") return "Exterior";
    if (k === "I") return "Interior";
    if (k === "U") return "Validation";
    return name(k);
  }
  function hasNew(keys) {
    return (keys || []).some(function (k) { return NEW.indexOf(String(k)) >= 0; });
  }
  function required(present) {
    if (hasNew(present)) return REQUIRE_U ? NEW.slice() : REQUIRED.slice();
    if ((present || []).some(function (k) { return LEGACY.indexOf(String(k)) >= 0; })) return LEGACY.slice();
    return REQUIRE_U ? NEW.slice() : REQUIRED.slice();
  }
  function isComplete(present) {
    var need = required(present);
    var set = {};
    (present || []).forEach(function (k) { set[String(k)] = true; });
    return need.every(function (k) { return !!set[k]; });
  }
  function missing(present) {
    var need = required(present);
    var set = {};
    (present || []).forEach(function (k) { set[String(k)] = true; });
    return need.filter(function (k) { return !set[k]; });
  }
  function slotsOf(data) {
    return Object.keys((data && data.lanes) || {});
  }
  w.gsLanes = {
    REQUIRE_U: REQUIRE_U, META: META, LEGACY: LEGACY, NEW: NEW,
    REQUIRED: REQUIRED, ALL: ALL, name: name, short: shortName,
    hasNew: hasNew, required: required, isComplete: isComplete,
    missing: missing, slotsOf: slotsOf
  };
})(window);
