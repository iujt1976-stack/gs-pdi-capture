/* Shared serial → plant rules.
 * 1xxxxx (6) = 51 locked
 * 2xxxx  (5) = 76 locked
 * 4xxxx  (5) = 53 locked
 * Anything else (incl. 57) = plant manual. Length not locked.
 */
(function (w) {
  var PLANTS = { "1": { plant: "51", len: 6, label: "Plant 51 serials are 6 digits (1xxxxx)." },
                 "2": { plant: "76", len: 5, label: "Plant 76 serials are 5 digits (2xxxx)." },
                 "4": { plant: "53", len: 5, label: "Plant 53 serials are 5 digits (4xxxx)." } };

  function serial(v) {
    v = String(v || "").trim();
    if (v.indexOf("-") >= 0) v = v.split("-").pop().trim();
    return v.replace(/\D/g, "");
  }

  function checkUnit(raw, plantPicked) {
    var u = serial(raw);
    var picked = String(plantPicked || "").trim();
    if (!u) return { ok: false, error: "Unit # required.", unit: "", plant: "", locked: false };
    var rule = PLANTS[u.charAt(0)];
    if (rule) {
      if (u.length !== rule.len) return { ok: false, error: rule.label, unit: u, plant: rule.plant, locked: true };
      if (picked && picked !== rule.plant) {
        return { ok: false, error: "Serial " + u + " is plant " + rule.plant + " — plant is locked.", unit: u, plant: rule.plant, locked: true };
      }
      return { ok: true, unit: u, plant: rule.plant, locked: true };
    }
    return { ok: true, unit: u, plant: picked, locked: false };
  }

  function applyPlant(plantSel, suggested) {
    if (!plantSel || !suggested) return;
    plantSel.value = suggested;
  }

  function syncPlantLock(plantSel, result) {
    if (!plantSel || !result) return;
    if (result.locked && result.plant) {
      plantSel.value = result.plant;
      plantSel.disabled = true;
      plantSel.title = "Locked to plant " + result.plant + " by unit #";
    } else {
      plantSel.disabled = false;
      plantSel.title = "";
    }
  }

  function bind(unitInput, plantSel, onChange) {
    if (!unitInput) return;
    function run() {
      var c = checkUnit(unitInput.value, plantSel && plantSel.value);
      if (c.ok && c.unit) unitInput.value = c.unit;
      syncPlantLock(plantSel, c);
      if (onChange) onChange(c);
      return c;
    }
    unitInput.addEventListener("input", run);
    unitInput.addEventListener("blur", run);
    if (plantSel) plantSel.addEventListener("change", run);
    return run;
  }

  function isFullName(n) {
    n = String(n || "").trim().replace(/\s+/g, " ");
    return n.length >= 3 && /\s/.test(n);
  }
  function rosterNames(list) {
    return (list || []).map(function (n) { return String(n || "").trim().replace(/\s+/g, " "); })
      .filter(function (n, i, a) { return n && /\s/.test(n) && a.indexOf(n) === i; });
  }
  function paintSelect(sel, list, pref) {
    if (!sel) return;
    var names = rosterNames(list);
    sel.innerHTML = "";
    var z = document.createElement("option");
    z.value = ""; z.textContent = "— Select full name —";
    sel.appendChild(z);
    names.forEach(function (n) {
      var o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o);
    });
    sel.value = (pref && names.indexOf(pref) >= 0) ? pref : "";
  }
  function onRoster(ok) {
    fetch("/.netlify/functions/settings").then(function (r) { return r.text(); }).then(function (raw) {
      var list = [];
      try { list = (JSON.parse(raw || "{}").inspectors) || []; } catch (e) { list = []; }
      w._roster = rosterNames(list);
      if (ok) ok(w._roster);
    }).catch(function () { w._roster = []; if (ok) ok([]); });
  }

  w.gsUnit = { serial: serial, checkUnit: checkUnit, applyPlant: applyPlant, syncPlantLock: syncPlantLock, bind: bind };
  w.gsRoster = { isFullName: isFullName, names: rosterNames, paint: paintSelect, load: onRoster };
})(window);
