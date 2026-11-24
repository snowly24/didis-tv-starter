/* =========================================================
   The TV component.

   var tv = TV.create({ size: "big", powerButton: true });
   parent.appendChild(tv.el);

   States:   tv.turnOff()  tv.showStandby(text)  tv.showStatic()
             tv.showMessage(nodeOrText)  tv.showVideo(node)
   Effects:  tv.powerOn(fn)   — fn sets the state shown after power on
             tv.powerOff()
             tv.channelChange(fn, ms) — static, fn runs halfway through
             tv.osd(kind | node, { corner: "tl" | "tr", duration })
   All effects return Promises, so they can be chained with await.
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }
  function animate(el, frames, opts) {
    var a = el.animate(frames, opts);
    return a;
  }

  /* One noise tile, drawn once, shared by every TV (static effect) */
  var noiseReady = false;
  function makeNoise() {
    if (noiseReady) return;
    noiseReady = true;
    var size = 180;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(size, size);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255;
      img.data[i] = v;              // warm grey noise, never cold
      img.data[i + 1] = v * 0.94;
      img.data[i + 2] = v * 0.9;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    document.documentElement.style.setProperty("--tv-noise", 'url("' + c.toDataURL() + '")');
  }

  /* "PLAY ▸" etc. as text + SVG icon. kind: play|pause|ff|rew|stop */
  function osdLabel(kind) {
    var frag = document.createDocumentFragment();
    var word = document.createElement("span");
    word.textContent = CFG.osd[kind] || kind;
    frag.appendChild(word);
    if (["play", "pause", "ff", "rew", "stop"].indexOf(kind) !== -1) {
      frag.appendChild(Icons.el(kind));
    }
    return frag;
  }

  var TEMPLATE =
    '<div class="tv__bow" aria-hidden="true"></div>' +
    '<div class="tv__body">' +
      '<div class="tv__sticker" aria-hidden="true"><span class="washi"></span></div>' +
      '<div class="tv__bezel">' +
        '<div class="tv__screen">' +
          '<div class="tv__content">' +
            '<div class="tv__layer tv__layer--off"></div>' +
            '<div class="tv__layer tv__layer--standby"><div class="tv__roll"></div><div class="tv__standby-text"></div></div>' +
            '<div class="tv__layer tv__layer--message"><div class="tv__frame" aria-hidden="true"></div><div class="tv__message-body"></div></div>' +
            '<div class="tv__layer tv__layer--video"><div class="tv__video-slot"></div></div>' +
            '<div class="tv__layer tv__layer--static" aria-hidden="true"><div class="tv__noise"></div><div class="tv__tracking"></div><div class="tv__tracking"></div></div>' +
          '</div>' +
          '<div class="tv__scanlines" aria-hidden="true"></div>' +
          '<div class="tv__glass" aria-hidden="true"></div>' +
          '<div class="tv__osd" aria-hidden="true">' +
            '<div class="tv__osd-slot tv__osd-slot--tl"></div>' +
            '<div class="tv__osd-slot tv__osd-slot--tr"></div>' +
          '</div>' +
          '<div class="tv__beam" aria-hidden="true"></div>' +
        '</div>' +
      '</div>' +
      '<div class="tv__panel" aria-hidden="true">' +
        '<div class="tv__grille"></div>' +
        '<div class="tv__slot"></div>' +
        '<div class="tv__controls"><div class="tv__dots"><i></i><i></i><i></i><i></i><i></i></div></div>' +
      '</div>' +
    '</div>' +
    '<div class="tv__feet" aria-hidden="true"><i></i><i></i></div>';

  function TVInstance(opts) {
    opts = opts || {};
    makeNoise();

    var el = document.createElement("div");
    el.className = "tv tv--" + (opts.size || "big");
    el.innerHTML = TEMPLATE;
    this.el = el;

    var q = function (sel) { return el.querySelector(sel); };
    q(".tv__bow").appendChild(Icons.el("bow"));
    q(".tv__sticker").appendChild(Icons.el("heart-sticker"));

    /* Knob: a real <button> only where it's the power button */
    var knob = document.createElement(opts.powerButton ? "button" : "span");
    knob.className = "tv__knob";
    if (opts.powerButton) {
      knob.type = "button";
      knob.setAttribute("aria-label", CFG.ui.power);
      var hit = document.createElement("span");
      hit.className = "tv__hit";
      knob.appendChild(hit);
      // The panel is aria-hidden for decoration; lift the button out of it
      q(".tv__panel").removeAttribute("aria-hidden");
      q(".tv__grille").setAttribute("aria-hidden", "true");
      q(".tv__slot").setAttribute("aria-hidden", "true");
      q(".tv__dots").setAttribute("aria-hidden", "true");
    }
    q(".tv__controls").appendChild(knob);
    this.knob = knob;

    this.content = q(".tv__content");
    this.beam = q(".tv__beam");
    this.standbyText = q(".tv__standby-text");
    this.messageBody = q(".tv__message-body");
    this.videoSlot = q(".tv__video-slot");
    this.osdSlots = { tl: q(".tv__osd-slot--tl"), tr: q(".tv__osd-slot--tr") };
    this.osdTimers = {};

    this.setState(opts.state || "off");
  }

  TVInstance.prototype = {
    setState: function (state) {
      this.state = state;
      this.el.setAttribute("data-state", state);
    },

    /* Change state with no cross-fade (used inside transitions) */
    setStateInstant: function (fn) {
      var el = this.el;
      el.classList.add("is-instant");
      if (fn) fn();
      void el.offsetWidth; // apply now, before re-enabling transitions
      el.classList.remove("is-instant");
    },

    turnOff: function () { this.setState("off"); },

    showStandby: function (text) {
      if (text != null) this.standbyText.textContent = text;
      this.setState("standby");
    },

    showStatic: function () { this.setState("static"); },

    showMessage: function (content) {
      var node = content;
      if (typeof content === "string") {
        node = document.createElement("p");
        node.className = "tv-msg__big";
        node.textContent = content;
      }
      this.messageBody.replaceChildren(node);
      this.setState("message");
    },

    showVideo: function (node) {
      if (node && node.parentNode !== this.videoSlot) this.videoSlot.replaceChildren(node);
      this.setState("on");
    },

    /* Thin white line → full screen → flash → content fades in */
    powerOn: function (applyState) {
      var self = this;
      if (reducedMotion()) {
        self.setStateInstant(applyState || function () { self.showStandby(); });
        return animate(self.content, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }).finished;
      }
      var hold = animate(self.content, [{ opacity: 0 }, { opacity: 0 }], { duration: 1000, fill: "forwards" });
      self.setStateInstant(applyState || function () { self.showStandby(); });

      var open = animate(self.beam, [
        { opacity: 1, transform: "scale(0, .006)" },
        { opacity: 1, transform: "scale(1, .006)", offset: .4 },
        { opacity: 1, transform: "scale(1, 1)" }
      ], { duration: 460, easing: "cubic-bezier(.3, .7, .2, 1)", fill: "forwards" });

      return open.finished.then(function () {
        var flash = animate(self.beam, [
          { opacity: 1, transform: "scale(1, 1)" },
          { opacity: 0, transform: "scale(1, 1)" }
        ], { duration: 520, easing: "ease-out" });
        var reveal = animate(self.content, [
          { opacity: 0, transform: "scale(1.04)" },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 560, easing: "cubic-bezier(.22, 1, .36, 1)" });
        open.cancel();
        hold.cancel();
        return Promise.all([flash.finished, reveal.finished]);
      });
    },

    /* Content collapses to a line, then a dot, then dark */
    powerOff: function () {
      var self = this;
      if (self.state === "off") return Promise.resolve();
      if (reducedMotion()) {
        return animate(self.content, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished
          .then(function () { self.setStateInstant(function () { self.turnOff(); }); });
      }
      var ease = "cubic-bezier(.6, 0, .9, .4)";
      var squash = animate(self.content, [
        { transform: "scale(1, 1)", opacity: 1 },
        { transform: "scale(1, .006)", opacity: 1 }
      ], { duration: 230, easing: ease, fill: "forwards" });
      var line = animate(self.beam, [
        { opacity: 0, transform: "scale(1, 1)" },
        { opacity: 1, transform: "scale(1, .006)" }
      ], { duration: 230, easing: ease, fill: "forwards" });

      return line.finished.then(function () {
        var hideContent = animate(self.content, [{ opacity: 0 }, { opacity: 0 }], { duration: 600, fill: "forwards" });
        squash.cancel();
        var dot = animate(self.beam, [
          { opacity: 1, transform: "scale(1, .006)" },
          { opacity: 1, transform: "scale(.016, .02)", offset: .4 },
          { opacity: 0, transform: "scale(.008, .01)" }
        ], { duration: 560, easing: "ease-in-out", fill: "forwards" });
        line.cancel();
        return dot.finished.then(function () {
          self.setStateInstant(function () { self.turnOff(); });
          dot.cancel();
          hideContent.cancel();
        });
      });
    },

    /* Static + tracking lines; applyState runs halfway through */
    channelChange: function (applyState, ms) {
      var self = this;
      ms = ms || 500;
      if (reducedMotion()) {
        return animate(self.content, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }).finished
          .then(function (a) {
            self.setStateInstant(applyState);
            return animate(self.content, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 }).finished;
          });
      }
      self.el.classList.add("is-static");
      return wait(ms / 2).then(function () {
        self.setStateInstant(applyState);
        return wait(ms / 2);
      }).then(function () {
        self.el.classList.remove("is-static");
      });
    },

    /* On-screen display text in a corner. kind = play|pause|ff|rew|stop, or any node/text */
    osd: function (kind, opts) {
      opts = opts || {};
      var corner = opts.corner || "tl";
      var duration = opts.duration == null ? 1500 : opts.duration;
      var slot = this.osdSlots[corner];
      var content = typeof kind === "string" ? osdLabel(kind) : kind;
      slot.replaceChildren(content);
      slot.classList.add("is-visible");
      clearTimeout(this.osdTimers[corner]);
      if (duration > 0) {
        this.osdTimers[corner] = setTimeout(function () { slot.classList.remove("is-visible"); }, duration);
      }
    },

    clearOsd: function () {
      var self = this;
      Object.keys(self.osdSlots).forEach(function (k) {
        clearTimeout(self.osdTimers[k]);
        self.osdSlots[k].classList.remove("is-visible");
      });
    }
  };

  window.TV = {
    create: function (opts) { return new TVInstance(opts); },
    osdLabel: osdLabel,
    wait: wait
  };
})();
