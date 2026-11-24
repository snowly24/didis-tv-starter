/* =========================================================
   Playful effects (no libraries).
   Effects.burst(x, y, { count, spread, confetti })
     hearts (+ confetti) fly out from a point in the window.
   ========================================================= */
(function () {
  var COLORS = ["var(--cherry)", "var(--rose)", "var(--blush)", "var(--butter)", "var(--peach)", "var(--tangerine)", "var(--sage)"];
  var layer;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function getLayer() {
    if (!layer || !layer.isConnected) {
      layer = document.createElement("div");
      layer.className = "fx-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    return layer;
  }

  function particle(x, y, isHeart) {
    var el;
    if (isHeart) {
      el = Icons.el("heart", "fx-heart");
      var size = rand(14, 30);
      el.style.width = size + "px";
      el.style.height = size * 0.92 + "px";
      el.style.fill = pick(["var(--cherry)", "var(--rose)", "var(--blush)", "var(--cherry)"]);
    } else {
      el = document.createElement("span");
      el.className = "fx-confetti";
      el.style.width = rand(6, 10) + "px";
      el.style.height = rand(10, 16) + "px";
      el.style.background = pick(COLORS);
      if (Math.random() < 0.3) el.style.borderRadius = "50%";
    }
    el.style.left = x + "px";
    el.style.top = y + "px";
    getLayer().appendChild(el);
    return el;
  }

  function burst(x, y, opts) {
    opts = opts || {};
    var count = opts.count || 28;
    var spread = opts.spread || 220;
    var withConfetti = opts.confetti !== false;

    if (reducedMotion()) {
      // Just a few hearts that fade in and out in place
      for (var r = 0; r < 5; r++) {
        var h = particle(x + rand(-60, 60), y + rand(-40, 40), true);
        h.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 0 }], { duration: 1200 })
          .finished.then(h.remove.bind(h));
      }
      return;
    }

    for (var i = 0; i < count; i++) {
      var isHeart = !withConfetti || i % 2 === 0;
      var el = particle(x, y, isHeart);
      var angle = rand(-Math.PI, 0) + rand(-0.35, 0.35);    // mostly upwards
      var dist = rand(spread * 0.35, spread);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist * 0.9;
      var fall = rand(120, 260);
      var spin = rand(-260, 260);
      var dur = rand(1100, 1700);
      el.animate([
        { transform: "translate(-50%, -50%) translate(0, 0) rotate(0) scale(.4)", opacity: 0 },
        { transform: "translate(-50%, -50%) translate(" + dx * 0.7 + "px," + dy * 0.8 + "px) rotate(" + spin * 0.5 + "deg) scale(1)", opacity: 1, offset: .35 },
        { transform: "translate(-50%, -50%) translate(" + dx + "px," + (dy + fall) + "px) rotate(" + spin + "deg) scale(.9)", opacity: 0 }
      ], { duration: dur, easing: "cubic-bezier(.2, .7, .4, 1)", fill: "forwards" })
        .finished.then(el.remove.bind(el));
    }
  }

  /* Tiny sparkles + hearts where a button was clicked */
  function sparkle(x, y) {
    if (reducedMotion()) return;
    for (var i = 0; i < 7; i++) {
      var isHeart = i % 3 === 0;
      var el = isHeart ? Icons.el("heart", "fx-heart") : Icons.el("sparkle", "fx-heart");
      var size = isHeart ? rand(8, 12) : rand(8, 14);
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.fill = isHeart ? pick(["var(--cherry)", "var(--rose)"]) : pick(["var(--butter)", "var(--peach)", "var(--rose)"]);
      el.style.left = x + "px";
      el.style.top = y + "px";
      getLayer().appendChild(el);
      var a = (i / 7) * Math.PI * 2 + rand(-0.3, 0.3);
      var d = rand(18, 40);
      el.animate([
        { transform: "translate(-50%, -50%) scale(.3) rotate(0deg)", opacity: 0 },
        { transform: "translate(-50%, -50%) translate(" + Math.cos(a) * d * 0.6 + "px," + Math.sin(a) * d * 0.6 + "px) scale(1) rotate(40deg)", opacity: 1, offset: .35 },
        { transform: "translate(-50%, -50%) translate(" + Math.cos(a) * d + "px," + (Math.sin(a) * d + 8) + "px) scale(.6) rotate(90deg)", opacity: 0 }
      ], { duration: rand(500, 700), easing: "cubic-bezier(.2, .7, .4, 1)", fill: "forwards" })
        .finished.then(el.remove.bind(el));
    }
  }

  /* It rains hearts (bow easter egg) */
  function rain() {
    var w = window.innerWidth, h = window.innerHeight;
    var count = reducedMotion() ? 10 : 40;
    for (var i = 0; i < count; i++) {
      var el = Icons.el("heart", "fx-heart");
      var size = rand(14, 32);
      el.style.width = size + "px";
      el.style.height = size * 0.92 + "px";
      el.style.fill = pick(["var(--cherry)", "var(--rose)", "var(--blush)", "var(--peach)", "var(--cherry)"]);
      el.style.left = rand(0, w) + "px";
      el.style.top = "-40px";
      getLayer().appendChild(el);
      var anim;
      if (reducedMotion()) {
        el.style.top = rand(40, h - 40) + "px";
        anim = el.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 0 }], { duration: 1600, delay: i * 60 });
      } else {
        var sway = rand(-60, 60);
        anim = el.animate([
          { transform: "translate(0, 0) rotate(0deg)", opacity: 0 },
          { transform: "translate(" + sway * 0.5 + "px," + h * 0.3 + "px) rotate(" + rand(-30, 30) + "deg)", opacity: 1, offset: .2 },
          { transform: "translate(" + sway + "px," + (h + 80) + "px) rotate(" + rand(-60, 60) + "deg)", opacity: 1 }
        ], { duration: rand(2400, 4200), delay: rand(0, 1400), easing: "cubic-bezier(.35, 0, .6, 1)", fill: "both" });
      }
      anim.finished.then(el.remove.bind(el));
    }
  }

  /* Every button: a soft click sound + tiny sparkles.
     data-sfx="power|pop|none" picks another sound, data-fx="none" skips sparkles. */
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!b || b.disabled) return;
    var sfx = b.getAttribute("data-sfx");
    if (sfx !== "none" && window.Sound) Sound.play(sfx || "click");
    if (b.getAttribute("data-fx") === "none") return;
    var x = e.clientX, y = e.clientY;
    if (!x && !y) {
      var r = b.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    sparkle(x, y);
  });

  window.Effects = { burst: burst, sparkle: sparkle, rain: rain };
})();
