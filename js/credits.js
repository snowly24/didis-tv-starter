/* =========================================================
   View 4 — Credits (#/credits)
   The big TV powers on and rolls movie-style end credits,
   then "happy birthday, sunshine ♡" and a rewind button.
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;
  var C = CFG.credits;
  var PX_PER_SCREEN_PER_S = 0.16;   // roll speed: share of the screen height per second

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function friendNames() {
    var seen = {}, names = [];
    CFG.tapes.forEach(function (t) {
      if (t.from && !seen[t.from]) { seen[t.from] = true; names.push(t.from); }
    });
    return names;
  }

  function create(route, app) {
    var view = el("section", "view view--credits");
    var header = Header.create({ onLogo: function () { app.staticTo("#/shelf"); } });
    view.appendChild(header.el);

    var wrap = el("div", "credits");
    var tv = TV.create({ size: "large" });
    tv.el.classList.add("credits__tv");

    /* The rolling text */
    var screenBox = el("div", "roll-wrap");
    var roll = el("div", "roll");
    function block(role, names, big) {
      var b = el("div", "roll__block");
      b.appendChild(el("p", "roll__role", role));
      names.forEach(function (n) { b.appendChild(el("p", "roll__name" + (big ? " roll__name--big" : ""), n)); });
      roll.appendChild(b);
    }
    block(C.starring, [C.star], true);
    block(C.withLove, friendNames(), false);
    block(C.producedBy, [CFG.site.creditsFrom], false);
    screenBox.appendChild(roll);
    var ending = el("p", "roll__end", C.ending);
    screenBox.appendChild(ending);

    /* Rewind button under the TV (appears at the end) */
    var rewind = el("button", "credits__rewind");
    rewind.type = "button";
    rewind.appendChild(Icons.el("rewind"));
    rewind.appendChild(el("span", null, C.rewind));
    rewind.hidden = true;
    rewind.addEventListener("click", function () {
      tv.osd("rew", { corner: "tl", duration: 1500 });
      header.setStatus("rew");
      if (rollAnim) { rollAnim.playbackRate = -6; rollAnim.play(); }
      setTimeout(function () { app.staticTo("#/shelf"); }, 650);
    });

    wrap.appendChild(tv.el);
    wrap.appendChild(rewind);
    view.appendChild(wrap);

    var rollAnim = null;
    var timers = [];

    function finish() {
      ending.classList.add("is-visible");
      rewind.hidden = false;
      header.setStatus("stop");
    }

    function startRoll() {
      if (reducedMotion()) {
        // No rolling: names shown still, then a fade to the last line
        roll.classList.add("is-still");
        rewind.hidden = false;
        timers.push(setTimeout(function () {
          roll.classList.add("is-done");
          finish();
        }, 5000));
        return;
      }
      var screenH = screenBox.getBoundingClientRect().height;
      var rollH = roll.getBoundingClientRect().height;
      var distance = screenH + rollH;
      var duration = Math.max(9000, (distance / (screenH * PX_PER_SCREEN_PER_S)) * 1000);
      rollAnim = roll.animate([
        { transform: "translateY(0)" },
        { transform: "translateY(" + (-distance) + "px)" }
      ], { duration: duration, easing: "linear", fill: "forwards" });
      rollAnim.finished.then(finish).catch(function () {});
    }

    /* Power on, then roll */
    header.setStatus("play");
    timers.push(setTimeout(function () {
      Sound.play("power");
      tv.powerOn(function () { tv.showVideo(screenBox); }).then(function () {
        tv.osd("play", { corner: "tl", duration: 1600 });
        timers.push(setTimeout(startRoll, 400));
      });
    }, 250));

    return {
      el: view,
      unmount: function () {
        timers.forEach(clearTimeout);
        if (rollAnim) rollAnim.cancel();
      }
    };
  }

  window.CreditsView = { create: create };
})();
