/* =========================================================
   View 1 — Lock (#/)
   The big TV on a VCR. Power / slot / screen → password screen
   on the TV. Right password → hearts, welcome, tape goes in,
   zoom into the screen → app.unlock().
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var DECOR =
    '<div class="lock__decor" aria-hidden="true">' +
      '<div class="decor-polaroid"><span class="washi"></span><div class="decor-polaroid__photo"></div></div>' +
      '<div class="decor-heart"></div>' +
      '<div class="decor-flower"></div>' +
    '</div>';

  var VCR =
    '<div class="vcr__body">' +
      '<div class="vcr__left" aria-hidden="true"><span class="vcr__led"></span><span class="vcr__clock">--:--</span></div>' +
      '<button type="button" class="vcr__slot"><span class="vcr__flap"></span></button>' +
      '<div class="vcr__right" aria-hidden="true"><i></i><i></i><i></i></div>' +
    '</div>' +
    '<div class="vcr__tape" aria-hidden="true"><span></span></div>' +
    '<div class="vcr__feet" aria-hidden="true"><i></i><i></i></div>';

  function create(route, app) {
    var view = el("section", "view view--lock");
    view.innerHTML = DECOR;
    view.querySelector(".decor-heart").appendChild(Icons.el("heart-sticker"));
    view.querySelector(".decor-flower").appendChild(Icons.el("flower"));

    var line = el("p", "lock__line", CFG.site.lockLine);

    /* Stage: TV + "press power" + VCR + doily */
    var stage = el("div", "lock__stage");
    var tvWrap = el("div", "lock__tv");
    var tv = TV.create({ size: "big", powerButton: true });
    tv.showStandby(CFG.lock.standbyText);
    tvWrap.appendChild(tv.el);

    var press = el("div", "lock__press");
    press.setAttribute("aria-hidden", "true");
    press.appendChild(el("span", "lock__press-text", CFG.lock.pressPower));
    press.appendChild(Icons.el("arrow", "lock__press-arrow lock__press-arrow--side"));
    press.appendChild(Icons.el("arrow-hook", "lock__press-arrow lock__press-arrow--below"));

    var vcr = el("div", "vcr");
    vcr.innerHTML = VCR;
    var slot = vcr.querySelector(".vcr__slot");
    slot.setAttribute("aria-label", CFG.lock.tapeSlot);

    var doily = el("div", "lock__doily");
    doily.setAttribute("aria-hidden", "true");
    doily.appendChild(Icons.el("doily"));

    tvWrap.appendChild(press);
    stage.appendChild(tvWrap);
    stage.appendChild(vcr);
    stage.appendChild(doily);
    view.appendChild(line);
    view.appendChild(stage);

    /* ---------- Password form (shown on the TV screen) ---------- */
    var form = el("form", "pw");
    form.setAttribute("novalidate", "");
    form.setAttribute("autocomplete", "off");
    var prompt = el("p", "pw__prompt tv-msg__small", CFG.lock.passwordPrompt);
    var field = el("div", "pw__field");
    var label = el("label", "sr-only", CFG.lock.passwordLabel);
    label.htmlFor = "pw-input";
    var input = el("input", "pw__input");
    input.id = "pw-input";
    input.type = "text";
    input.name = "didi-password";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "none");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("enterkeyhint", "go");
    var mirror = el("span", "pw__mirror");
    mirror.setAttribute("aria-hidden", "true");
    var mirrorText = el("span", "pw__mirror-text");
    mirror.appendChild(mirrorText);
    mirror.appendChild(el("span", "pw__caret"));
    field.appendChild(label);
    field.appendChild(mirror);
    field.appendChild(input);

    var play = el("button", "pw__play osd-text");
    play.type = "submit";
    play.appendChild(Icons.el("play"));
    play.appendChild(el("span", null, CFG.lock.playButton));

    var hintLink = el("button", "pw__hint-link", CFG.lock.hintLink);
    hintLink.type = "button";
    var hintText = el("p", "pw__hint", CFG.site.passwordHint);
    hintText.hidden = true;
    hintText.setAttribute("aria-live", "polite");

    form.appendChild(prompt);
    form.appendChild(field);
    form.appendChild(play);
    form.appendChild(hintLink);
    form.appendChild(hintText);

    var welcome = el("p", "tv-msg__welcome", CFG.site.welcomeMessage);

    /* ---------- Behaviour ---------- */
    var mode = "standby";      // standby → password → done
    var busy = false;
    var tries = 0;
    var timers = [];
    var screen = tv.el.querySelector(".tv__screen");

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function syncMirror() { mirrorText.textContent = input.value; }
    input.addEventListener("input", syncMirror);

    function ensureVisible() {
      // Phones: keep the screen in view above the on-screen keyboard
      if (window.innerWidth > 760) return;
      later(function () {
        screen.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
      }, 350);
    }

    function openPassword() {
      if (mode === "password") { input.focus(); return; }
      if (mode !== "standby") return;
      mode = "password";
      view.classList.add("is-password");
      tv.channelChange(function () { tv.showMessage(form); }, 450, { early: true });
      input.focus({ preventScroll: true });   // inside the click, so phones open the keyboard
      ensureVisible();
    }

    tv.knob.addEventListener("click", openPassword);
    slot.addEventListener("click", openPassword);
    screen.addEventListener("click", function () { if (mode === "standby") openPassword(); });
    if (window.visualViewport) window.visualViewport.addEventListener("resize", onViewport);
    function onViewport() { if (document.activeElement === input) ensureVisible(); }

    function showHint() {
      hintLink.hidden = true;
      hintText.hidden = false;
    }
    hintLink.addEventListener("click", function () { showHint(); input.focus(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy || mode !== "password") return;
      var cleaned = DidiHash.normalize(input.value);
      if (!cleaned) { input.focus(); return; }
      busy = true;
      DidiHash.sha256(cleaned).then(function (hash) {
        if (hash === String(CFG.site.passwordHash).trim().toLowerCase()) success();
        else wrong();
      });
    });

    function wrong() {
      tries++;
      input.value = "";
      syncMirror();
      if (!reducedMotion()) {
        tvWrap.animate([
          { transform: "translateX(0)" },
          { transform: "translateX(-9px) rotate(-.6deg)" },
          { transform: "translateX(8px) rotate(.5deg)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0)" }
        ], { duration: 460, easing: "ease-out" });
      }
      tv.el.classList.add("is-static");
      tv.osd(document.createTextNode(CFG.lock.noSignal), { corner: "tl", duration: 750 });
      later(function () {
        tv.el.classList.remove("is-static");
        if (tries >= 3) showHint();
        busy = false;
      }, 700);
      input.focus();
    }

    function success() {
      mode = "done";
      input.blur();
      var r = screen.getBoundingClientRect();
      Effects.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 36, spread: Math.max(220, r.width * 0.75) });
      tv.showMessage(welcome);

      wait(1500)
        .then(function () { return insertTape(); })
        .then(function () { return wait(350); })
        .then(function () { return zoomIntoScreen(); })
        .then(function () { app.unlock(); });
    }

    function insertTape() {
      var tape = vcr.querySelector(".vcr__tape");
      vcr.classList.add("is-loading");
      if (reducedMotion()) {
        vcr.classList.add("is-unlocked");
        return wait(300);
      }
      var a = tape.animate([
        { transform: "translate(-50%, 90%) scale(1.35)", opacity: 0 },
        { transform: "translate(-50%, 55%) scale(1.2)", opacity: 1, offset: .3 },
        { transform: "translate(-50%, 0) scale(1)", opacity: 1, offset: .75 },
        { transform: "translate(-50%, 0) scale(.94)", opacity: 0 }
      ], { duration: 900, easing: "cubic-bezier(.45, 0, .3, 1)", fill: "forwards" });
      return a.finished.then(function () {
        // the "clunk"
        vcr.querySelector(".vcr__body").animate([
          { transform: "translateY(0)" }, { transform: "translateY(2px)" }, { transform: "translateY(0)" }
        ], { duration: 200, easing: "ease-out" });
        vcr.classList.add("is-unlocked");
        return wait(250);
      });
    }

    function zoomIntoScreen() {
      if (reducedMotion()) return app.flashIn(450);
      var r = screen.getBoundingClientRect();
      var vr = view.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var scale = Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.2;
      document.documentElement.classList.add("is-zooming");
      view.style.transformOrigin = (cx - vr.left) + "px " + (cy - vr.top) + "px";
      tv.beam.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: "ease-in", fill: "forwards" });
      var zoom = view.animate([
        { transform: "translate(0, 0) scale(1)" },
        { transform: "translate(" + (window.innerWidth / 2 - cx) + "px, " + (window.innerHeight / 2 - cy) + "px) scale(" + scale + ")" }
      ], { duration: 950, easing: "cubic-bezier(.6, 0, .85, .35)", fill: "forwards" });
      later(function () { app.flashIn(320); }, 650);
      return zoom.finished.then(function () { return wait(120); });
    }

    return {
      el: view,
      unmount: function () {
        timers.forEach(clearTimeout);
        if (window.visualViewport) window.visualViewport.removeEventListener("resize", onViewport);
        document.documentElement.classList.remove("is-zooming");
      }
    };
  }

  window.LockView = { create: create };
})();
