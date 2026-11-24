/* =========================================================
   App: hash router + view switching.
   Routes: #/ (lock) · #/shelf · #/tape/1…6 · #/credits
   While locked, any route shows the Lock view first; after
   unlocking, the visitor lands where they were going.
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;
  var KEY = "didis-tv-unlocked";
  var root = document.getElementById("app");
  var flash = document.querySelector(".flash");
  var current = null;
  var unlockedInMemory = false;

  function isUnlocked() {
    try { return sessionStorage.getItem(KEY) === "1" || unlockedInMemory; }
    catch (e) { return unlockedInMemory; }
  }
  function setUnlocked(value) {
    unlockedInMemory = value;
    try {
      if (value) sessionStorage.setItem(KEY, "1");
      else sessionStorage.removeItem(KEY);
    } catch (e) { /* storage blocked: memory only */ }
  }

  function parse(hash) {
    var parts = String(hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!parts.length) return { name: "lock" };
    if (parts[0] === "shelf" && parts.length === 1) return { name: "shelf" };
    if (parts[0] === "credits" && parts.length === 1) return { name: "credits" };
    if (parts[0] === "tape" && parts.length === 2) {
      var id = parseInt(parts[1], 10);
      var exists = CFG.tapes.some(function (t) { return t.id === id; });
      if (exists) return { name: "tape", id: id };
    }
    return { name: "unknown" };
  }

  /* ---------- Flash overlay (used by view transitions) ---------- */
  var flashAnim = null;
  function fadeFlash(to, ms) {
    var from = flashAnim ? Number(getComputedStyle(flash).opacity) : (to ? 0 : 1);
    if (flashAnim) flashAnim.cancel();
    flashAnim = flash.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "ease-out", fill: "forwards" });
    return flashAnim.finished;
  }

  /* ---------- Full-screen static (channel change between views) ---------- */
  var staticLayer = null;
  function getStatic() {
    if (!staticLayer) {
      TV.makeNoise();
      staticLayer = document.createElement("div");
      staticLayer.className = "static-overlay";
      staticLayer.setAttribute("aria-hidden", "true");
      staticLayer.innerHTML = '<div class="static-overlay__noise"></div><div class="static-overlay__track"></div>';
      document.body.appendChild(staticLayer);
    }
    return staticLayer;
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var VIEWS = {
    lock: window.LockView,
    shelf: window.ShelfView,
    tape: window.PlayerView,
    credits: window.CreditsView
  };

  function mount(route) {
    if (current && current.instance.unmount) current.instance.unmount();
    var instance = VIEWS[route.name].create(route, api);
    root.replaceChildren(instance.el);
    current = { name: route.name, id: route.id, instance: instance };
    window.scrollTo(0, 0);
  }

  function render() {
    var route = parse(location.hash);
    if (!isUnlocked()) {
      // Keep the requested URL; show the Lock view until unlocked
      if (!current || current.name !== "lock") mount({ name: "lock" });
      return;
    }
    if (route.name === "lock" || route.name === "unknown") {
      location.replace("#/shelf");
      return;
    }
    if (current && current.name === route.name && current.id === route.id) return;
    // Same view, different tape: let the Player switch tapes itself (channel change)
    if (current && current.name === route.name && current.instance.update && current.instance.update(route)) {
      current.id = route.id;
      return;
    }
    mount(route);
  }

  var api = {
    /* Called by the Lock view once its zoom has covered the screen */
    unlock: function () {
      setUnlocked(true);
      var route = parse(location.hash);
      if (route.name === "lock" || route.name === "unknown") location.replace("#/shelf");
      render();
      document.documentElement.classList.remove("is-zooming");
      return fadeFlash(0, 650);
    },
    lock: function () {
      setUnlocked(false);
      current = null;
      location.hash = "#/";
      render();
    },
    /* Static fills the screen, the route changes underneath, static clears */
    staticTo: function (hash) {
      var layer = getStatic();
      if (window.Sound) Sound.play("static");
      if (reducedMotion()) {
        return fadeFlash(1, 200).then(function () {
          location.hash = hash;
          return fadeFlash(0, 300);
        });
      }
      layer.classList.add("is-on");
      var fadeIn = layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: "forwards" });
      return fadeIn.finished.then(function () {
        location.hash = hash;
        return new Promise(function (r) { setTimeout(r, 380); });
      }).then(function () {
        var fadeOut = layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" });
        fadeIn.cancel();
        return fadeOut.finished.then(function () {
          layer.classList.remove("is-on");
          fadeOut.cancel();
        });
      });
    },
    flashIn: function (ms) { return fadeFlash(1, ms || 300); },
    flashOut: function (ms) { return fadeFlash(0, ms || 500); }
  };

  window.addEventListener("hashchange", render);
  render();
})();
