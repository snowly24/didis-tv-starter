/* =========================================================
   Sound effects, made with the Web Audio API (no audio files).
   Sound.play("click" | "power" | "static" | "clunk" | "pop")
   • Starts working after the visitor's first click or key press
     (browsers don't allow sound before that).
   • Off when the header toggle is off (saved in localStorage).
     The toggle is the site's main sound switch: the Player also
     mutes the video while it's off.
   • Never plays while a video is playing.
   ========================================================= */
(function () {
  var KEY = "didis-tv-sound";
  var MASTER = 0.35;
  var listeners = [];
  var ctx = null, master = null, noiseBuffer = null;

  function read() {
    try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; }
  }
  var on = read();

  /* ---------- Audio setup (after the first gesture) ---------- */
  function ensureContext() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER;
    master.connect(ctx.destination);
    // One second of white noise, reused by every noisy sound
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function unlock() { ensureContext(); }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    document.addEventListener(ev, unlock, { capture: true, passive: true });
  });

  function videoPlaying() {
    var vids = document.getElementsByTagName("video");
    for (var i = 0; i < vids.length; i++) {
      if (!vids[i].paused && !vids[i].ended) return true;
    }
    return false;
  }

  /* ---------- Small building blocks ---------- */
  function env(gainNode, t, attack, peak, decay) {
    var g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(peak, t + attack);
    g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function tone(type, f1, f2, t, dur, peak) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, 0.005, peak, dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, peak, filterType, freq, q) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    var f = ctx.createBiquadFilter();
    f.type = filterType || "bandpass";
    f.frequency.value = freq || 2000;
    f.Q.value = q || 0.8;
    var g = ctx.createGain();
    env(g, t, 0.01, peak, dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  /* ---------- The sounds ---------- */
  var SOUNDS = {
    // soft button tick
    click: function (t) {
      tone("triangle", 1900, 1300, t, 0.045, 0.18);
      noise(t, 0.02, 0.05, "highpass", 4000, 0.7);
    },
    // TV power: a click, then a soft CRT hum that fades
    power: function (t) {
      noise(t, 0.03, 0.35, "highpass", 2500, 0.7);
      tone("sine", 110, 70, t, 0.12, 0.35);
      tone("sine", 60, null, t + 0.05, 0.9, 0.06);
      tone("sine", 120, null, t + 0.05, 0.8, 0.035);
      tone("sine", 15625 / 2, null, t + 0.05, 0.5, 0.004); // faint CRT whine
    },
    // static hiss for channel changes
    static: function (t) {
      noise(t, 0.5, 0.22, "bandpass", 2600, 0.6);
      noise(t, 0.45, 0.08, "lowpass", 700, 0.7);
    },
    // tape going into the VCR
    clunk: function (t) {
      noise(t, 0.04, 0.3, "lowpass", 900, 0.8);
      tone("sine", 150, 55, t, 0.2, 0.55);
      noise(t + 0.12, 0.05, 0.18, "bandpass", 1400, 1.2);
      tone("square", 90, 60, t + 0.12, 0.06, 0.05);
    },
    // little heart pop
    pop: function (t) {
      tone("sine", 620, 1250, t, 0.09, 0.16);
      tone("sine", 930, 1600, t + 0.06, 0.08, 0.08);
    }
  };

  function play(name) {
    if (!on || !SOUNDS[name] || videoPlaying()) return;
    if (!ensureContext() || ctx.state !== "running") return;
    try { SOUNDS[name](ctx.currentTime + 0.01); } catch (e) { /* never break the page for a sound */ }
  }

  window.Sound = {
    play: play,
    isOn: function () { return on; },
    setOn: function (value) {
      on = !!value;
      try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) { /* private mode: fine */ }
      listeners.forEach(function (fn) { fn(on); });
    },
    toggle: function () { this.setOn(!on); if (on) play("click"); },
    onChange: function (fn) { listeners.push(fn); },
    offChange: function (fn) {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    }
  };
})();
