# Didi's TV — Project Brief

A birthday website for my friend Didi. The visitor unlocks an old TV with a password, picks a VHS tape from a stack, and watches a birthday-wish video from a friend playing "inside" the TV.

Placeholders in `[BRACKETS]` are things I'll fill in later. Build with placeholders until then.

---

## 0. How to work on this (read first)

- Read this whole brief and look at every image in `references/` before writing any code.
- Before building, reply with: (1) your plan — file structure, how you'll build the TV and the tapes, and the 6 tape label designs you propose; (2) any questions, or anything in this brief that's unclear or conflicting. Wait for my answers.
- Build in the phases in section 12. **Stop after each phase** so I can check it in the browser. Don't skip ahead.
- All content (tape titles, friend names, colors, video files, password, texts) comes from **one config file**, `js/config.js`, so I can change content without touching layout code.
- The videos come last. Until then, use placeholder videos (section 9).
- Keep it simple: plain HTML, CSS and JavaScript. No framework, no build step, no npm packages. Ask me before adding any external library.
- Use git and commit after each phase with a clear message. `references/` and `.DS_Store` are in `.gitignore`: the reference images are other people's work and must never be published.
- When I report a bug or ask for a change, change only that thing. Don't redesign other parts unless I ask.

## 1. Tech requirements

- **One `index.html`, a single-page app with views** (Lock, Shelf, Player, optional Credits) switched by JavaScript, not separate HTML files. Reason: browsers only let video play with sound after a click on the same page. One page keeps the "power on" click valid so tapes can start with sound, and lets views change with TV-style transitions.
- **Hash routing:** `#/` (lock), `#/shelf`, `#/tape/1` … `#/tape/7`, `#/credits`. Browser back/forward must work. If someone opens `#/shelf` or a tape link while still locked, show the lock screen first, then take them where they were going.
- Must work both by double-clicking `index.html` (file://) and on static hosting (Netlify / GitHub Pages / Vercel). So: classic `<script>` tags, no ES module imports, no `fetch()` of local JSON.
- Folder structure (adjust if you have a good reason, tell me why):
  ```
  index.html
  css/        base.css, app.css (view shell, flash, particles), tv.css, header.css,
              labels.css, lock.css, shelf.css, player.css
  js/         config.js, app.js (router), lock.js, shelf.js, tv.js, tape.js, header.js, player.js,
              effects.js, sound.js, icons.js (SVG sprite), sha256.js (file:// fallback)
  assets/     favicon (all other drawings are SVG symbols in js/icons.js)
  videos/     tape-1.mp4 … tape-7.mp4 + tape-1.jpg … (posters)
  tools/      hash-password.html (section 8), tv-test.html (Phase 1 test page),
              make-placeholders.html (section 9)
  references/ inspiration only — never linked from the site, not in git
  ```
  Why the extras: the tape spine (`tape.js`, `labels.css`) is shared by the Shelf and the Player's side tapes; `icons.js` puts every SVG drawing on the page as a reusable symbol, which works on file://; `sha256.js` is a small hand-written hash in case a browser blocks built-in hashing on file://; each view gets its own file (`lock.js`, later `shelf.js`, `player.js`) so `app.js` stays a short router.
- Google Fonts are fine. Everything else local.
- Build the TV, tapes, bows, washi tape, stickers and notes with **CSS/SVG wherever possible** (sharp at any size, easy to recolor), not raster images.
- Animate only `transform` and `opacity` so everything stays smooth (60 fps).
- Target browsers: latest Chrome, Safari (including iPhone), Firefox, Edge.

## 2. Visual direction

**Mood:** a cosy, sunlit girl's bedroom in the early 2000s: VHS tapes, a little retro TV, love notes taped to things. Bright and warm, never dusty or grey. Pink leads, but it's not the only color.

Three styles mixed together:
- **Coquette** (main): bows, ribbons, lace and scalloped edges, hearts, pearls, love-letter notes, dainty serif type. Delicate, girly, nostalgic.
- **Scrapbook:** paper textures, washi tape, torn paper edges, handwritten notes, stickers, polaroid frames, slightly layered and overlapping pieces. Personal and sentimental.
- **Wabi Sabi** (as a seasoning): nothing perfectly straight. Tapes offset a few px and rotated ±1–2°, slightly uneven hand-drawn lines, paper grain, soft natural shadows. Calm, with lots of breathing room.

Plus **VHS / CRT nostalgia** for everything TV-related: scanlines, screen glow, chromatic aberration, on-screen display (OSD) text, static noise.

### Palette (CSS variables)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFF6EA` | page background (with subtle paper grain) |
| `--cream` | `#F8EBD3` | labels, notes, TV bezel |
| `--blush` | `#F7C6CE` | main pink (TV body, labels) |
| `--rose` | `#EC7F94` | accents, hover, focus |
| `--cherry` | `#D63A55` | strong accents: hearts, bows |
| `--butter` | `#FBDF7E` | labels, highlights, notes |
| `--peach` | `#FFB38A` | labels, warm glow |
| `--tangerine` | `#F47C3C` | small pops: knob, LED, buttons |
| `--sage` | `#BFCBA8` | one tape + small leaf details, for balance |
| `--cocoa` | `#3E2725` | text and tape plastic (warm near-black, never pure `#000`) |
| `--crt-blue` | `#2F4BD8` | standby/no-signal screen |
| `--osd` | `#FFFFFF` | OSD text, with cyan `#5CF2E8` / magenta `#FF4F9A` color split |

### Typography

- **Handwritten** (tape titles, notes, buttons): e.g. Caveat, Homemade Apple, Reenie Beanie. Pick 1–2.
- **Dainty serif** (site title, TV messages): e.g. Playfair Display italic, Cormorant Garamond, DM Serif Display.
- **VHS OSD** (PLAY ► SP, counters, TV status text): VT323.
- Tape labels can each use a different display font for variety (e.g. Shrikhand, Bagel Fat One, Special Elite, Monoton). **Max ~7 font families in total.** Use `font-display: swap` with sensible fallbacks.

### References (`references/`)

Use these for style and layout ideas only. **Don't copy any text, titles, logos or brand names from them** (no movie titles, band/artist names, record labels, etc.).

| File | What to take from it |
|---|---|
| `01-play-sp-osd.png` | The top-right "PLAY ▸ / SP" text: white VHS OSD font, cyan/red color split, slight blur and glow, scanline texture. |
| `02-vhs-spines-stack.png` | **Main layout for the tape stack:** spines lying flat, stacked vertically, each slightly offset left/right; label with handwritten title, year on the right, tape code (T-180 / E-240) on the left. |
| `03-cassette-stack-handmade.png` | Every label hand-made and different; imperfect, organic stacking. |
| `04-book-spines.png` | How different each spine can be (color, type, layout) while still feeling like one set. |
| `05-pink-cassette-labels.png` | Color direction and label variety: pinks, catalog numbers, "STEREO", sparkles, stripes, decorative lines. |
| `06-blue-crt-tv.png` | Blue CRT screen with glowing white text, for the TV's standby / no-signal state. |
| `07-crt-tv-message.png` | Elegant serif text on a cream CRT screen with a thin frame, for the password screen and TV messages. Also the orange knob. |
| `08-pink-tv.png` | **The TV itself:** rounded pastel-pink retro TV, speaker grille on the left, knob and small dots on the right. Base our TV on this shape. |

## 3. Shared components

### 3.1 The TV (one component, three sizes)

- Built once (HTML/CSS/SVG) and reused: **big** on the Lock view, **mini** as the header logo, **large** on the Player view.
- Shape based on `08-pink-tv.png`: chunky rounded body in blush pink with soft shading, cream bezel, rounded CRT screen with a subtle bulge (inner shadow + glass highlight), speaker grille on the left, tangerine knob and small round buttons on the right, little feet. Coquette touch: a small bow on top. (No heart sticker on the TV.)
- The screen always keeps a **4:3** ratio.
- Screen layers, bottom to top: content (video / text / static) → scanlines → vignette + glass glare → OSD text. Overlays use `pointer-events: none`. Overlays stay subtle: faces in videos must remain clearly visible.
- Screen states: **off** (dark glass with reflection), **standby** (blue screen, ref 06), **static** (animated noise), **message** (cream screen with serif text, ref 07), **on** (video).
- Animations: **power on** (thin white line expands to full screen, flash, content fades in), **power off** (content collapses to a line, then a dot), **channel change** (0.4–0.6 s static + VHS tracking lines).

### 3.2 Header (Shelf and Player views)

- Light, not a heavy nav bar: transparent over the paper background, maybe a thin hand-drawn underline or a washi-tape strip.
- **Left:** mini TV logo (~48–56 px). Click → Shelf. Small wiggle on hover. `aria-label="All tapes"`.
- **Center:** "Didi's TV" in the dainty serif, with "since 2001" smaller, in handwriting or on a tiny ribbon banner. A small bow or heart detail.
- **Right:** "PLAY ▸" with "SP" underneath, as in ref 01: VT323, white with cyan/magenta color split and soft glow. Because white won't read on cream paper, put it inside a small dark rounded "VCR display" chip with faint scanlines. A subtle tracking glitch every ~15 s.
  - On the Player view it mirrors the player state: `PLAY ▸`, `PAUSE ❚❚`, `FF ▸▸`, `REW ◂◂`, `STOP ■`.
- A small sound on/off toggle (speaker icon) near the right side.

## 4. View 1 — Lock (`#/`)

- Full viewport. Centered: the big TV sitting on a **VCR / tape player** with a tape slot in the middle, a small LED (red when locked) and a blinking `--:--` clock. They stand on a soft surface (e.g. a lace doily or a cream shelf edge).
- Paper background with a few scrapbook bits at the edges (a polaroid frame, a heart sticker, a pressed flower). Sparse: the TV is the focus.
- Small handwritten line above the TV: `[a little something for Didi ♡]` (config). Near the TV: "press power" with a hand-drawn arrow pointing to the power button.
- The screen starts in **standby** (blue, ref 06) with OSD text like `CH 03 — LOCKED`.
- The tangerine knob is the power button ("press power" arrow points to it). Clicking the power button, the tape slot or the screen → the **password screen appears on the TV** (ref 07 style): cream screen, serif "enter the password to power on", an input styled like OSD/typewriter text with a blinking underline cursor, and a "▸ PLAY" button. A small "need a hint?" link shows `[HINT]`.
- **Correct password:** heart/confetti burst → screen shows `[Signal found ♡ Welcome, Didi]` for ~1.5 s → a tape slides into the VCR slot (clunk sound), LED turns green → the screen zooms up to fill the whole window ("going into the TV"), flashes, and the Shelf fades in.
- **Wrong password:** TV shakes slightly, screen flashes static + `NO SIGNAL` in OSD font, input clears. After 3 wrong tries, show the hint automatically.
- Enter submits. Input auto-focuses when shown. Compare case-insensitively, ignoring spaces, dots, slashes and dashes (so `15122001`, `15.12.2001`, `15/12/2001` and `15-12-2001` all work). The stored hash is of the password in that same cleaned-up form; `tools/hash-password.html` cleans it the same way.
- Save the unlocked state in `sessionStorage`, so a refresh in the same tab doesn't lock again.
- Store the password as a **SHA-256 hash** in config, not plain text. (This is a cute gate, not real security, and that's fine.)

## 5. View 2 — Shelf (`#/shelf`)

- Header (3.2).
- **Floating note** with `[happy birthday sunshine]` (config): a scrapbook note card (butter or cream paper, torn or scalloped edge, washi tape on top, small sun or heart doodle), handwritten font, slightly rotated, gently bobbing and swaying (~6 s loop). Above the stack, never covering it. Clicking it pops a few hearts.
- **The stack:** 7 tapes as spines lying flat, stacked vertically and centered, like ref 02. Each tape:
  - Plastic shell color: mostly cocoa; 1–2 can be translucent pink or cream plastic.
  - **Its own label design:** different color, font, decoration and layout. Title readable at a glance. Year on the right, small tape code on the left (e.g. T-120, E-180, SP). Optional extras: "STEREO", a catalog number, sparkles, a bow, hearts, stripes.
  - Small fixed offset (±10–20 px horizontal, ±1° rotation) taken from config, so it looks hand-stacked but identical on every visit.
  - The seven together must feel like one collection.
- **Idle:** each tape floats 3–6 px, with a tiny tilt, on its own rhythm (~3–4 s, staggered, not in sync). Clearly visible, but calm.
- **Hover (desktop):** the tape slides out ~20 px, lifts (`translateY(-4px)`, bigger soft shadow), straightens to 0°, and a small handwritten tag or sticker peeks out: "from `[Friend]` ♡". The other tapes dim slightly. Springy 200–300 ms ease-out. Optional: slight 3D tilt following the mouse (max ~5°).
- **Click:** the tape slides out of the stack → channel-change static → Player for that tape.
- Tapes are real `<button>`s: keyboard focus looks like hover, and Enter opens.
- Tapes already watched get a small "watched ♡" sticker (saved in `localStorage`).
- Small handwritten hint near the stack: "pick a tape" with an arrow.

## 6. View 3 — Player (`#/tape/N`)

Desktop layout:

```
                  [◂ back]                         [next tape ▸]
  [prev tape]   [            BIG TV — video plays here           ]   [next tape]
                [   ◂◂   ▸/❚❚   ▸▸   ──●────────  00:42 / 02:10  🔊  ⛶   ]
                         "[Tape title]" · from [Friend] ♡
```

- Header (3.2).
- **The TV is the hero:** about 60–70% of the viewport width on desktop, capped so the whole TV plus controls fits on screen without scrolling.
- The video plays **inside the TV screen** with the overlays on top, so it really looks like it's coming from the TV.
- **On entering a tape:** ~0.5 s static → OSD `PLAY ▸` in the top-left of the screen for 2 s (like a real VCR) → the video starts with sound. If the browser blocks sound, start muted and show a big OSD button "tap for sound".
- **Controls** under the screen, styled like chunky VCR buttons (cream/pink, pressed state): rewind 10 s, play/pause, forward 10 s, draggable progress bar, time in VT323, volume/mute, fullscreen (fullscreen shows the video, not the whole page).
- Clicking the screen toggles play/pause. Keyboard: Space = play/pause, ← / → = −/+10 s, M = mute, F = fullscreen.
- **OSD feedback** in the screen corner for every action (`PLAY ▸`, `PAUSE ❚❚`, `REW ◂◂`, `FF ▸▸`), fading after ~1.5 s. The header chip mirrors it.
- **Side tapes:** the previous tape on the left, the next on the right, as smaller versions of their shelf design (standing at a slight angle, floating). Hover: lift and show the title. Click: go to that tape.
- **Above the TV:** "◂ prev tape" on the left (previous tape) and "next tape ▸" on the right, styled as handwritten stickers or washi-tape labels. **Wrap around** (tape 7 → next → tape 1; tape 1 → prev → tape 7).
- **Switching tapes:** pause the current video → channel-change transition → load and play the new one. Update the URL.
- **When a video ends:** OSD `STOP ■`, then a card on the screen: "next tape: `[title]` ▸" with a 5 s countdown that plays the next tape (with a cancel button). When every tape has been watched, offer the Credits view instead.
- Under the TV: tape title and "from `[Friend]` ♡" in handwriting, plus an optional short written message from config.
- The header's mini TV logo → Shelf (the video stops).

## 7. View 4 — Credits (`#/credits`, optional, build last)

- The big TV shows movie-style rolling end credits: "Starring Didi", "with love from" + every friend's name, "Produced by `[my name]`", ending with "happy birthday, sunshine ♡".
- Reachable after all tapes are watched, and from a small "the end" sticker on the Shelf.
- Then a "⟲ rewind" button back to the Shelf.

## 8. Config (`js/config.js`)

Something like this (improve the shape if useful, but keep it easy for a non-developer to edit, with comments):

```js
window.DIDI_CONFIG = {
  site: {
    title: "Didi's TV",
    since: "since 2001",
    lockLine: "[a little something for Didi ♡]",
    floatingNote: "[happy birthday sunshine]",
    passwordHash: "[sha-256 of the lowercase password]",
    passwordHint: "[HINT]",
    welcomeMessage: "[Signal found ♡ Welcome, Didi]",
    creditsFrom: "[my name]"
  },
  tapes: [
    {
      id: 1,
      title: "[Tape title]",
      from: "[Friend name]",
      year: "[2016]",                    // the year this friend met Didi
      code: "T-120",
      video: "videos/tape-1.mp4",
      poster: "videos/tape-1.jpg",
      message: "",                       // optional short note under the TV
      labelStyle: "butter-hearts",        // one of the 7 label designs
      shell: "cocoa",                     // cocoa | pink-clear | cream
      stack: { offsetX: -12, rotate: -1 } // hand-stacked look
    }
    // … tapes 2–6
  ]
};
```

- Also make `tools/hash-password.html`: a tiny page where I type a password and get the hash to paste into config.

**Starting ideas for the label designs** (propose your own improvements). There are 7 tapes; the 7th label is `gingham-stitch`: peach/rose gingham, a cream name plate with dashed rose stitching, upright serif title, a cherry doodle.
1. **Butter yellow**, big handwritten title, little red heart stickers. Classic.
2. **Blush pink** with a satin bow on the left end and a scalloped lace edge. Coquette.
3. **Cherry red** with cream retro bubble type and tiny sparkles. Bold.
4. **Cream lined paper** with a typewriter title, washi tape across it and a doodle. Scrapbook.
5. **Peach → tangerine sunset stripes** with chunky 70s type. Warm pop.
6. **Sage** with a linen texture, stamped serif type and a pressed flower. Wabi sabi.

## 9. Videos

- Until the real videos arrive, use **7 placeholder MP4s** (10–15 s each: color bars or a test card with the tape number and a soft tone). **Make one of them portrait (9:16)** so we can test phone-shot videos. ffmpeg isn't installed, so they're made by `tools/make-placeholders.html`, which draws the test cards in the browser and saves them as MP4s (one click per file).
- Real videos: MP4 (H.264 + AAC), 720p, ideally under ~25 MB each. Give me the exact ffmpeg (or HandBrake) settings to compress my files.
- **Never crop faces:** the video fits fully inside the 4:3 screen.
  - Landscape videos: black letterbox bars (looks authentic on a CRT).
  - Portrait phone videos: centered, with a blurred and zoomed copy (the poster image is fine) filling the sides.
  - Detect orientation automatically from the video's dimensions.
- Use `playsinline` and `preload="metadata"`. Load only the current tape's video, never all seven at once.

## 10. Effects and playful details

Tasteful and smooth. Quality over quantity.

- Subtle paper-grain texture on the page (SVG noise).
- Tiny hearts or sparkles bursting from clicks on interactive elements.
- **Sound effects made with the Web Audio API** (no audio files): TV power click + soft hum, static hiss on transitions, tape-insert clunk, soft button clicks. Sound is on from the first click (including on the Lock view) unless it was muted on an earlier visit; the header toggle mutes it, and the setting is saved in `localStorage`. Sound effects never play over a video.
- Heart/confetti burst on unlock (write it yourself, no library).
- Floating note, idle-floating tapes, occasional OSD glitch.
- Optional easter egg: click the bow on top of the TV 5 times → it rains hearts.
- Respect `prefers-reduced-motion`: no floating, shaking or glitches, just simple fades.

## 11. Responsive and accessibility

- Must look great on: **iPhone portrait (375–430 px wide), which is probably how Didi will open it**, tablet, laptop (1280–1440 px) and large desktop (1920 px).
- **Mobile:**
  - Lock: TV + VCR scaled to fit the width, no horizontal scroll. The on-screen keyboard must not hide the password input.
  - Shelf: tapes ~92% of the width, titles still readable (min ~18 px), friend name always visible (no hover on touch). One tap opens a tape.
  - Player: TV full width at the top, controls below it, then the previous/next tapes side by side below that. Back/next buttons stay above the TV. Nice to have: swipe left/right on the screen to change tapes.
- Touch targets at least 44 px.
- Everything clickable is a real `<button>` or link with an `aria-label` where needed. Visible focus style (e.g. a dashed rose outline like stitching).
- Decorative SVGs are `aria-hidden`. Text on labels has readable contrast.

## 12. Build phases (stop after each one)

1. **Foundation:** palette variables, fonts, paper background, the TV component in all states and sizes, the header. Show me a simple test page with the TV in each state.
2. **Lock view:** the password flow, wrong/right animations, transition to the Shelf.
3. **Shelf view:** floating note, the 7 tapes from config, idle/hover/click effects.
4. **Player view** with placeholder videos: controls, OSD, side tapes, back/next with wrap-around, end-of-tape behavior, routing.
5. **Polish:** sounds, sparkles, transitions, reduced motion, mobile layouts (check at 375, 768 and 1440 px), optional Credits view.
6. **Real content and launch:** my videos, posters, final titles and password; compression help; deploy to Netlify (drag-and-drop) or GitHub Pages with step-by-step instructions for me.

## 13. Done when

- [ ] Wrong password gives clear feedback; correct password → animation → Shelf; refreshing in the same tab stays unlocked.
- [ ] A direct link like `#/tape/3` works (after unlocking).
- [ ] All 7 tapes look different but clearly belong together.
- [ ] Hover, float and transition effects are smooth.
- [ ] Video plays inside the TV with sound after the unlock click; all controls and keyboard shortcuts work.
- [ ] Back/next and the side tapes navigate correctly and wrap around.
- [ ] The mini TV logo returns to the Shelf and stops the video.
- [ ] Portrait and landscape videos both look good inside the TV.
- [ ] Works on iPhone Safari and desktop Chrome/Safari/Firefox; no horizontal scrolling at 375 px.
- [ ] No console errors.
- [ ] Changing content only requires editing `js/config.js` and the `videos/` folder.

## 14. Don'ts

- Don't copy text, logos or names from the reference images.
- Don't clutter. Each view has one clear focus (the TV or the tape stack); decorations stay at the edges.
- No pure black or cold greys. Keep everything warm.
- Draw icons and stickers as SVG, not emoji.
- Don't load all the videos at once.
- No external libraries without asking me first.
