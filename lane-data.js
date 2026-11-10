// 5-lane restack — keys R/S/E/I/U. Display names live in gs-lanes.js.
// Release 3 (2026-10-08): ONE source of truth for the checklist. Browser pages AND the server read this file.
//   - netlify/functions/lane-data.js must be a byte-identical copy (verify script + test enforce it).
//   - Items may carry when: "th" (toy hauler), "thwall" (toy hauler + permanent wall), "thnowall" (toy hauler, no wall).
//   - alt: [{when,label}] swaps the label under that condition. Use GS_LANE_API.pack(...) — never read the arrays raw.
//   - GS_KEY_ALIAS (old key -> canonical key) is the ONLY alias table. _rollup, traveler and aggregator read it from here.
var GS_LANE = {
  "R": {
    title: "Rain, Seals, Roofs",
    towable: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Rubber Roof / Roof Decking Seams", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Ladder / Rail Penetration Seals", sev: 2 },
      { key: "cap_transition", label: "Cap Transitions: Front / Rear / Sides", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal", sev: 2 },
      { key: "ladder_receiver_seal", label: "Ladder Receiver Seals", sev: 2 },
      { key: "other_exterior_components", label: "Other Exterior Components: GFCI Outlets / Lights / Water Fill Points / etc.", sev: 2 },
      { header: "Inside path", note: "Prep inspection: look for wall, ceiling and floor issues before and after the water run." },
      { key: "ceiling_first_pass_drip", label: "Ceiling Prep Inspection", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panel Prep Inspection", sev: 2 },
      { key: "lino_first_pass_wet", label: "Floor / Lino Prep Inspection", sev: 2 }
    ],
    motorized: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Rubber Roof / Roof Decking Seams", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Solar / Ladder / Rail Penetration Seals", sev: 2 },
      { key: "cap_transition", label: "Cap Transitions: Front / Rear / Sides", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal", sev: 2 },
      { key: "ladder_receiver_seal", label: "Ladder Receiver Seals", sev: 2 },
      { key: "other_exterior_components", label: "Other Exterior Components: GFCI Outlets / Lights / Water Fill Points / etc.", sev: 2 },
      { header: "Inside path", note: "Prep inspection: look for wall, ceiling and floor issues before and after the water run." },
      { key: "ceiling_first_pass_drip", label: "Ceiling Prep Inspection", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panel Prep Inspection", sev: 2 },
      { key: "lino_first_pass_wet", label: "Floor / Lino Prep Inspection", sev: 2 }
    ]
  },
  "S": {
    title: "Systems",
    towable: [
      { header: "Power" },
      { key: "continuity_test", label: "Continuity Test", sev: 1 },
      { key: "ac_dc_panel", label: "AC/DC Panel / Breakers / Fuses", sev: 1 },
      { key: "battery_hookup_disconnect", label: "Battery Hookup / Disconnect / Strap", sev: 1 },
      { key: "inverter", label: "Inverter Function (if solar)", sev: 3 },
      { key: "monitor_panel_converter_water_pump", label: "Monitor Panel / Converter / Water Pump", sev: 3 },
      { key: "recepts_gfis_usbs", label: "Recepts / GFIs / USBs", sev: 1 },
      { key: "tv_antenna_booster", label: "TV / Antenna / Booster", sev: 3 },
      { header: "Water" },
      { key: "bypass_valve", label: "Bypass Valve (on WH)", sev: 2 },
      { key: "air_test_water_lines", label: "Air Test / Water Lines (80\u2013100 psi / 10 min, heater bypassed)", sev: 2 },
      { key: "city_fill_backflow", label: "City Fill / Backflow Check", sev: 2 },
      { key: "faucets_pressurize", label: "Faucets / Pressurize Lines", sev: 2 },
      { key: "hot_cold_orientation", label: "Hot / Cold Line Orientation", sev: 3 },
      { key: "black_grey_fresh_tanks", label: "Black / Grey / Fresh Tanks", sev: 2 },
      { key: "water_heater", label: "Water Heater (110 OFF after test)", sev: 2 },
      { key: "drainage_pipes", label: "Drains / P-Traps / Low Points", sev: 2 },
      { key: "outside_shower", label: "Outside Shower", sev: 3 },
      { header: "Outside kitchen" },
      { key: "osk_function", label: "Outside Kitchen \u2014 Faucet / GFI / Fridge Power", sev: 2 },
      { header: "LP" },
      { key: "lp_drop_test", label: "MEASURE lockup (11\u201314 in. WC, needle stops itself) then 8 in. / 3 min + soap", sev: 1 },
      { key: "lp_burnoff", label: "LP Burn-Off (hood + cabinet blowers ON; furnace vent must be hot)", sev: 1 },
      { header: "Climate" },
      { key: "ac_air_vents", label: "A/C & Air Vents", sev: 3 },
      { key: "thermostat", label: "Thermostat Function", sev: 3 },
      { key: "furnace_function", label: "Furnace \u2014 Lights / Runs / Heats (validated)", sev: 2 },
      { header: "Exterior function" },
      { key: "awning", label: "Awning \u2014 Full Travel / Lock", sev: 3 },
      { key: "jacks_leveling_function", label: "Hitch / Stab / Leveling Jacks", sev: 3 },
      { key: "slideout_t_rails_alignment", label: "Slide Travel / Alignment / T-Rails", sev: 2 },
      { key: "marker_tail_turn_signal_lights", label: "Marker / Tail / Turn Signal Lights", sev: 1 },
      { header: "Interior function" },
      { key: "interior_lights", label: "Interior Lights", sev: 3 },
      { key: "refrigerator_microwave", label: "Refrigerator / Microwave", sev: 3 },
      { key: "range_hood_stove_fireplace", label: "Range / Stove / Hood", sev: 3 },
      { key: "fireplace_function", label: "Fireplace Function", sev: 3 },
      { header: "Toy hauler (fuel station / generator)", when: "th" },
      { key: "th_fuel_shutoff_lock", label: "Fuel Station \u2014 Shutoff and Lock: emergency shutoff readily accessible, within 18 in. of the outside wall (nozzle trigger and timer switch do not count); station locks (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "th_fuel_compartment", label: "Fuel Station \u2014 Compartment: nonporous and noncombustible, seams sealed (no putty tape), 1/2 in. drain holes at every low point to the exterior, no spark equipment (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "th_fuel_hose_clearance", label: "Fuel Station \u2014 Hose, Clearance, Pump: hose 5 ft max; appliance vents and 120V gear 3 ft or more from the extended nozzle; nozzle-to-chassis continuity; pump secure (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "generator", label: "Generator Function (if equipped)", sev: 1, when: "th" },
      { key: "th_garage_function", label: "Garage Lights / Heat / A/C / Vents \u2014 function", sev: 3, when: "th" },
      { header: "Close" },
      { key: "detectors", label: "Smoke / LP / CO Detectors", sev: 1 }
    ],
    motorized: [
      { header: "Power" },
      { key: "continuity_test", label: "Continuity Test", sev: 1 },
      { key: "ac_dc_panel", label: "AC/DC Panel / Breakers / Fuses", sev: 1 },
      { key: "battery_hookup_disconnect", label: "Battery Hookup / Disconnect / Strap", sev: 1 },
      { key: "inverter", label: "Inverter Function (if solar)", sev: 3 },
      { key: "monitor_panel_converter_water_pump", label: "Monitor Panel / Converter / Water Pump", sev: 3 },
      { key: "recepts_gfis_usbs", label: "Recepts / GFIs / USBs", sev: 1 },
      { key: "tv_antenna_booster", label: "TV / Antenna / Booster", sev: 3 },
      { header: "Water" },
      { key: "bypass_valve", label: "Bypass Valve (on WH)", sev: 2 },
      { key: "air_test_water_lines", label: "Air Test / Water Lines (80\u2013100 psi / 10 min, heater bypassed)", sev: 2 },
      { key: "city_fill_backflow", label: "City Fill / Backflow Check", sev: 2 },
      { key: "faucets_pressurize", label: "Faucets / Pressurize Lines", sev: 2 },
      { key: "hot_cold_orientation", label: "Hot / Cold Line Orientation", sev: 3 },
      { key: "black_grey_fresh_tanks", label: "Black / Grey / Fresh Tanks", sev: 2 },
      { key: "water_heater", label: "Water Heater (110 OFF after test)", sev: 2 },
      { key: "drainage_pipes", label: "Drains / P-Traps / Low Points", sev: 2 },
      { key: "outside_shower", label: "Outside Shower", sev: 3 },
      { header: "Outside kitchen" },
      { key: "osk_function", label: "Outside Kitchen \u2014 Faucet / GFI / Fridge Power", sev: 2 },
      { header: "LP" },
      { key: "lp_drop_test", label: "MEASURE lockup (11\u201314 in. WC, needle stops itself) then 8 in. / 3 min + soap", sev: 1 },
      { key: "lp_burnoff", label: "LP Burn-Off (hood + cabinet blowers ON; furnace vent must be hot)", sev: 1 },
      { header: "Climate" },
      { key: "ac_air_vents", label: "A/C & Air Vents", sev: 3 },
      { key: "thermostat", label: "Thermostat Function", sev: 3 },
      { key: "generator", label: "Generator Start / Load / Exhaust", sev: 1 },
      { key: "furnace_function", label: "Furnace \u2014 Lights / Runs / Heats (validated)", sev: 2 },
      { header: "Exterior function" },
      { key: "awning", label: "Awning \u2014 Full Travel / Lock", sev: 3 },
      { key: "jacks_leveling_function", label: "Jacks / Leveling Function", sev: 3 },
      { key: "slideout_function", label: "Slide Travel / Alignment", sev: 2 },
      { key: "marker_tail_turn_signal_lights", label: "Marker / Tail / Turn Signal Lights", sev: 1 },
      { header: "Interior function" },
      { key: "interior_lights", label: "Interior Lights", sev: 3 },
      { key: "refer_microwave_stove_range_hood", label: "Refer / Microwave / Stove / Range Hood", sev: 3 },
      { key: "fireplace_function", label: "Fireplace Function", sev: 3 },
      { header: "Cab" },
      { key: "cab_dash_gauges", label: "Dash / Gauges / Warning Lights", sev: 3 },
      { key: "cab_windshield_wipers", label: "Windshield / Wipers / Washers", sev: 2 },
      { key: "cab_climate", label: "Cab A/C / Heater / Dash Vents", sev: 3 },
      { key: "cab_radio", label: "Cab Radio / Audio Function", sev: 4 },
      { header: "Close" },
      { key: "detectors", label: "Smoke / LP / CO Detectors", sev: 1 }
    ]
  },
  "E": {
    title: "Exterior + Underbelly",
    towable: [
      { header: "Ground" },
      { key: "hitch_chains_cables_battery_disconnect", label: "Hitch / Chains / Breakaway Cable", sev: 1 },
      { key: "lugs_axles_springs", label: "Lugs / Axles / Springs / Brake Wires", sev: 1 },
      { header: "Under the coach" },
      { key: "underbelly", label: "Underbelly Secure / Protection", sev: 2 },
      { key: "varmint_foam_loom", label: "Pests / Foam Holes / Loomed Wires", sev: 2 },
      { key: "lp_lines_secured", label: "LP Lines Secured (Rubber / Copper)", sev: 1 },
      { key: "plumbing_slope_tank_leaks", label: "Plumbing Slope / Tank Leaks (if applicable)", sev: 2 },
      { key: "wheel_well", label: "Wheel Well", sev: 2 },
      { key: "slideout_roof_underneath_floor", label: "Slide Floor / Screws / Corner Cups / Seals", sev: 2 },
      { header: "Skin" },
      { key: "metal_glass_diamond_plate", label: "Metal / Glass / Diamond Plate", sev: 4 },
      { key: "fenders_flare", label: "Fenders / Wheel-Well Flare", sev: 2 },
      { key: "graphics", label: "Graphics", sev: 4 },
      { key: "screw_gutter_rails", label: "Screw & Gutter Rails (hang)", sev: 2 },
      { key: "vin_tags_rvia_qai_sticker", label: "Vin / RVIA / QAI / Required Exterior Labels", sev: 4 },
      { header: "Seals \u2014 dry visual" },
      { key: "ext_seal_bead", label: "Anti-Wick / Exterior Seal Bead (dry \u2014 gap / skip / thin)", sev: 2 },
      { key: "ext_rail_seal", label: "Screw Rail + Gutter Rail Seal (dry)", sev: 2 },
      { key: "ext_opening_seal", label: "Window + Compartment Seal (dry)", sev: 2 },
      { key: "ext_slide_awning_seal", label: "Slide Bulb / Sweep + Awning Rail Seal (dry)", sev: 2 },
      { key: "ext_ladder_receiver_seal", label: "Ladder Receiver Seals (dry \u2014 gap / skip / thin; N/A if no ladder)", sev: 2 },
      { header: "Openings" },
      { key: "windows_compartment_doors", label: "Windows & Compartment Doors / Keys Tagged", sev: 2 },
      { key: "entry_screen_door_entry_steps", label: "Entry / Screen Door & Entry Steps", sev: 3 },
      { key: "passthrough_power_cord_jack_handle", label: "Cargo / Passthrough \u2014 Floor, Lino, Cord, Jack Handle", sev: 3 },
      { key: "osk_shell", label: "Outside Kitchen \u2014 Door / Slide / Latch / Counter", sev: 3 },
      { key: "furnace_heat_vents", label: "Furnace Vent / Exhaust (exterior only)", sev: 3 },
      { key: "water_heater_exterior_insp", label: "Water Heater \u2014 Exterior (door / vent / burner area / seal)", sev: 2 },
      { header: "Ramp door (toy hauler)", when: "th" },
      { key: "th_ramp_door", label: "Ramp Door \u2014 latches, seals, cables, springs, supports and stabilizers", sev: 2, when: "th" },
      { key: "th_ramp_patio", label: "Ramp Door as Patio \u2014 rails, chains and supports (if equipped)", sev: 3, when: "th" },
      { key: "th_ramp_powered", label: "Powered Ramp Door \u2014 cannot activate unintentionally in transit (if powered)", sev: 1, when: "th" },
      { header: "Lights and fittings" },
      { key: "power_inlet_city_fresh_fill", label: "Power Inlet / Cord / City / Fresh Fill", sev: 3 }
    ],
    motorized: [
      { header: "Under the coach" },
      { key: "underbelly", label: "Underbelly Secure / Protection", sev: 2 },
      { key: "varmint_foam_loom", label: "Pests / Foam Holes / Loomed Wires", sev: 2 },
      { key: "lp_lines_secured", label: "LP Lines Secured", sev: 1 },
      { key: "plumbing_slope_tank_leaks", label: "Plumbing Slope / Tank Leaks (if applicable)", sev: 2 },
      { key: "slideout_roof_underneath_floor", label: "Slide Floor / Seals / Cups", sev: 2 },
      { header: "Skin" },
      { key: "fiberglass", label: "Fiberglass / Cap / Sidewall / Rear", sev: 4 },
      { key: "fenders_flare", label: "Fenders / Wheel-Well Flare", sev: 2 },
      { key: "graphics", label: "Graphics", sev: 4 },
      { key: "screw_gutter_rails", label: "Screw / Gutter Rails (hang)", sev: 2 },
      { key: "vin_tags_rvia_qai_sticker", label: "Vin / RVIA / QAI / Required Exterior Labels", sev: 4 },
      { header: "Seals \u2014 dry visual" },
      { key: "ext_seal_bead", label: "Anti-Wick / Exterior Seal Bead (dry \u2014 gap / skip / thin)", sev: 2 },
      { key: "ext_rail_seal", label: "Screw Rail + Gutter Rail Seal (dry)", sev: 2 },
      { key: "ext_opening_seal", label: "Window + Compartment Seal (dry)", sev: 2 },
      { key: "ext_slide_awning_seal", label: "Slide Bulb / Sweep + Awning Rail Seal (dry)", sev: 2 },
      { key: "ext_ladder_receiver_seal", label: "Ladder Receiver Seals (dry \u2014 gap / skip / thin; N/A if no ladder)", sev: 2 },
      { header: "Openings" },
      { key: "windows", label: "Windows (function / fit)", sev: 2 },
      { key: "compartments", label: "Compartments / Keys Tagged", sev: 3 },
      { key: "cargo_area", label: "Cargo Area \u2014 Floor / Lino", sev: 3 },
      { key: "osk_shell", label: "Outside Kitchen \u2014 Door / Slide / Latch / Counter", sev: 3 },
      { key: "furnace_heat_vents", label: "Furnace Vent / Exhaust (exterior only)", sev: 3 },
      { key: "water_heater_exterior_insp", label: "Water Heater \u2014 Exterior (door / vent / burner area / seal)", sev: 2 },
      { header: "Lights and fittings" },
      { key: "power_inlet_city_fresh_fill", label: "Power Inlet / Cord / City & Fresh Fill", sev: 3 }
    ]
  },
  "I": {
    title: "Interior",
    towable: [
      { header: "At the door" },
      { key: "egress_windows", label: "Egress Windows (Opposite Sides / Code)", sev: 1 },
      { key: "fire_extinguisher", label: "Fire Extinguisher (10BC)", sev: 1, alt: [{ when: "thnowall", label: "Fire Extinguisher (1A:10-B:C minimum)" }] },
      { header: "Room" },
      { key: "lino_floor_decking", label: "Lino & Floor Decking / Squeaks", sev: 4 },
      { key: "ceiling_wall_panels_trim", label: "Ceiling & Wall Panels / Trim", sev: 4 },
      { key: "cabinet_doors_panels_trim_stiles", label: "Cabinet Doors / Panels / Trim / Stiles", sev: 4 },
      { key: "drawers", label: "Drawers", sev: 3 },
      { key: "countertops", label: "Countertops / Extensions", sev: 4 },
      { key: "window_valances", label: "Windows / Valances / Shades", sev: 4 },
      { key: "bed_bath_doors", label: "Bed / Bath Doors / Struts", sev: 3 },
      { key: "dinette_table_booths", label: "Dinette Table / Booths / Code", sev: 3 },
      { key: "beds_bunks_under_furniture", label: "Beds / Bunks / Under Furniture", sev: 3 },
      { key: "sofa_chairs_ladders", label: "Sofa / Chairs / Ladders", sev: 3 },
      { key: "tub_shower_sinks_faucets", label: "Tub / Shower / Toilet / Sinks / Faucets", sev: 2 },
      { header: "Garage (toy hauler)", when: "th" },
      { key: "th_floor_covering", label: "Garage Floor Covering \u2014 entire transport area, seamless, non-absorbent to fuel (vinyl / lino / metal / sealed deck; no carpet or untreated wood)", sev: 1, when: "th" },
      { key: "th_floor_seal_seams", label: "Garage Floor Seal \u2014 every seam and corner at walls, wheel wells, cabinets and partitions sealed with fuel-resistant sealant (no putty tape; 1/2 in. gap + sealant where a wall is carpeted or absorbent)", sev: 1, when: "th" },
      { key: "th_floor_seal_penetrations", label: "Garage Floor Seal \u2014 sealant around every D-ring, floor register and floor penetration", sev: 1, when: "th" },
      { key: "th_garage_vents", label: "Garage Vents \u2014 two, 10 sq in. openable each: forward upper end and lower rear end (lower vent NOT in the floor)", sev: 2, when: "th", alt: [{ when: "thwall", label: "Garage Vents \u2014 two, 10 sq in. openable each: forward upper end and lower rear end (floor-level lower vent allowed with the wall)" }] },
      { key: "th_fire_extinguisher", label: "Garage Fire Extinguisher \u2014 additional 1A:10-B:C within 24 in. of the exterior / ramp door, not blocked when a bed is lowered", sev: 1, when: "thwall" },
      { key: "th_co_alarm", label: "Garage CO Alarm \u2014 sleeping area in the garage behind the wall (N/A if none)", sev: 1, when: "thwall" },
      { key: "th_receptacle", label: "Garage Receptacle \u2014 at least one", sev: 2, when: "th", alt: [{ when: "thwall", label: "Garage Receptacle \u2014 at least one, GFCI" }] },
      { key: "th_divider", label: "Garage Divider \u2014 wall / door / seals, sealed passage", sev: 2, when: "thwall" },
      { key: "th_bed_lift", label: "Garage Beds / Sofa Lifts / Bunks \u2014 operation and locks", sev: 3, when: "th" },
      { key: "th_tiedowns", label: "Tie-Downs / D-Rings \u2014 secure, rating label present", sev: 2, when: "th" }
    ],
    motorized: [
      { header: "At the door" },
      { key: "egress_windows", label: "Egress Windows (Opposite Sides / Code)", sev: 1 },
      { key: "fire_extinguisher", label: "Fire Extinguisher (10BC)", sev: 1 },
      { header: "Room" },
      { key: "lino_floor_decking", label: "Lino & Floor Decking / Squeaks", sev: 4 },
      { key: "ceiling_wall_panels_trim", label: "Ceiling & Wall Panels / Trim", sev: 4 },
      { key: "cabinet_doors_panels_trim_stiles", label: "Cabinet Doors / Panels / Trim / Stiles", sev: 4 },
      { key: "drawers", label: "Drawers", sev: 3 },
      { key: "countertops", label: "Countertops / Extensions", sev: 4 },
      { key: "window_valances", label: "Windows / Valances / Shades", sev: 4 },
      { key: "bed_bath_doors", label: "Bed / Bath Doors / Struts", sev: 3 },
      { key: "dinette_table_booths", label: "Dinette Table / Booth / Code", sev: 3 },
      { key: "beds_bunks_under_furniture", label: "Beds / Bunks / Under Furniture", sev: 3 },
      { key: "sofa_chairs_ladders", label: "Sofa / Chairs / Furniture", sev: 3 },
      { key: "tub_shower_sinks_faucets", label: "Tub / Shower / Toilet / Sinks / Faucets", sev: 2 },
      { header: "Cab" },
      { key: "cab_seats_belts", label: "Cab Seats / Belts / Adjusters", sev: 1 },
      { key: "cab_doors_windows_locks", label: "Cab Doors / Windows / Locks", sev: 3 }
    ]
  },
  "U": {
    title: "PDI Validation",
    towable: [
      { header: "PDI Validation \u2014 not required to clear" },
      { key: "walk1_result", label: "Walk 1 Pass / Fail", sev: 3 }
    ],
    motorized: [
      { header: "PDI Validation \u2014 not required to clear" },
      { key: "walk1_result", label: "Walk 1 Pass / Fail", sev: 3 }
    ]
  }
};

// Pack versions (r6a). Records saved BEFORE r6a are evaluated against the pack they were saved under (v1 = the r5a
// R/S/E/I packs, frozen below). New R/S/E/I records carry packV: 2. A future revert or reshuffle is another entry in
// GS_PACKS (v3), never an edit of v1/v2. Walk 1 (U) is identical in every version and never carries packV.
// Absent packV = v1. Do not edit GS_LANE_V1. (r6b: Rain joined the table; v1 Rain = the r5a 12-check pack, v2 Rain adds the
// ladder receiver seal check.)
var GS_LANE_V1 = {
  "R": {
    title: "Rain, Seals, Roofs",
    towable: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Membrane / Decking / Self-Level Bead", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Ladder / Rail Penetrations", sev: 2 },
      { key: "cap_transition", label: "Cap Transition / Front Seam", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof (wet only)", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal (weep + gap / skip / thin \u2014 not graphics)", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter (leak + gap / skip / thin)", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep (weep + gap / skip / thin)", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { header: "Inside path" },
      { key: "ceiling_first_pass_drip", label: "Ceiling First Pass (stains / drip)", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panels First Pass", sev: 2 },
      { key: "lino_first_pass_wet", label: "Lino / Floor First Pass (wet spots only)", sev: 2 }
    ],
    motorized: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Rubber / Glass Roof / Decking / Self Level", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Solar / Ladder / Rail Penetrations", sev: 2 },
      { key: "cap_transition", label: "Cap Transition / Front Seam", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof (wet only)", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal (weep + gap / skip / thin \u2014 not graphics)", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter (leak + gap / skip / thin)", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep (weep + gap / skip / thin)", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { header: "Inside path" },
      { key: "ceiling_first_pass_drip", label: "Ceiling First Pass (stains / drip)", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panels First Pass", sev: 2 },
      { key: "lino_first_pass_wet", label: "Lino / Floor First Pass (wet spots only)", sev: 2 }
    ]
  },
  "S": {
    title: "Systems",
    towable: [
      { header: "Power" },
      { key: "continuity_test", label: "Continuity Test", sev: 1 },
      { key: "ac_dc_panel", label: "AC/DC Panel / Breakers / Fuses", sev: 1 },
      { key: "battery_hookup_disconnect", label: "Battery Hookup / Disconnect / Strap", sev: 1 },
      { key: "inverter", label: "Inverter Function (if solar)", sev: 3 },
      { key: "monitor_panel_converter_water_pump", label: "Monitor Panel / Converter / Water Pump", sev: 3 },
      { key: "recepts_gfis_usbs", label: "Recepts / GFIs / USBs", sev: 1 },
      { key: "tv_antenna_booster", label: "TV / Antenna / Booster", sev: 3 },
      { header: "Water" },
      { key: "city_fill_backflow", label: "City Fill / Backflow Check", sev: 2 },
      { key: "faucets_pressurize", label: "Faucets / Pressurize Lines", sev: 2 },
      { key: "hot_cold_orientation", label: "Hot / Cold Line Orientation", sev: 3 },
      { key: "black_grey_fresh_tanks", label: "Black / Grey / Fresh Tanks", sev: 2 },
      { key: "bypass_valve", label: "Bypass Valve (on WH)", sev: 2 },
      { key: "water_heater", label: "Water Heater (110 OFF after test)", sev: 2 },
      { key: "drainage_pipes", label: "Drains / P-Traps / Low Points", sev: 2 },
      { key: "outside_shower", label: "Outside Shower", sev: 3 },
      { header: "Outside kitchen" },
      { key: "osk_function", label: "Outside Kitchen \u2014 Faucet / GFI / Fridge Power", sev: 2 },
      { header: "LP" },
      { key: "lp_drop_test", label: "MEASURE lockup (11\u201314 in. WC, needle stops itself) then 8 in. / 3 min + soap", sev: 1 },
      { key: "lp_burnoff", label: "LP Burn-Off (hood + cabinet blowers ON; furnace vent must be hot)", sev: 1 },
      { header: "Climate" },
      { key: "ac_air_vents", label: "A/C & Air Vents", sev: 3 },
      { key: "thermostat", label: "Thermostat Function", sev: 3 },
      { key: "furnace_function", label: "Furnace \u2014 Lights / Runs / Heats (validated)", sev: 2 },
      { header: "Toy hauler (fuel station / generator)", when: "th" },
      { key: "th_fuel_shutoff_lock", label: "Fuel Station \u2014 Shutoff and Lock: emergency shutoff readily accessible, within 18 in. of the outside wall (nozzle trigger and timer switch do not count); station locks (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "th_fuel_compartment", label: "Fuel Station \u2014 Compartment: nonporous and noncombustible, seams sealed (no putty tape), 1/2 in. drain holes at every low point to the exterior, no spark equipment (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "th_fuel_hose_clearance", label: "Fuel Station \u2014 Hose, Clearance, Pump: hose 5 ft max; appliance vents and 120V gear 3 ft or more from the extended nozzle; nozzle-to-chassis continuity; pump secure (N/A if no fuel station)", sev: 1, when: "th" },
      { key: "generator", label: "Generator Function (if equipped)", sev: 1, when: "th" },
      { header: "Close" },
      { key: "detectors", label: "Smoke / LP / CO Detectors", sev: 1 }
    ],
    motorized: [
      { header: "Power" },
      { key: "continuity_test", label: "Continuity Test", sev: 1 },
      { key: "ac_dc_panel", label: "AC/DC Panel / Breakers / Fuses", sev: 1 },
      { key: "battery_hookup_disconnect", label: "Battery Hookup / Disconnect / Strap", sev: 1 },
      { key: "inverter", label: "Inverter Function (if solar)", sev: 3 },
      { key: "monitor_panel_converter_water_pump", label: "Monitor Panel / Converter / Water Pump", sev: 3 },
      { key: "recepts_gfis_usbs", label: "Recepts / GFIs / USBs", sev: 1 },
      { key: "tv_antenna_booster", label: "TV / Antenna / Booster", sev: 3 },
      { header: "Water" },
      { key: "city_fill_backflow", label: "City Fill / Backflow Check", sev: 2 },
      { key: "faucets_pressurize", label: "Faucets / Pressurize Lines", sev: 2 },
      { key: "hot_cold_orientation", label: "Hot / Cold Line Orientation", sev: 3 },
      { key: "black_grey_fresh_tanks", label: "Black / Grey / Fresh Tanks", sev: 2 },
      { key: "bypass_valve", label: "Bypass Valve (on WH)", sev: 2 },
      { key: "water_heater", label: "Water Heater (110 OFF after test)", sev: 2 },
      { key: "drainage_pipes", label: "Drains / P-Traps / Low Points", sev: 2 },
      { key: "outside_shower", label: "Outside Shower", sev: 3 },
      { header: "Outside kitchen" },
      { key: "osk_function", label: "Outside Kitchen \u2014 Faucet / GFI / Fridge Power", sev: 2 },
      { header: "LP" },
      { key: "lp_drop_test", label: "MEASURE lockup (11\u201314 in. WC, needle stops itself) then 8 in. / 3 min + soap", sev: 1 },
      { key: "lp_burnoff", label: "LP Burn-Off (hood + cabinet blowers ON; furnace vent must be hot)", sev: 1 },
      { header: "Climate" },
      { key: "ac_air_vents", label: "A/C & Air Vents", sev: 3 },
      { key: "thermostat", label: "Thermostat Function", sev: 3 },
      { key: "generator", label: "Generator Start / Load / Exhaust", sev: 1 },
      { key: "furnace_function", label: "Furnace \u2014 Lights / Runs / Heats (validated)", sev: 2 },
      { header: "Close" },
      { key: "detectors", label: "Smoke / LP / CO Detectors", sev: 1 }
    ]
  },
  "E": {
    title: "Exterior + Underbelly",
    towable: [
      { header: "Ground" },
      { key: "hitch_chains_cables_battery_disconnect", label: "Hitch / Chains / Breakaway Cable", sev: 1 },
      { key: "lugs_axles_springs", label: "Lugs / Axles / Springs / Brake Wires", sev: 1 },
      { key: "jacks_leveling_function", label: "Hitch / Stab / Leveling Jacks", sev: 3 },
      { header: "Under the coach" },
      { key: "underbelly", label: "Underbelly Secure / Protection", sev: 2 },
      { key: "varmint_foam_loom", label: "Pests / Foam Holes / Loomed Wires", sev: 2 },
      { key: "lp_lines_secured", label: "LP Lines Secured (Rubber / Copper)", sev: 1 },
      { key: "plumbing_slope_tank_leaks", label: "Plumbing Slope / Tank Leaks (if applicable)", sev: 2 },
      { key: "wheel_well", label: "Wheel Well", sev: 2 },
      { key: "slideout_roof_underneath_floor", label: "Slide Floor / Screws / Corner Cups / Seals", sev: 2 },
      { key: "air_test_water_lines", label: "Air Test / Water Lines (80\u2013100 psi / 10 min, heater bypassed)", sev: 2 },
      { header: "Skin" },
      { key: "metal_glass_diamond_plate", label: "Metal / Glass / Diamond Plate", sev: 4 },
      { key: "fenders_flare", label: "Fenders / Wheel-Well Flare", sev: 2 },
      { key: "graphics", label: "Graphics", sev: 4 },
      { key: "screw_gutter_rails", label: "Screw & Gutter Rails (hang)", sev: 2 },
      { key: "vin_tags_rvia_qai_sticker", label: "Vin / RVIA / QAI / Required Exterior Labels", sev: 4 },
      { header: "Seals \u2014 dry visual" },
      { key: "ext_seal_bead", label: "Anti-Wick / Exterior Seal Bead (dry \u2014 gap / skip / thin)", sev: 2 },
      { key: "ext_rail_seal", label: "Screw Rail + Gutter Rail Seal (dry)", sev: 2 },
      { key: "ext_opening_seal", label: "Window + Compartment Seal (dry)", sev: 2 },
      { key: "ext_slide_awning_seal", label: "Slide Bulb / Sweep + Awning Rail Seal (dry)", sev: 2 },
      { header: "Openings" },
      { key: "windows_compartment_doors", label: "Windows & Compartment Doors / Keys Tagged", sev: 2 },
      { key: "entry_screen_door_entry_steps", label: "Entry / Screen Door & Entry Steps", sev: 3 },
      { key: "passthrough_power_cord_jack_handle", label: "Cargo / Passthrough \u2014 Floor, Lino, Cord, Jack Handle", sev: 3 },
      { key: "osk_shell", label: "Outside Kitchen \u2014 Door / Slide / Latch / Counter", sev: 3 },
      { key: "slideout_t_rails_alignment", label: "Slide Travel / Alignment / T-Rails", sev: 2 },
      { key: "awning", label: "Awning \u2014 Full Travel / Lock", sev: 3 },
      { key: "furnace_heat_vents", label: "Furnace Vent / Exhaust (exterior only)", sev: 3 },
      { key: "water_heater_exterior_insp", label: "Water Heater \u2014 Exterior (door / vent / burner area / seal)", sev: 2 },
      { header: "Ramp door (toy hauler)", when: "th" },
      { key: "th_ramp_door", label: "Ramp Door \u2014 latches, seals, cables, springs, supports and stabilizers", sev: 2, when: "th" },
      { key: "th_ramp_patio", label: "Ramp Door as Patio \u2014 rails, chains and supports (if equipped)", sev: 3, when: "th" },
      { key: "th_ramp_powered", label: "Powered Ramp Door \u2014 cannot activate unintentionally in transit (if powered)", sev: 1, when: "th" },
      { header: "Lights and fittings" },
      { key: "marker_tail_turn_signal_lights", label: "Marker / Tail / Turn Signal Lights", sev: 1 },
      { key: "power_inlet_city_fresh_fill", label: "Power Inlet / Cord / City / Fresh Fill", sev: 3 }
    ],
    motorized: [
      { header: "Ground" },
      { key: "jacks_leveling_function", label: "Jacks / Leveling Function", sev: 3 },
      { header: "Under the coach" },
      { key: "underbelly", label: "Underbelly Secure / Protection", sev: 2 },
      { key: "varmint_foam_loom", label: "Pests / Foam Holes / Loomed Wires", sev: 2 },
      { key: "lp_lines_secured", label: "LP Lines Secured", sev: 1 },
      { key: "plumbing_slope_tank_leaks", label: "Plumbing Slope / Tank Leaks (if applicable)", sev: 2 },
      { key: "slideout_roof_underneath_floor", label: "Slide Floor / Seals / Cups", sev: 2 },
      { key: "air_test_water_lines", label: "Air Test / Water Lines (80\u2013100 psi / 10 min, heater bypassed)", sev: 2 },
      { header: "Skin" },
      { key: "fiberglass", label: "Fiberglass / Cap / Sidewall / Rear", sev: 4 },
      { key: "fenders_flare", label: "Fenders / Wheel-Well Flare", sev: 2 },
      { key: "graphics", label: "Graphics", sev: 4 },
      { key: "screw_gutter_rails", label: "Screw / Gutter Rails (hang)", sev: 2 },
      { key: "vin_tags_rvia_qai_sticker", label: "Vin / RVIA / QAI / Required Exterior Labels", sev: 4 },
      { header: "Seals \u2014 dry visual" },
      { key: "ext_seal_bead", label: "Anti-Wick / Exterior Seal Bead (dry \u2014 gap / skip / thin)", sev: 2 },
      { key: "ext_rail_seal", label: "Screw Rail + Gutter Rail Seal (dry)", sev: 2 },
      { key: "ext_opening_seal", label: "Window + Compartment Seal (dry)", sev: 2 },
      { key: "ext_slide_awning_seal", label: "Slide Bulb / Sweep + Awning Rail Seal (dry)", sev: 2 },
      { header: "Openings" },
      { key: "windows", label: "Windows (function / fit)", sev: 2 },
      { key: "compartments", label: "Compartments / Keys Tagged", sev: 3 },
      { key: "cargo_area", label: "Cargo Area \u2014 Floor / Lino", sev: 3 },
      { key: "osk_shell", label: "Outside Kitchen \u2014 Door / Slide / Latch / Counter", sev: 3 },
      { key: "slideout_function", label: "Slide Travel / Alignment", sev: 2 },
      { key: "awning", label: "Awning \u2014 Full Travel / Lock", sev: 3 },
      { key: "furnace_heat_vents", label: "Furnace Vent / Exhaust (exterior only)", sev: 3 },
      { key: "water_heater_exterior_insp", label: "Water Heater \u2014 Exterior (door / vent / burner area / seal)", sev: 2 },
      { header: "Lights and fittings" },
      { key: "marker_tail_turn_signal_lights", label: "Marker / Tail / Turn Signal Lights", sev: 1 },
      { key: "power_inlet_city_fresh_fill", label: "Power Inlet / Cord / City & Fresh Fill", sev: 3 }
    ]
  },
  "I": {
    title: "Interior",
    towable: [
      { header: "At the door" },
      { key: "egress_windows", label: "Egress Windows (Opposite Sides / Code)", sev: 1 },
      { key: "fire_extinguisher", label: "Fire Extinguisher (10BC)", sev: 1, alt: [{ when: "thnowall", label: "Fire Extinguisher (1A:10-B:C minimum)" }] },
      { header: "Room" },
      { key: "lino_floor_decking", label: "Lino & Floor Decking / Squeaks", sev: 4 },
      { key: "ceiling_wall_panels_trim", label: "Ceiling & Wall Panels / Trim", sev: 4 },
      { key: "cabinet_doors_panels_trim_stiles", label: "Cabinet Doors / Panels / Trim / Stiles", sev: 4 },
      { key: "drawers", label: "Drawers", sev: 3 },
      { key: "countertops", label: "Countertops / Extensions", sev: 4 },
      { key: "window_valances", label: "Windows / Valances / Shades", sev: 4 },
      { key: "bed_bath_doors", label: "Bed / Bath Doors / Struts", sev: 3 },
      { key: "dinette_table_booths", label: "Dinette Table / Booths / Code", sev: 3 },
      { key: "beds_bunks_under_furniture", label: "Beds / Bunks / Under Furniture", sev: 3 },
      { key: "sofa_chairs_ladders", label: "Sofa / Chairs / Ladders", sev: 3 },
      { key: "tub_shower_sinks_faucets", label: "Tub / Shower / Toilet / Sinks / Faucets", sev: 2 },
      { header: "Garage (toy hauler)", when: "th" },
      { key: "th_floor_covering", label: "Garage Floor Covering \u2014 entire transport area, seamless, non-absorbent to fuel (vinyl / lino / metal / sealed deck; no carpet or untreated wood)", sev: 1, when: "th" },
      { key: "th_floor_seal_seams", label: "Garage Floor Seal \u2014 every seam and corner at walls, wheel wells, cabinets and partitions sealed with fuel-resistant sealant (no putty tape; 1/2 in. gap + sealant where a wall is carpeted or absorbent)", sev: 1, when: "th" },
      { key: "th_floor_seal_penetrations", label: "Garage Floor Seal \u2014 sealant around every D-ring, floor register and floor penetration", sev: 1, when: "th" },
      { key: "th_garage_vents", label: "Garage Vents \u2014 two, 10 sq in. openable each: forward upper end and lower rear end (lower vent NOT in the floor)", sev: 2, when: "th", alt: [{ when: "thwall", label: "Garage Vents \u2014 two, 10 sq in. openable each: forward upper end and lower rear end (floor-level lower vent allowed with the wall)" }] },
      { key: "th_fire_extinguisher", label: "Garage Fire Extinguisher \u2014 additional 1A:10-B:C within 24 in. of the exterior / ramp door, not blocked when a bed is lowered", sev: 1, when: "thwall" },
      { key: "th_co_alarm", label: "Garage CO Alarm \u2014 sleeping area in the garage behind the wall (N/A if none)", sev: 1, when: "thwall" },
      { key: "th_receptacle", label: "Garage Receptacle \u2014 at least one", sev: 2, when: "th", alt: [{ when: "thwall", label: "Garage Receptacle \u2014 at least one, GFCI" }] },
      { key: "th_divider", label: "Garage Divider \u2014 wall / door / seals, sealed passage", sev: 2, when: "thwall" },
      { key: "th_bed_lift", label: "Garage Beds / Sofa Lifts / Bunks \u2014 operation and locks", sev: 3, when: "th" },
      { key: "th_tiedowns", label: "Tie-Downs / D-Rings \u2014 secure, rating label present", sev: 2, when: "th" },
      { key: "th_garage_function", label: "Garage Lights / Heat / A/C / Vents \u2014 function", sev: 3, when: "th" },
      { header: "Function" },
      { key: "interior_lights", label: "Interior Lights", sev: 3 },
      { key: "refrigerator_microwave", label: "Refrigerator / Microwave", sev: 3 },
      { key: "range_hood_stove_fireplace", label: "Range / Stove / Hood", sev: 3 },
      { key: "fireplace_function", label: "Fireplace Function", sev: 3 }
    ],
    motorized: [
      { header: "At the door" },
      { key: "egress_windows", label: "Egress Windows (Opposite Sides / Code)", sev: 1 },
      { key: "fire_extinguisher", label: "Fire Extinguisher (10BC)", sev: 1 },
      { header: "Room" },
      { key: "lino_floor_decking", label: "Lino & Floor Decking / Squeaks", sev: 4 },
      { key: "ceiling_wall_panels_trim", label: "Ceiling & Wall Panels / Trim", sev: 4 },
      { key: "cabinet_doors_panels_trim_stiles", label: "Cabinet Doors / Panels / Trim / Stiles", sev: 4 },
      { key: "drawers", label: "Drawers", sev: 3 },
      { key: "countertops", label: "Countertops / Extensions", sev: 4 },
      { key: "window_valances", label: "Windows / Valances / Shades", sev: 4 },
      { key: "bed_bath_doors", label: "Bed / Bath Doors / Struts", sev: 3 },
      { key: "dinette_table_booths", label: "Dinette Table / Booth / Code", sev: 3 },
      { key: "beds_bunks_under_furniture", label: "Beds / Bunks / Under Furniture", sev: 3 },
      { key: "sofa_chairs_ladders", label: "Sofa / Chairs / Furniture", sev: 3 },
      { key: "tub_shower_sinks_faucets", label: "Tub / Shower / Toilet / Sinks / Faucets", sev: 2 },
      { header: "Function" },
      { key: "interior_lights", label: "Interior Lights", sev: 3 },
      { key: "refer_microwave_stove_range_hood", label: "Refer / Microwave / Stove / Range Hood", sev: 3 },
      { key: "fireplace_function", label: "Fireplace Function", sev: 3 },
      { header: "Cab" },
      { key: "cab_seats_belts", label: "Cab Seats / Belts / Adjusters", sev: 1 },
      { key: "cab_dash_gauges", label: "Dash / Gauges / Warning Lights", sev: 3 },
      { key: "cab_windshield_wipers", label: "Windshield / Wipers / Washers", sev: 2 },
      { key: "cab_doors_windows_locks", label: "Cab Doors / Windows / Locks", sev: 3 },
      { key: "cab_climate", label: "Cab A/C / Heater / Dash Vents", sev: 3 },
      { key: "cab_radio", label: "Cab Radio / Audio Function", sev: 4 }
    ]
  }
};

// Old key -> canonical key. Anything dropped or merged lives here so old records still resolve.
// Rule: a key in this table must NEVER also be a live key in any pack (the test enforces it).
var GS_KEY_ALIAS = {
  recepts_gfi_usb: "recepts_gfis_usbs",
  ac_vents: "ac_air_vents",
  tub_shower_sink_faucets: "tub_shower_sinks_faucets",
  entry_bed_bath_doors: "bed_bath_doors",
  dinette_table_booth: "dinette_table_booths",
  furniture: "sofa_chairs_ladders",
  rubber_glass_roof_decking_self_level: "rubber_roof_decking_self_level_seal",
  slideout_roof_floor: "slideout_roof_underneath_floor",
  vin_tags: "vin_tags_rvia_qai_sticker",
  exterior_seal: "exterior_seal_graphics",
  vents_skylights_roof: "roof_penetrations",
  vents_skylights_antenna_solar: "roof_penetrations",
  slideout_function_sys: "slideout_t_rails_alignment",
  awning_function: "awning",
  jacks: "jacks_leveling_function",
  stab_hitch_jacks: "jacks_leveling_function",
  converter_recept_check: "recepts_gfis_usbs",
  low_point_tank_drains: "drainage_pipes",
  range_hood_fan: "range_hood_stove_fireplace",
  power_cords: "power_inlet_city_fresh_fill"
};

// Keys shelved on purpose. Not in any pack. Old marks stay readable, never counted.
var GS_KEY_TABLED = {
  brake_amp_test: "Brake Test (10 amp) — tabled",
  tire_pressure_spare: "Tire Pressure / Spare Secured — tabled"
};

// Pack v2 (r6b-r7a1) Rain lane, frozen verbatim. v2 is the live pack for nothing but R any more: S/E/I/U are identical in v2 and v3,
// so a lane missing from this table falls back to the live GS_LANE. NEVER edit this block: a Rain lane started on v2 keeps this sheet.
var GS_LANE_V2 = {
  "R": {
    title: "Rain, Seals, Roofs",
    towable: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Membrane / Decking / Self-Level Bead", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Ladder / Rail Penetrations", sev: 2 },
      { key: "cap_transition", label: "Cap Transition / Front Seam", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof (wet only)", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal (weep + gap / skip / thin \u2014 not graphics)", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter (leak + gap / skip / thin)", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep (weep + gap / skip / thin)", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "ladder_receiver_seal", label: "Ladder Receiver Seals (leak + gap / skip / thin; N/A if no ladder)", sev: 2 },
      { header: "Inside path" },
      { key: "ceiling_first_pass_drip", label: "Ceiling First Pass (stains / drip)", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panels First Pass", sev: 2 },
      { key: "lino_first_pass_wet", label: "Lino / Floor First Pass (wet spots only)", sev: 2 }
    ],
    motorized: [
      { header: "Roof" },
      { key: "rubber_roof_decking_self_level_seal", label: "Rubber / Glass Roof / Decking / Self Level", sev: 2 },
      { key: "roof_penetrations", label: "Vents / Skylights / AC Boots / Antenna / Solar / Ladder / Rail Penetrations", sev: 2 },
      { key: "cap_transition", label: "Cap Transition / Front Seam", sev: 2 },
      { key: "slide_roof_wet", label: "Slide Roof (wet only)", sev: 2 },
      { header: "Perimeter" },
      { key: "exterior_seal_antiwick", label: "Anti-Wick / Exterior Seal (weep + gap / skip / thin \u2014 not graphics)", sev: 2 },
      { key: "screw_gutter_rail_seal", label: "Screw Rail + Gutter Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "window_compartment_perimeter_leak", label: "Window + Compartment Perimeter (leak + gap / skip / thin)", sev: 2 },
      { key: "slide_bulb_sweep_weather", label: "Slide Bulb / Sweep (weep + gap / skip / thin)", sev: 2 },
      { key: "awning_rail_seal", label: "Awning Rail Seal (weep + gap / skip / thin)", sev: 2 },
      { key: "ladder_receiver_seal", label: "Ladder Receiver Seals (leak + gap / skip / thin; N/A if no ladder)", sev: 2 },
      { header: "Inside path" },
      { key: "ceiling_first_pass_drip", label: "Ceiling First Pass (stains / drip)", sev: 2 },
      { key: "wall_first_pass_drip", label: "Wall Panels First Pass", sev: 2 },
      { key: "lino_first_pass_wet", label: "Lino / Floor First Pass (wet spots only)", sev: 2 }
    ]
  }
};

// Pack-version table. Version 3 is the live GS_LANE (r8a: only the Rain lane changed). Version 2 = frozen GS_LANE_V2 (Rain only),
// version 1 = the frozen r5a R/S/E/I packs. A lane missing from a version's table uses the live pack (S, E, I, U are identical in v2 and v3).
var GS_PACKS = { 1: GS_LANE_V1, 2: GS_LANE_V2, 3: GS_LANE };
var CURRENT_PACKV = 3;

var GS_LANE_API = (function () {
  function on(when, o) {
    if (!when) return true;
    var th = !!(o && o.toyHauler);
    var wall = !!(o && o.thWall);
    if (when === "th") return th;
    if (when === "thwall") return th && wall;
    if (when === "thnowall") return th && !wall;
    return false;
  }
  function type(t) { return t === "motorized" ? "motorized" : "towable"; }
  // Toy hauler is towable only. A motorized record never gets toy hauler checks.
  function opts(t, o) { return type(t) === "towable" ? o : null; }
  // Pack version of a stored record: explicit packV, absent (or unknown) = 1. Only R/S/E/I records are ever stamped (U never).
  function verOf(rec) {
    var n = rec && rec.packV != null ? Number(rec.packV) : 1;
    return GS_PACKS[n] ? n : 1;
  }
  // true when a lane's pack differs between versions (so a new record of it must carry packV)
  function versioned(lane) { return !!GS_LANE_V1[lane]; }
  // Version a NEW record of this lane gets (r8a). hint = { rainRun: true } when the first save carries a rainRun key.
  //   R: 3 when the first save carries rainRun (the page that sent it rendered the v3 sheet), otherwise 2 (an out-of-date page; old rules).
  //   S, E, I: 2. Their lists are identical in v2 and v3; they keep stamping 2 so their records stay byte-identical to r7a1.
  //   U and anything unversioned: never stamped.
  function newVer(lane, hint) {
    if (!versioned(lane)) return CURRENT_PACKV;
    if (lane === "R") return hint && hint.rainRun ? 3 : 2;
    return 2;
  }
  // Version to stamp on a record being created now. null = no field (U, and any v1 record being re-saved).
  function stampFor(lane, prevRec, hint) {
    if (!versioned(lane)) return null;
    var v = prevRec ? verOf(prevRec) : newVer(lane, hint);
    return v > 1 ? v : null;
  }
  function lanePack(lane, v) {
    var tbl = GS_PACKS[v] || GS_PACKS[CURRENT_PACKV];
    return tbl[lane] || GS_LANE[lane];
  }
  // Resolved pack for a lane: headers + checks, conditions applied, labels resolved. v defaults to the current pack.
  function pack(lane, t, o, v) {
    var d = lanePack(lane, v == null ? CURRENT_PACKV : v);
    if (!d) return [];
    var tt = type(t);
    var src = d[tt] || d.towable || [];
    var oo = opts(tt, o);
    var out = [];
    src.forEach(function (it) {
      if (!on(it.when, oo)) return;
      if (it.header !== undefined) { out.push(it.note ? { header: it.header, note: it.note } : { header: it.header }); return; }
      var label = it.label;
      (it.alt || []).forEach(function (a) { if (on(a.when, oo)) label = a.label; });
      out.push({ key: it.key, label: label, sev: it.sev });
    });
    return out;
  }
  function keys(lane, t, o, v) {
    return pack(lane, t, o, v).filter(function (x) { return x.key; }).map(function (x) { return x.key; });
  }
  function canon(k) {
    var s = String(k || "");
    return Object.prototype.hasOwnProperty.call(GS_KEY_ALIAS, s) ? GS_KEY_ALIAS[s] : s;
  }
  // Counts only checks that belong to the pack. Old/aliased keys count once under the canonical key.
  function stats(lane, t, o, checks, v) {
    var ks = keys(lane, t, o, v);
    var have = {};
    Object.keys(checks || {}).forEach(function (k) { if (checks[k]) have[canon(k)] = true; });
    var marked = ks.filter(function (k) { return have[k]; }).length;
    return { total: ks.length, marked: marked, unmarked: ks.length - marked };
  }
  // Lane that owns a key in a pack version (default current) for this unit type / toy hauler flags ("" when none).
  function ownerOf(key, t, o, v) {
    var c = canon(key), L = ["R", "S", "E", "I", "U"];
    for (var i = 0; i < L.length; i++) if (keys(L[i], t, o, v).indexOf(c) >= 0) return L[i];
    return "";
  }
  // canonical -> [aliases], for pages that look a canonical key up by its old names
  function aliasesOf() {
    var inv = {};
    Object.keys(GS_KEY_ALIAS).forEach(function (a) { (inv[GS_KEY_ALIAS[a]] = inv[GS_KEY_ALIAS[a]] || []).push(a); });
    return inv;
  }
  return { pack: pack, keys: keys, canon: canon, stats: stats, aliasesOf: aliasesOf, alias: GS_KEY_ALIAS, tabled: GS_KEY_TABLED,
           verOf: verOf, versioned: versioned, newVer: newVer, stampFor: stampFor, ownerOf: ownerOf, currentPackV: CURRENT_PACKV, packs: GS_PACKS };
})();

if (typeof window !== "undefined") { window.GS_LANE = GS_LANE; window.GS_LANE_API = GS_LANE_API; window.GS_KEY_ALIAS = GS_KEY_ALIAS; }
if (typeof module !== "undefined" && module.exports) {
  module.exports = GS_LANE;
  // non-enumerable so Object.keys(GS_LANE) / for-in still see only lanes
  Object.defineProperty(GS_LANE, "__api", { value: GS_LANE_API, enumerable: false });
}
