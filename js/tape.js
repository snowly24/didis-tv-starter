/* =========================================================
   VHS tape spine — shared by the Shelf and the Player.
   var t = Tape.create(tapeConfig);  → { el (a <button>), fit() }
   Label look comes from tapeConfig.labelStyle (css/labels.css),
   plastic color from tapeConfig.shell.
   Tape.isWatched(id) / Tape.markWatched(id) use localStorage.
   ========================================================= */
(function () {
  var CFG = window.DIDI_CONFIG;
  var WATCHED_KEY = "didis-tv-watched";
  var MIN_TITLE_PX = 18;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name, className) { return Icons.el(name, className); }

  /* ---------- Watched tapes ---------- */
  function readWatched() {
    try { return JSON.parse(localStorage.getItem(WATCHED_KEY)) || []; } catch (e) { return []; }
  }
  function isWatched(id) { return readWatched().indexOf(id) !== -1; }
  function markWatched(id) {
    var list = readWatched();
    if (list.indexOf(id) === -1) list.push(id);
    try { localStorage.setItem(WATCHED_KEY, JSON.stringify(list)); } catch (e) { /* fine */ }
  }

  /* A made-up catalog number, the same on every visit */
  function catalog(id) { return (17 + id * 7) + "-" + String(30000 + id * 4817).slice(-5); }

  /* ---------- Decorations per label style ---------- */
  var DECOR = {
    "butter-hearts": function (d) {
      d.appendChild(icon("heart-sticker", "deco-heart deco-heart--1"));
      d.appendChild(icon("heart-sticker", "deco-heart deco-heart--2"));
      d.appendChild(icon("heart-sticker", "deco-heart deco-heart--3"));
    },
    "blush-bow": function (d) {
      d.appendChild(el("span", "deco-pearls"));
      d.appendChild(el("span", "deco-lace"));
    },
    "cherry-sparkle": function (d, tape) {
      d.appendChild(icon("sparkle", "deco-sparkle deco-sparkle--1"));
      d.appendChild(icon("sparkle", "deco-sparkle deco-sparkle--2"));
      d.appendChild(icon("sparkle", "deco-sparkle deco-sparkle--3"));
      var panel = el("span", "deco-panel");
      panel.appendChild(el("span", "deco-panel__stereo", CFG.shelf.stereo));
      panel.appendChild(el("span", "deco-panel__cat", catalog(tape.id)));
      d.appendChild(panel);
    },
    "paper-washi": function (d) {
      d.appendChild(el("span", "washi deco-washi"));
      d.appendChild(icon("doodle-star", "deco-star"));
    },
    "sunset-stripes": function (d) {
      d.appendChild(el("span", "deco-sun"));
    },
    "sage-flower": function (d) {
      d.appendChild(icon("wobble-rect", "deco-border"));
      d.appendChild(icon("flower", "deco-flower"));
    },
    "gingham-stitch": function () {
      /* cherries sit in the label row next to the year — added below */
    }
  };

  function create(tape) {
    var btn = el("button", "tape tape--" + (tape.shell || "cocoa") + " label--" + tape.labelStyle);
    btn.type = "button";
    btn.setAttribute("data-id", tape.id);
    btn.setAttribute("aria-label", tape.title + " — " + CFG.shelf.from + " " + tape.from);

    var shell = el("span", "tape__shell");
    shell.setAttribute("aria-hidden", "true");
    shell.appendChild(el("span", "tape__code", tape.code));

    var label = el("span", "tape__label");
    var deco = el("span", "tape__deco");
    if (DECOR[tape.labelStyle]) DECOR[tape.labelStyle](deco, tape);

    var text = el("span", "tape__text");
    var title = el("span", "tape__title", tape.title);
    var from = el("span", "tape__from");
    from.textContent = CFG.shelf.from + " " + tape.from + " ";
    from.appendChild(icon("heart", "tape__from-heart"));
    text.appendChild(title);
    text.appendChild(from);

    label.appendChild(deco);
    label.appendChild(text);
    if (tape.labelStyle === "gingham-stitch") label.appendChild(icon("cherries", "deco-cherries"));
    label.appendChild(el("span", "tape__year", tape.year));
    shell.appendChild(label);

    /* Bow sits over the label's left end (blush-bow only) */
    if (tape.labelStyle === "blush-bow") shell.appendChild(icon("bow", "deco-bow"));

    /* Hover tag: "from [Friend] ♡" peeking out on the right */
    var tag = el("span", "tape__tag");
    tag.setAttribute("aria-hidden", "true");
    tag.textContent = CFG.shelf.from + " " + tape.from + " ";
    tag.appendChild(icon("heart", "tape__tag-heart"));

    /* Watched sticker */
    var watched = el("span", "tape__watched");
    watched.setAttribute("aria-hidden", "true");
    watched.textContent = CFG.shelf.watched + " ";
    watched.appendChild(icon("heart", "tape__watched-heart"));

    btn.appendChild(tag);
    btn.appendChild(shell);
    btn.appendChild(watched);

    function refreshWatched() { btn.classList.toggle("is-watched", isWatched(tape.id)); }
    refreshWatched();

    /* Shrink a long title until it fits (never below 18px) */
    function fit() {
      title.style.fontSize = "";
      var size = parseFloat(getComputedStyle(title).fontSize);
      var guard = 40;
      while (title.scrollWidth > title.clientWidth + 1 && size > MIN_TITLE_PX && guard--) {
        size = Math.max(MIN_TITLE_PX, size - 1);
        title.style.fontSize = size + "px";
      }
    }

    return { el: btn, fit: fit, refreshWatched: refreshWatched, tape: tape };
  }

  window.Tape = { create: create, isWatched: isWatched, markWatched: markWatched, readWatched: readWatched };
})();
