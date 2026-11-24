/* =========================================================
   SVG sprite: every drawing the site reuses (bow, hearts,
   sparkles, VCR icons …). Injected once into the page so it
   works on file:// and on hosting. Colors use CSS variables,
   so a drawing can be recolored from CSS.
   Use:  Icons.el("heart", "my-class")  → <svg><use …></svg>
   ========================================================= */
(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

  /* Lace doily: scalloped edge, a ring of holes, a ring of petals */
  function doily() {
    var n = 40, r = 46, d = "", i, a, x, y;
    for (i = 0; i <= n; i++) {
      a = (i / n) * Math.PI * 2;
      x = (Math.cos(a) * r).toFixed(2);
      y = (Math.sin(a) * r).toFixed(2);
      d += i === 0 ? "M" + x + " " + y : " A3.7 3.7 0 0 1 " + x + " " + y;
    }
    var holes = "", petals = "";
    for (i = 0; i < 32; i++) {
      a = (i / 32) * Math.PI * 2;
      holes += '<circle cx="' + (Math.cos(a) * 40).toFixed(2) + '" cy="' + (Math.sin(a) * 40).toFixed(2) + '" r="1.6"/>';
    }
    for (i = 0; i < 16; i++) {
      a = (i / 16) * 360;
      petals += '<ellipse cx="0" cy="-27" rx="3.4" ry="7" transform="rotate(' + a + ')"/>';
    }
    return '<symbol id="i-doily" viewBox="-50 -50 100 100" preserveAspectRatio="none">' +
      '<path d="' + d + ' Z" style="fill:#FFFCF6" stroke="rgba(62,39,37,.12)" stroke-width=".5"/>' +
      '<g style="fill:var(--paper)" stroke="rgba(62,39,37,.1)" stroke-width=".3">' + holes + '</g>' +
      '<circle r="34" fill="none" stroke="rgba(62,39,37,.1)" stroke-width=".5" stroke-dasharray="1.2 1.4"/>' +
      '<g fill="none" stroke="rgba(62,39,37,.13)" stroke-width=".5">' + petals + '</g>' +
      '<circle r="17" fill="none" stroke="rgba(62,39,37,.1)" stroke-width=".5" stroke-dasharray="1 1.2"/>' +
    '</symbol>';
  }

  var SPRITE =
    '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' +

    /* Satin bow */
    '<symbol id="i-bow" viewBox="0 0 100 74">' +
      '<path style="fill:var(--bow-dark,#B02A45)" d="M46 36 C41 48 35 58 28 70 L37 67 L41 73 C46 60 49 48 51 38 Z"/>' +
      '<path style="fill:var(--bow-dark,#B02A45)" d="M54 36 C59 48 65 58 72 70 L63 67 L59 73 C54 60 51 48 49 38 Z"/>' +
      '<path style="fill:var(--bow,var(--cherry))" d="M50 32 C38 12 12 4 8 20 C5 34 26 42 50 35 Z"/>' +
      '<path style="fill:var(--bow,var(--cherry))" d="M50 32 C62 12 88 4 92 20 C95 34 74 42 50 35 Z"/>' +
      '<path fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2.2" stroke-linecap="round" d="M15 18 C22 12 33 15 41 25"/>' +
      '<path fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2.2" stroke-linecap="round" d="M85 18 C78 12 67 15 59 25"/>' +
      '<path fill="none" stroke="rgba(90,10,30,.28)" stroke-width="1.6" stroke-linecap="round" d="M14 30 C26 34 38 34 46 32 M86 30 C74 34 62 34 54 32"/>' +
      '<ellipse style="fill:var(--bow-dark,#B02A45)" cx="50" cy="33.5" rx="8" ry="8.5"/>' +
      '<ellipse fill="rgba(255,255,255,.35)" cx="48" cy="30.5" rx="3.2" ry="2.4"/>' +
    '</symbol>' +

    /* Heart */
    '<symbol id="i-heart" viewBox="0 0 100 92">' +
      '<path d="M50 88 C20 66 4 48 4 30 C4 16 15 6 28 6 C38 6 46 12 50 20 C54 12 62 6 72 6 C85 6 96 16 96 30 C96 48 80 66 50 88 Z"/>' +
    '</symbol>' +

    /* Heart sticker: cream border, cherry heart, shine */
    '<symbol id="i-heart-sticker" viewBox="0 0 100 92">' +
      '<path style="fill:var(--cream-light);stroke:var(--cream-light)" stroke-width="12" stroke-linejoin="round" d="M50 88 C20 66 4 48 4 30 C4 16 15 6 28 6 C38 6 46 12 50 20 C54 12 62 6 72 6 C85 6 96 16 96 30 C96 48 80 66 50 88 Z"/>' +
      '<path style="fill:var(--sticker,var(--cherry))" d="M50 82 C24 62 11 47 11 31 C11 20 19 12 29 12 C38 12 45 18 50 27 C55 18 62 12 71 12 C81 12 89 20 89 31 C89 47 76 62 50 82 Z"/>' +
      '<path fill="none" stroke="rgba(255,255,255,.6)" stroke-width="5" stroke-linecap="round" d="M23 28 C24 22 28 19 33 19"/>' +
    '</symbol>' +

    /* 4-point sparkle */
    '<symbol id="i-sparkle" viewBox="0 0 100 100">' +
      '<path d="M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0 Z"/>' +
    '</symbol>' +

    /* Hand-drawn wavy underline */
    '<symbol id="i-underline" viewBox="0 0 200 14">' +
      '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M3 8 C28 3 52 11 80 7 S132 3 160 8 S188 9 197 6"/>' +
    '</symbol>' +

    /* VCR / OSD icons (16×16) */
    '<symbol id="i-play" viewBox="0 0 16 16"><path d="M3 1.5 L14 8 L3 14.5 Z"/></symbol>' +
    '<symbol id="i-pause" viewBox="0 0 16 16"><rect x="2.5" y="2" width="4" height="12"/><rect x="9.5" y="2" width="4" height="12"/></symbol>' +
    '<symbol id="i-ff" viewBox="0 0 16 16"><path d="M1 2.5 L8 8 L1 13.5 Z M8 2.5 L15 8 L8 13.5 Z"/></symbol>' +
    '<symbol id="i-rew" viewBox="0 0 16 16"><path d="M15 2.5 L8 8 L15 13.5 Z M8 2.5 L1 8 L8 13.5 Z"/></symbol>' +
    '<symbol id="i-stop" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11"/></symbol>' +

    /* Speaker on / off (24×24) */
    '<symbol id="i-sound-on" viewBox="0 0 24 24">' +
      '<path d="M4 9.2 H7.6 L12.4 5.2 C12.9 4.8 13.6 5.1 13.6 5.8 V18.2 C13.6 18.9 12.9 19.2 12.4 18.8 L7.6 14.8 H4 C3.4 14.8 3 14.4 3 13.8 V10.2 C3 9.6 3.4 9.2 4 9.2 Z"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M16.5 9.3 C17.4 10.1 17.8 11 17.8 12 C17.8 13 17.4 13.9 16.5 14.7"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M18.9 6.8 C20.4 8.2 21.1 10 21.1 12 C21.1 14 20.4 15.8 18.9 17.2"/>' +
    '</symbol>' +
    '<symbol id="i-sound-off" viewBox="0 0 24 24">' +
      '<path d="M4 9.2 H7.6 L12.4 5.2 C12.9 4.8 13.6 5.1 13.6 5.8 V18.2 C13.6 18.9 12.9 19.2 12.4 18.8 L7.6 14.8 H4 C3.4 14.8 3 14.4 3 13.8 V10.2 C3 9.6 3.4 9.2 4 9.2 Z"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M16.6 9.4 L21.2 14.6 M21.2 9.4 L16.6 14.6"/>' +
    '</symbol>' +

    /* Pressed flower: blush petals, sage leaves */
    '<symbol id="i-flower" viewBox="0 0 60 110">' +
      '<path fill="none" style="stroke:#8E9D78" stroke-width="2" stroke-linecap="round" d="M31 108 C29 90 33 72 30 52 C29 44 30 38 30 34"/>' +
      '<path style="fill:var(--sage)" d="M30 80 C18 76 9 66 8 56 C19 58 27 66 30 80 Z"/>' +
      '<path style="fill:var(--sage)" d="M31 66 C42 62 50 52 52 42 C41 45 33 53 31 66 Z"/>' +
      '<path fill="none" stroke="rgba(90,105,70,.45)" stroke-width=".8" d="M29 78 C22 72 15 64 11 58 M32 64 C39 58 45 51 49 45"/>' +
      '<g style="fill:var(--blush)" stroke="rgba(214,58,85,.35)" stroke-width=".7">' +
        '<ellipse cx="30" cy="16" rx="7" ry="10"/>' +
        '<ellipse cx="30" cy="16" rx="7" ry="10" transform="rotate(72 30 26)"/>' +
        '<ellipse cx="30" cy="16" rx="7" ry="10" transform="rotate(144 30 26)"/>' +
        '<ellipse cx="30" cy="16" rx="7" ry="10" transform="rotate(216 30 26)"/>' +
        '<ellipse cx="30" cy="16" rx="7" ry="10" transform="rotate(288 30 26)"/>' +
      '</g>' +
      '<circle cx="30" cy="26" r="5" style="fill:var(--butter)" stroke="rgba(180,120,40,.4)" stroke-width=".7"/>' +
    '</symbol>' +

    /* Hand-drawn arrow, pointing left-down (flip with CSS for other directions) */
    '<symbol id="i-arrow" viewBox="0 0 90 60">' +
      '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M86 6 C66 2 40 8 26 24 C18 33 14 42 13 52"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M4 41 C8 45 11 49 13 55 C17 50 21 46 27 43"/>' +
    '</symbol>' +

    /* Tall hooked arrow: comes up from below, curls left at the top */
    '<symbol id="i-arrow-hook" viewBox="0 0 40 130" preserveAspectRatio="none">' +
      '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="M24 128 C31 100 36 62 33 34 C31 20 24 13 10 11"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="M17 3 C14 6 11 8 8 11 C12 13 15 16 17 20"/>' +
    '</symbol>' +

    doily() +

    '</svg>';

  function inject() {
    if (document.getElementById("didi-sprite")) return;
    var holder = document.createElement("div");
    holder.id = "didi-sprite";
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder, document.body.firstChild);
  }

  /* Returns an <svg class="icon …"><use href="#i-name"/></svg> element */
  function el(name, className) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);

  window.Icons = { el: el, inject: inject };
})();
