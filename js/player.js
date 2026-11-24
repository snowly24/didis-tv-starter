/* =========================================================
   View 3 — Player (#/tape/N)
   The video plays inside the big TV. One <video> element is
   reused for the whole visit, so once a click has allowed
   sound, every later tape can start with sound too.
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;
  var T = CFG.player;
  var UI = CFG.ui;

  var STATIC_MS = 500;      // static before a tape starts
  var OSD_MS = 2000;        // "PLAY ▸" stays on screen this long
  var START_AFTER_MS = 700; // video starts this long after "PLAY ▸" appears
  var COUNTDOWN_S = 5;      // end card countdown
  var SKIP_S = 10;          // rewind / forward step

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function tapeIndex(id) {
    for (var i = 0; i < CFG.tapes.length; i++) if (CFG.tapes[i].id === id) return i;
    return 0;
  }
  function neighbour(id, step) {
    var n = CFG.tapes.length;
    return CFG.tapes[(tapeIndex(id) + step + n) % n];
  }
  function allWatched() {
    return CFG.tapes.every(function (t) { return Tape.isWatched(t.id); });
  }
  function fill(text, key, value) { return String(text).replace("{" + key + "}", value); }

  /* ---------- The shared <video> ---------- */
  var video = null;
  var userMuted = false;          // the viewer's own mute choice, kept between tapes
  function getVideo() {
    if (!video) {
      video = document.createElement("video");
      video.className = "pv__video";
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "metadata";
    }
    return video;
  }
  function setSource(tape) {
    var v = getVideo();
    if (v.getAttribute("data-src") !== tape.video) {
      v.setAttribute("data-src", tape.video);
      v.src = tape.video;
    }
  }

  /* Call inside the click that picks a tape: lets phones play with sound later */
  function prime(tape) {
    var v = getVideo();
    setSource(tape);
    v.muted = false;
    var p = v.play();
    v.pause();
    if (p && p.catch) p.catch(function () { /* interrupted on purpose */ });
  }

  /* ---------- View ---------- */
  function create(route, app) {
    var view = el("section", "view view--player");
    /* Logo → the video stops, the TV powers off, then the Shelf */
    var leaving = false;
    var header = Header.create({
      onLogo: function () {
        if (leaving) return;
        leaving = true;
        token++;
        clearTimers();
        getVideo().pause();
        tv.clearOsd();
        tv.powerOff().then(function () { location.hash = "#/shelf"; });
      }
    });
    view.appendChild(header.el);

    var player = el("div", "player");

    /* Above the TV: prev / next stickers */
    var nav = el("div", "player__nav");
    var prevBtn = el("button", "player__navbtn player__navbtn--prev");
    prevBtn.type = "button";
    prevBtn.appendChild(Icons.el("prev"));
    prevBtn.appendChild(el("span", null, T.prevTape));
    var nextBtn = el("button", "player__navbtn player__navbtn--next");
    nextBtn.type = "button";
    nextBtn.appendChild(el("span", null, T.nextTape));
    nextBtn.appendChild(Icons.el("next"));
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    /* Stage: side tape · TV + controls · side tape */
    var stage = el("div", "player__stage");
    var sidePrev = el("div", "side-tape side-tape--prev");
    var sideNext = el("div", "side-tape side-tape--next");
    var center = el("div", "player__center");

    var tv = TV.create({ size: "large" });
    tv.el.classList.add("player__tv");
    var screen = tv.el.querySelector(".tv__screen");

    // What goes in the TV's video slot: blurred backdrop + the video
    var holder = el("div", "pv");
    var backdrop = el("canvas", "pv__backdrop");
    backdrop.width = 64;
    backdrop.height = 36;
    backdrop.setAttribute("aria-hidden", "true");
    holder.appendChild(backdrop);

    // "TAP FOR SOUND" (only if the browser blocks sound)
    var soundBtn = el("button", "pv__sound osd-text");
    soundBtn.type = "button";
    soundBtn.appendChild(Icons.el("sound-on"));
    soundBtn.appendChild(el("span", null, T.tapForSound));
    soundBtn.hidden = true;
    screen.appendChild(soundBtn);

    /* Controls */
    var controls = el("div", "vcr-controls");
    function ctlButton(cls, iconName, label) {
      var b = el("button", "vbtn " + cls);
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.appendChild(Icons.el(iconName));
      return b;
    }
    var rewBtn = ctlButton("vbtn--rew", "rew", UI.rewind);
    var playBtn = ctlButton("vbtn--play", "play", UI.play);
    var ffBtn = ctlButton("vbtn--ff", "ff", UI.forward);
    var bar = el("input", "vbar");
    bar.type = "range";
    bar.min = "0";
    bar.max = "100";
    bar.step = "0.1";
    bar.value = "0";
    bar.setAttribute("aria-label", UI.seek);
    var time = el("span", "vtime", "00:00 / 00:00");
    time.setAttribute("aria-hidden", "true");
    var muteBtn = ctlButton("vbtn--small vbtn--mute", "sound-on", UI.mute);
    var vol = el("input", "vvol");
    vol.type = "range";
    vol.min = "0";
    vol.max = "1";
    vol.step = "0.05";
    vol.value = "1";
    vol.setAttribute("aria-label", UI.volume);
    var fsBtn = ctlButton("vbtn--small vbtn--fs", "fullscreen", UI.fullscreen);
    var group1 = el("div", "vcr-controls__buttons");
    group1.append(rewBtn, playBtn, ffBtn);
    var group2 = el("div", "vcr-controls__bar");
    group2.append(bar, time);
    var group3 = el("div", "vcr-controls__extra");
    group3.append(muteBtn, vol, fsBtn);
    controls.append(group1, group2, group3);

    /* Caption under the TV */
    var caption = el("div", "player__caption");
    var capTitle = el("p", "player__title");
    var capFrom = el("p", "player__from");
    var capMsg = el("p", "player__message");
    caption.append(capTitle, capFrom, capMsg);

    center.append(tv.el, controls, caption);
    stage.append(sidePrev, center, sideNext);
    player.append(nav, stage);
    view.appendChild(player);

    /* ---------- State ---------- */
    var v = getVideo();
    var current = null;
    var token = 0;                 // increases on every tape change; stale timers check it
    var timers = [];
    var countdown = null;
    var fixingDuration = false;
    var seeking = false;
    var statusTimer = null;

    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; clearInterval(countdown); countdown = null; }

    function setStatus(kind, temporary) {
      header.setStatus(kind);
      clearTimeout(statusTimer);
      if (temporary) {
        statusTimer = setTimeout(function () { header.setStatus(v.paused ? "pause" : "play"); }, 1500);
      }
    }
    function osd(kind) { tv.osd(kind, { corner: "tl", duration: 1500 }); }

    /* ---------- Side tapes + caption for the current tape ---------- */
    function sideTape(box, tape, labelPrefix, step) {
      box.replaceChildren();
      var floater = el("div", "side-tape__float");
      var t = Tape.create(tape);
      t.el.setAttribute("aria-label", labelPrefix + " " + tape.title);
      t.el.addEventListener("click", function () { go(tape); });
      floater.appendChild(t.el);
      box.appendChild(floater);
      var name = el("p", "side-tape__title", tape.title);
      name.setAttribute("aria-hidden", "true");
      box.appendChild(name);
      requestAnimationFrame(t.fit);
    }

    function paintTapeInfo(tape) {
      capTitle.textContent = tape.title;
      capFrom.textContent = CFG.shelf.from + " " + tape.from + " ";
      capFrom.appendChild(Icons.el("heart", "player__heart"));
      capMsg.textContent = tape.message || "";
      capMsg.hidden = !tape.message;
      var p = neighbour(tape.id, -1), n = neighbour(tape.id, 1);
      sideTape(sidePrev, p, UI.prevTapeLabel, -1);
      sideTape(sideNext, n, UI.nextTapeLabel, 1);
      prevBtn.setAttribute("aria-label", UI.prevTapeLabel + " " + p.title);
      nextBtn.setAttribute("aria-label", UI.nextTapeLabel + " " + n.title);
      document.title = tape.title + " · " + CFG.site.title;
    }

    /* ---------- Loading a tape ---------- */
    function load(tape) {
      var my = ++token;
      clearTimers();
      current = tape;
      v.pause();
      Sound.play("static");
      soundBtn.hidden = true;
      tv.clearOsd();
      paintTapeInfo(tape);
      setSource(tape);
      try { v.currentTime = 0; } catch (e) { /* not loaded yet */ }
      holder.classList.remove("is-portrait");
      updateTime();

      if (!v.parentNode) holder.appendChild(v);
      tv.channelChange(function () { tv.showVideo(holder); tv.messageBody.replaceChildren(); }, STATIC_MS).then(function () {
        if (my !== token) return;
        if (v.error) { showMissing(); return; }
        tv.osd("play", { corner: "tl", duration: OSD_MS });
        setStatus("play");
        later(function () { if (my === token) start(); }, START_AFTER_MS);
      });
    }

    function start() {
      v.muted = userMuted || !Sound.isOn();   // header sound switch off = video muted too
      var p = v.play();
      if (!p || !p.catch) return;
      var my = token;
      p.catch(function (err) {
        if (my !== token || !err || err.name !== "NotAllowedError") return;
        // Sound blocked: play muted and offer a big button
        v.muted = true;
        paintMute();
        v.play().catch(function () {});
        soundBtn.hidden = false;
      });
    }

    function showMissing() {
      tv.showStandby(fill(T.comingSoon, "n", current.id));
      setStatus("stop");
    }

    function go(tape) {
      if (!tape) return;
      location.hash = "#/tape/" + tape.id;
    }

    /* ---------- Video events ---------- */
    function updateTime() {
      var d = isFinite(v.duration) ? v.duration : 0;
      if (!seeking) bar.value = d ? (v.currentTime / d) * 100 : 0;
      bar.style.setProperty("--p", (d ? (v.currentTime / d) * 100 : 0) + "%");
      time.textContent = fmt(v.currentTime) + " / " + fmt(Math.round(d));
      if (current && d && !fixingDuration && !v.paused && v.currentTime / d > 0.9) Tape.markWatched(current.id);
    }
    function paintPlay() {
      playBtn.replaceChildren(Icons.el(v.paused ? "play" : "pause"));
      playBtn.setAttribute("aria-label", v.paused ? UI.play : UI.pause);
      playBtn.classList.toggle("is-on", !v.paused);
    }
    function paintMute() {
      var off = v.muted || v.volume === 0;
      muteBtn.replaceChildren(Icons.el(off ? "sound-off" : "sound-on"));
      muteBtn.setAttribute("aria-label", off ? UI.unmute : UI.mute);
      muteBtn.setAttribute("aria-pressed", off ? "true" : "false");
    }
    function drawBackdrop() {
      try {
        var ctx = backdrop.getContext("2d");
        ctx.drawImage(v, 0, 0, backdrop.width, backdrop.height);
      } catch (e) { /* not ready */ }
    }

    var on = {
      loadedmetadata: function () {
        holder.classList.toggle("is-portrait", v.videoHeight > v.videoWidth);
        if (!isFinite(v.duration)) {
          // Some recorded files don't store their length: find it by seeking far ahead
          fixingDuration = true;
          v.currentTime = 1e7;
        }
        updateTime();
      },
      durationchange: function () {
        if (fixingDuration && isFinite(v.duration)) {
          fixingDuration = false;
          v.currentTime = 0;
        }
        updateTime();
      },
      loadeddata: drawBackdrop,
      seeked: drawBackdrop,
      timeupdate: function () {
        updateTime();
        if (holder.classList.contains("is-portrait") && Math.floor(v.currentTime * 2) % 2 === 0) drawBackdrop();
      },
      play: function () { paintPlay(); },
      pause: function () { paintPlay(); },
      volumechange: function () {
        paintMute();
        vol.value = v.muted ? 0 : v.volume;
        vol.style.setProperty("--p", (v.muted ? 0 : v.volume * 100) + "%");
      },
      ended: function () { onEnded(); },
      error: function () { if (tv.state !== "static") showMissing(); }
    };
    Object.keys(on).forEach(function (k) { v.addEventListener(k, on[k]); });

    /* ---------- Actions ---------- */
    function togglePlay() {
      if (tv.state !== "on") return;
      if (v.paused) {
        if (v.ended) v.currentTime = 0;
        v.play().catch(function () {});
        osd("play"); setStatus("play");
      } else {
        v.pause();
        osd("pause"); setStatus("pause");
      }
    }
    function skip(sec) {
      if (tv.state !== "on" || !isFinite(v.duration)) return;
      v.currentTime = Math.max(0, Math.min(v.duration - 0.05, v.currentTime + sec));
      var kind = sec < 0 ? "rew" : "ff";
      osd(kind); setStatus(kind, true);
    }
    /* The mute button under the TV mutes the video only. Unmuting while
       the header's main sound switch is off turns the switch back on. */
    function toggleMute() {
      var nowMuted = v.muted || v.volume === 0;
      if (nowMuted) {
        userMuted = false;
        if (v.volume === 0) v.volume = 1;
        if (!Sound.isOn()) Sound.setOn(true);   // → onSoundSetting unmutes
        v.muted = false;
      } else {
        userMuted = true;
        v.muted = true;
      }
      soundBtn.hidden = true;
    }
    /* Header sound switch: off mutes the video, on brings its sound back */
    function onSoundSetting(isOn) {
      if (isOn) {
        userMuted = false;
        v.muted = false;
        soundBtn.hidden = true;
      } else {
        v.muted = true;
      }
    }
    Sound.onChange(onSoundSetting);
    function fullscreen() {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (v.requestFullscreen) v.requestFullscreen().catch(function () {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    }

    rewBtn.addEventListener("click", function () { skip(-SKIP_S); });
    ffBtn.addEventListener("click", function () { skip(SKIP_S); });
    playBtn.addEventListener("click", togglePlay);
    muteBtn.addEventListener("click", toggleMute);
    fsBtn.addEventListener("click", fullscreen);
    vol.addEventListener("input", function () {
      v.volume = Number(vol.value);
      v.muted = v.volume === 0;
      userMuted = v.muted;
      if (!v.muted && !Sound.isOn()) Sound.setOn(true);
    });
    bar.addEventListener("input", function () {
      seeking = true;
      if (isFinite(v.duration)) v.currentTime = (Number(bar.value) / 100) * v.duration;
      bar.style.setProperty("--p", bar.value + "%");
    });
    bar.addEventListener("change", function () { seeking = false; });
    soundBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userMuted = false;
      if (!Sound.isOn()) Sound.setOn(true);
      v.muted = false;
      soundBtn.hidden = true;
      if (v.paused) v.play().catch(function () {});
    });
    prevBtn.addEventListener("click", function () { go(neighbour(current.id, -1)); });
    nextBtn.addEventListener("click", function () { go(neighbour(current.id, 1)); });

    /* Click the screen = play/pause; swipe left/right = next/prev */
    var swipe = null, swiped = false;
    screen.addEventListener("click", function (e) {
      if (swiped) { swiped = false; return; }
      if (e.target.closest("button")) return;
      togglePlay();
    });
    screen.addEventListener("touchstart", function (e) {
      var t = e.touches[0];
      swipe = { x: t.clientX, y: t.clientY };
    }, { passive: true });
    screen.addEventListener("touchend", function (e) {
      if (!swipe) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > 60 && Math.abs(dy) < 50) {
        swiped = true;
        go(neighbour(current.id, dx < 0 ? 1 : -1));
      }
    });

    /* Keyboard: Space, ← →, M, F */
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" && e.target.type !== "range") return;
      if (tag === "textarea" || e.target.isContentEditable) return;
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault(); togglePlay(); break;
        case "ArrowLeft": e.preventDefault(); skip(-SKIP_S); break;
        case "ArrowRight": e.preventDefault(); skip(SKIP_S); break;
        case "m": case "M": toggleMute(); break;
        case "f": case "F": fullscreen(); break;
      }
    }
    document.addEventListener("keydown", onKey);

    /* ---------- End of tape ---------- */
    function onEnded() {
      var my = token;
      Tape.markWatched(current.id);
      tv.osd("stop", { corner: "tl", duration: 0 });
      setStatus("stop");
      later(function () { if (my === token) showEndCard(); }, 1100);
    }

    function cardButton(text, cls, fn, icon) {
      var b = el("button", "endcard__btn " + (cls || ""));
      b.type = "button";
      b.appendChild(el("span", null, text));
      if (icon) b.appendChild(Icons.el(icon));
      b.addEventListener("click", function (e) { e.stopPropagation(); fn(); });
      return b;
    }

    function replay() {
      clearTimers();
      tv.clearOsd();
      v.currentTime = 0;
      Sound.play("static");
      tv.channelChange(function () { tv.showVideo(holder); tv.messageBody.replaceChildren(); }, STATIC_MS).then(function () {
        osd("play"); setStatus("play");
        start();
      });
    }

    function showEndCard() {
      var card = el("div", "endcard");
      var next = neighbour(current.id, 1);
      if (allWatched()) {
        card.appendChild(el("p", "endcard__big", T.allWatched));
        var row = el("div", "endcard__row");
        row.appendChild(cardButton(T.toCredits, "is-main", function () { location.hash = "#/credits"; }, "next"));
        row.appendChild(cardButton(T.watchAgain, "", replay));
        card.appendChild(row);
        tv.showMessage(card);
        return;
      }
      card.appendChild(el("p", "endcard__small", T.nextUp));
      card.appendChild(el("p", "endcard__big", next.title));
      var count = el("p", "endcard__count");
      card.appendChild(count);
      var row2 = el("div", "endcard__row");
      var playNow = cardButton(T.playNow, "is-main", function () { go(next); }, "next");
      var stay = cardButton(T.stay, "", function () {
        clearInterval(countdown); countdown = null;
        count.textContent = "";
        stay.replaceWith(cardButton(T.watchAgain, "", replay));
      });
      row2.append(playNow, stay);
      card.appendChild(row2);
      tv.showMessage(card);

      var left = COUNTDOWN_S;
      count.textContent = fill(T.countdown, "s", left);
      countdown = setInterval(function () {
        left--;
        if (left <= 0) { clearInterval(countdown); countdown = null; go(next); return; }
        count.textContent = fill(T.countdown, "s", left);
      }, 1000);
    }

    paintPlay();
    paintMute();
    load(CFG.tapes[tapeIndex(route.id)]);

    return {
      el: view,
      update: function (r) {
        if (r.name !== "tape") return false;
        if (current && r.id === current.id) return true;
        load(CFG.tapes[tapeIndex(r.id)]);
        return true;
      },
      unmount: function () {
        token++;
        clearTimers();
        clearTimeout(statusTimer);
        v.pause();
        try { v.currentTime = 0; } catch (e) {}
        Object.keys(on).forEach(function (k) { v.removeEventListener(k, on[k]); });
        document.removeEventListener("keydown", onKey);
        Sound.offChange(onSoundSetting);
        if (v.parentNode) v.parentNode.removeChild(v);
        document.title = CFG.site.title;
      }
    };
  }

  window.PlayerView = { create: create };
  window.Player = { prime: prime };
})();
