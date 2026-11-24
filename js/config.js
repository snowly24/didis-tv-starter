/*
  ===========================================================
   DIDI'S TV — ALL THE CONTENT LIVES HERE
  ===========================================================
   You can change any text between the "quotes" below.
   Rules so nothing breaks:
     • keep the quotes "…" around every text
     • keep the comma at the end of each line
     • to use a quote inside a text, write \" (e.g. "she said \"hi\"")
   Things in [BRACKETS] are placeholders to replace later.
*/

window.DIDI_CONFIG = {

  /* ---------- The whole site ---------- */
  site: {
    title: "Didi's TV",
    since: "since 2001",
    lockLine: "[a little something for Didi ♡]",
    floatingNote: "[happy birthday sunshine]",
    // Make this with tools/hash-password.html, then paste the result here.
    passwordHash: "[sha-256 of the lowercase password]",
    passwordHint: "[HINT]",
    welcomeMessage: "[Signal found ♡ Welcome, Didi]",
    creditsFrom: "[my name]"
  },

  /* ---------- Words shown on the TV and the Lock screen ---------- */
  lock: {
    standbyText: "CH 03 — LOCKED",
    passwordPrompt: "enter the password to power on",
    playButton: "PLAY",
    hintLink: "need a hint?",
    noSignal: "NO SIGNAL",
    pressPower: "press power"
  },

  /* ---------- VCR on-screen display words (the "PLAY ▸" text) ---------- */
  osd: {
    play: "PLAY",
    pause: "PAUSE",
    ff: "FF",
    rew: "REW",
    stop: "STOP",
    speed: "SP"
  },

  /* ---------- Labels read aloud by screen readers ---------- */
  ui: {
    allTapes: "All tapes",
    power: "Power",
    soundOn: "Sound is on — turn off",
    soundOff: "Sound is off — turn on"
  },

  /* ---------- The 6 tapes, top of the stack first ----------
     title     : big text on the label
     from      : the friend who made the video
     year      : the year this friend met Didi
     code      : small tape code on the left (T-120, E-180, SP …)
     video     : the video file in the videos/ folder
     poster    : a still image from the video (optional)
     message   : optional short note shown under the TV
     labelStyle: which of the 6 label designs to use:
                 butter-hearts | blush-bow | cherry-sparkle |
                 paper-washi | sunset-stripes | sage-flower
     shell     : tape plastic color: cocoa | pink-clear | cream
     stack     : how the tape sits in the stack
                 offsetX = pixels left (−) or right (+), rotate = degrees
  */
  tapes: [
    {
      id: 1,
      title: "[Tape title 1]",
      from: "[Friend name 1]",
      year: "[2016]",
      code: "T-120",
      video: "videos/tape-1.mp4",
      poster: "videos/tape-1.jpg",
      message: "",
      labelStyle: "butter-hearts",
      shell: "cocoa",
      stack: { offsetX: -12, rotate: -1 }
    },
    {
      id: 2,
      title: "[Tape title 2]",
      from: "[Friend name 2]",
      year: "[2018]",
      code: "E-240",
      video: "videos/tape-2.mp4",
      poster: "videos/tape-2.jpg",
      message: "",
      labelStyle: "blush-bow",
      shell: "pink-clear",
      stack: { offsetX: 14, rotate: 0.8 }
    },
    {
      id: 3,
      title: "[Tape title 3]",
      from: "[Friend name 3]",
      year: "[2012]",
      code: "T-180",
      video: "videos/tape-3.mp4",
      poster: "videos/tape-3.jpg",
      message: "",
      labelStyle: "cherry-sparkle",
      shell: "cocoa",
      stack: { offsetX: -6, rotate: 0.5 }
    },
    {
      id: 4,
      title: "[Tape title 4]",
      from: "[Friend name 4]",
      year: "[2019]",
      code: "SP",
      video: "videos/tape-4.mp4",
      poster: "videos/tape-4.jpg",
      message: "",
      labelStyle: "paper-washi",
      shell: "cream",
      stack: { offsetX: 18, rotate: -0.6 }
    },
    {
      id: 5,
      title: "[Tape title 5]",
      from: "[Friend name 5]",
      year: "[2015]",
      code: "T-160",
      video: "videos/tape-5.mp4",
      poster: "videos/tape-5.jpg",
      message: "",
      labelStyle: "sunset-stripes",
      shell: "cocoa",
      stack: { offsetX: -16, rotate: 1 }
    },
    {
      id: 6,
      title: "[Tape title 6]",
      from: "[Friend name 6]",
      year: "[2021]",
      code: "E-180",
      video: "videos/tape-6.mp4",
      poster: "videos/tape-6.jpg",
      message: "",
      labelStyle: "sage-flower",
      shell: "cocoa",
      stack: { offsetX: 8, rotate: -0.8 }
    }
  ]
};
