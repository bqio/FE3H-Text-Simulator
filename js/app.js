const GLYPH_W = 48;
const GLYPH_H = 52;
const GLYPH_MARGIN = 2;
const SPACE_SIZE = 15;
const NAME_POS_X_START = 100;
const NAME_POS_X_END = 495;
const NAME_POS_Y = 222;
const TEXT_POS_X = 305;
const TEXT_POS_Y = 305;
const MAX_TEXT_ROW = 3;
const DEBUG = false;

new Vue({
  el: "#app",
  data: {
    portraits: {},
    glyphs: {},
    resources: {},
    name: null,
    portrait: null,
    emotion: null,
    text: null,
    name_error: null,
    text_error: null,
    canvas: null,
    ctx: null,
    loading: true,
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // Loading meta data
      log("Loading meta data...");
      this.portraits = await (await fetch("data\\portrait_meta.json")).json();
      this.glyphs = await (await fetch("data\\glyph_meta.json")).json();
      log("Done.");

      // Initialize canvas and context
      log("Initialize canvas and context...");
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");
      log("Done.");

      // Loading resources
      log("Loading resources...");
      this.resources.textBox = await loadImage("img/textbox.png");
      this.resources.fontColored = await loadImage("img/fc.png");
      this.resources.font = await loadImage("img/f.png");
      this.resources.fontMask = await loadImage("img/mask.png");
      this.resources.portrait = await loadImage("img/portraits/Anna/0.png");
      log("Done.");

      // Set default values
      log("Set default values...");
      this.portrait = this.name = "Anna";
      this.emotion = 0;
      this.text = "Hello, friend!\nHow are you?";
      log("Done.");

      // Running render
      this.render();
    },
    render() {
      this.loading = true;
      log("Rendering...");

      // Clear canvas
      log("Clearing canvas...");
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      log("Done.");

      // Drawing all elements
      log("Drawing...");
      this.ctx.drawImage(this.resources.textBox, 0, 0);
      this.drawName(this.name);
      this.drawText(this.text);
      this.drawPortrait(this.resources.portrait);
      log("Done.");

      this.loading = false;
      log("=========================================");
    },
    rowLimit(e) {
      if (e.code == "Enter") {
        if (this.text.split("\n").length == MAX_TEXT_ROW) {
          e.preventDefault();
          return false;
        }
      }
    },
    download(e) {
      e.target.download = `${this.name}.png`;
      e.target.href = this.canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    },
    drawName(text) {
      // If text is empty, not draw
      if (text == "") return;

      // Initialize word
      const word = [];

      for (let i = 0; i < text.length; i++) {
        // If letter eq space, then push space in word
        if (text[i] == " ") {
          word.push(createCanvas(SPACE_SIZE, GLYPH_H)[0]);
          continue;
        }

        // Initialize empty canvas and meta
        const [canvas, ctx] = createCanvas(GLYPH_W, GLYPH_H);
        const meta = this.glyphs[text[i]];

        // If glyph not found
        if (meta == undefined) {
          this.name_error = "Unknown glyph. See glyph_meta.json";
          return;
        }

        // Clear error
        this.name_error = "";

        // Drawing letter in empty canvas
        ctx.drawImage(
          this.resources.font,
          meta[0] * GLYPH_W,
          meta[1] * GLYPH_H,
          GLYPH_W,
          GLYPH_H,
          0,
          0,
          GLYPH_W,
          GLYPH_H
        );

        // Push trim letter in word
        word.push(trim(canvas));
      }

      // Get word width and get x pos of centered name
      const width = word
        .map((letter) => letter.width)
        .reduce((total, width) => (total += width));
      let posX =
        (NAME_POS_X_END - NAME_POS_X_START - width) / 2 + NAME_POS_X_START;

      // Drawing word
      log(`Drawing name: ${text}`);
      for (const letter of word) {
        this.ctx.drawImage(letter, posX, NAME_POS_Y);
        posX += letter.width;
      }
    },
    drawText(text) {
      // If text is empty, not draw
      if (text == "") return;

      // Initialize text positions
      let posX = TEXT_POS_X;
      let posY = TEXT_POS_Y;

      for (let i = 0; i < text.length; i++) {
        // If letter eq new line, then change pos
        if (text[i] == "\n") {
          posX = TEXT_POS_X;
          posY += GLYPH_H;
          continue;
        }

        // If letter eq space, then change x pos
        if (text[i] == " ") {
          posX += SPACE_SIZE;
          continue;
        }

        const [canvas, ctx] = createCanvas(GLYPH_W, GLYPH_H);
        const meta = this.glyphs[text[i]];

        // If glyph not found
        if (meta == undefined) {
          console.log(meta);
          this.text_error = "Unknown glyph. See glyph_meta.json";
          return;
        }

        // Clear error
        this.text_error = "";

        // Drawing letter in empty canvas
        ctx.drawImage(
          this.resources.fontColored,
          meta[0] * GLYPH_W,
          meta[1] * GLYPH_H,
          GLYPH_W,
          GLYPH_H,
          0,
          0,
          GLYPH_W,
          GLYPH_H
        );

        const trimmedCanvas = trim(canvas);

        // Drawing letter
        this.ctx.drawImage(trimmedCanvas, posX, posY);
        posX += trimmedCanvas.width + GLYPH_MARGIN;
      }

      log(`Drawing text: ${text}`);
    },
    drawPortrait(image) {
      log("Drawing portrait...");
      const [canvas, ctx] = createCanvas(image.width, image.height);

      // Drawing portrait and mask
      ctx.drawImage(this.resources.fontMask, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(image, 0, 0);

      this.ctx.drawImage(canvas, 1200, 0);
    },
    async updatePortrait() {
      this.emotion = 0;
      this.resources.portrait = await loadImage(
        `img\\portraits\\${this.portrait}\\${this.emotion}.png`
      );
      this.render();
    },
    async updateEmotion() {
      this.resources.portrait = await loadImage(
        `img\\portraits\\${this.portrait}\\${this.emotion}.png`
      );
      this.render();
    },
  },
});

function log(text) {
  DEBUG ? console.log(text) : null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onabort = (ev) => reject(ev);
    image.src = src;
  });
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  return [canvas, canvas.getContext("2d")];
}

// Credits: github.com/remy
// MIT http://rem.mit-license.org

function trim(c) {
  var ctx = c.getContext("2d"),
    copy = document.createElement("canvas").getContext("2d"),
    pixels = ctx.getImageData(0, 0, c.width, c.height),
    l = pixels.data.length,
    i,
    bound = {
      top: null,
      left: null,
      right: null,
      bottom: null,
    },
    x,
    y;

  for (i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      x = (i / 4) % c.width;
      y = ~~(i / 4 / c.width);

      if (bound.top === null) {
        bound.top = y;
      }

      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }

      if (bound.right === null) {
        bound.right = x;
      } else if (bound.right < x) {
        bound.right = x;
      }

      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  //  var trimHeight = bound.bottom - bound.top,
  var trimWidth = bound.right + 1 - bound.left,
    trimmed = ctx.getImageData(bound.left, 0, trimWidth, c.height);

  copy.canvas.width = trimWidth;
  copy.canvas.height = c.height;
  copy.putImageData(trimmed, 0, 0);
  // open new window with trimmed image:
  return copy.canvas;
}
