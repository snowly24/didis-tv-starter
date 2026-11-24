/* =========================================================
   View 2 — Shelf (#/shelf)
   Header, floating note, the stack of 6 tapes from config.
   Click a tape → it slides out → static → #/tape/N
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Gentle, fixed float rhythm per tape (same on every visit) */
  var FLOAT = [
    { dur: 4.2, delay: -1.1, amp: -2 },
    { dur: 5.1, delay: -3.4, amp: -1.5 },
    { dur: 3.8, delay: -0.6, amp: -2.5 },
    { dur: 4.7, delay: -2.2, amp: -1.2 },
    { dur: 5.5, delay: -4.0, amp: -2.8 },
    { dur: 4.4, delay: -1.8, amp: -1.8 }
  ];

  function create(route, app) {
    var view = el("section", "view view--shelf");
    var header = Header.create({ onLogo: function () { /* already on the Shelf */ } });
    view.appendChild(header.el);

    var shelf = el("div", "shelf");

    /* ---------- Floating note ---------- */
    var note = el("button", "note");
    note.type = "button";
    note.appendChild(el("span", "washi note__washi"));
    note.appendChild(Icons.el("sun", "note__sun"));
    note.appendChild(el("span", "note__text", CFG.site.floatingNote));
    note.addEventListener("click", function () {
      var r = note.getBoundingClientRect();
      Effects.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, spread: 130, confetti: false });
    });
    shelf.appendChild(note);

    /* ---------- The stack ---------- */
    var wrap = el("div", "stack-wrap");
    var hint = el("p", "shelf__hint");
    hint.setAttribute("aria-hidden", "true");
    hint.appendChild(el("span", "shelf__hint-text", CFG.shelf.pickATape));
    hint.appendChild(Icons.el("arrow", "shelf__hint-arrow"));
    wrap.appendChild(hint);

    var list = el("ul", "stack");
    var tapes = [];
    CFG.tapes.forEach(function (cfg, i) {
      var item = el("li", "stack__item");
      var stack = cfg.stack || {};
      var f = FLOAT[i % FLOAT.length];
      item.style.setProperty("--i", i);
      item.style.setProperty("--ox", (stack.offsetX || 0) + "px");
      item.style.setProperty("--rot", (stack.rotate || 0) + "deg");
      item.style.setProperty("--dur", f.dur + "s");
      item.style.setProperty("--delay", f.delay + "s");
      item.style.setProperty("--amp", f.amp + "px");

      var floater = el("div", "stack__float");
      var tape = Tape.create(cfg);
      tape.el.addEventListener("click", function () { open(cfg, tape.el); });
      floater.appendChild(tape.el);
      item.appendChild(floater);
      list.appendChild(item);
      tapes.push(tape);
    });
    wrap.appendChild(list);
    shelf.appendChild(wrap);
    view.appendChild(shelf);

    /* ---------- Open a tape ---------- */
    var opening = false;
    function open(cfg, btn) {
      if (opening) return;
      opening = true;
      view.classList.add("is-opening");
      btn.classList.add("is-leaving");
      var target = "#/tape/" + cfg.id;
      if (reducedMotion()) { app.staticTo(target); return; }
      var rot = getComputedStyle(btn.closest(".stack__item")).getPropertyValue("--rot").trim() || "0deg";
      btn.animate([
        { transform: "translate(20px, -4px) rotate(calc(" + rot + " * -1))" },
        { transform: "translate(70px, -6px) rotate(calc(" + rot + " * -1))", opacity: 1, offset: .6 },
        { transform: "translate(150px, -6px) rotate(calc(" + rot + " * -1))", opacity: 0 }
      ], { duration: 380, easing: "cubic-bezier(.5, 0, .75, 0)", fill: "forwards" });
      setTimeout(function () { app.staticTo(target); }, 260);
    }

    /* ---------- Fit long titles ---------- */
    function fitAll() { tapes.forEach(function (t) { t.fit(); }); }
    var raf = 0;
    function onResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fitAll);
    }
    window.addEventListener("resize", onResize);
    requestAnimationFrame(fitAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

    return {
      el: view,
      header: header,
      unmount: function () {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(raf);
      }
    };
  }

  window.ShelfView = { create: create };
})();
