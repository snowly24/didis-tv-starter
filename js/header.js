/* =========================================================
   Header (Shelf + Player views)
   var header = Header.create({ onLogo: function () { … } });
   document.body.prepend(header.el);
   header.setStatus("pause");   // play | pause | ff | rew | stop
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;

  function create(opts) {
    opts = opts || {};
    var el = document.createElement("header");
    el.className = "site-header";

    /* Left: mini TV logo */
    var logo = document.createElement("button");
    logo.type = "button";
    logo.className = "site-header__logo";
    logo.setAttribute("aria-label", CFG.ui.allTapes);
    var mini = TV.create({ size: "mini" });
    var heart = Icons.el("heart", "tv-msg__heart");
    mini.showMessage(heart);
    logo.appendChild(mini.el);
    logo.addEventListener("click", function () { if (opts.onLogo) opts.onLogo(); });

    /* Center: title, ribbon, underline */
    var title = document.createElement("div");
    title.className = "site-header__title";
    var h1 = document.createElement("h1");
    h1.className = "site-header__name";
    h1.textContent = CFG.site.title;
    h1.appendChild(Icons.el("heart", "site-header__heart"));
    var since = document.createElement("span");
    since.className = "site-header__since";
    since.textContent = CFG.site.since;
    title.appendChild(h1);
    title.appendChild(Icons.el("underline", "site-header__underline"));
    title.appendChild(since);

    /* Right: sound toggle + VCR display chip */
    var right = document.createElement("div");
    right.className = "site-header__right";

    var sound = document.createElement("button");
    sound.type = "button";
    sound.className = "sound-toggle";
    sound.setAttribute("data-sfx", "none");   // Sound.toggle() clicks when turning on
    function paintSound(on) {
      sound.replaceChildren(Icons.el(on ? "sound-on" : "sound-off"));
      sound.setAttribute("aria-pressed", on ? "true" : "false");
      sound.setAttribute("aria-label", on ? CFG.ui.soundOn : CFG.ui.soundOff);
    }
    paintSound(Sound.isOn());
    Sound.onChange(paintSound);
    sound.addEventListener("click", function () { Sound.toggle(); });

    var chip = document.createElement("div");
    chip.className = "vcr-chip";
    chip.setAttribute("aria-hidden", "true");
    var inner = document.createElement("div");
    inner.className = "vcr-chip__inner osd-text";
    var mode = document.createElement("span");
    mode.className = "vcr-chip__mode";
    var speed = document.createElement("span");
    speed.className = "vcr-chip__speed";
    speed.textContent = CFG.osd.speed;
    inner.appendChild(mode);
    inner.appendChild(speed);
    chip.appendChild(inner);

    right.appendChild(sound);
    right.appendChild(chip);

    el.appendChild(logo);
    el.appendChild(title);
    el.appendChild(right);

    function setStatus(kind) {
      mode.replaceChildren(TV.osdLabel(kind));
      chip.setAttribute("data-status", kind);
    }
    setStatus("play");

    /* Subtle tracking glitch every ~15 s */
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      setInterval(function () {
        chip.classList.add("is-glitching");
        setTimeout(function () { chip.classList.remove("is-glitching"); }, 450);
      }, 15000);
    }

    return { el: el, setStatus: setStatus, miniTV: mini };
  }

  window.Header = { create: create };
})();
