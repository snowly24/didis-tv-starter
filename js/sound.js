/* =========================================================
   Sound settings. (The Web Audio sound effects themselves are
   added in Phase 5 — for now this only remembers on/off.)
   ========================================================= */
(function () {
  var KEY = "didis-tv-sound";
  var listeners = [];

  function read() {
    try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; }
  }
  var on = read();

  window.Sound = {
    isOn: function () { return on; },
    setOn: function (value) {
      on = !!value;
      try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) { /* private mode: fine */ }
      listeners.forEach(function (fn) { fn(on); });
    },
    toggle: function () { this.setOn(!on); },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
