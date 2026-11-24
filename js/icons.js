/* =========================================================
   SVG sprite: every drawing the site reuses (bow, hearts,
   sparkles, VCR icons …). Injected once into the page so it
   works on file:// and on hosting. Colors use CSS variables,
   so a drawing can be recolored from CSS.
   Use:  Icons.el("heart", "my-class")  → <svg><use …></svg>
   ========================================================= */
(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

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
