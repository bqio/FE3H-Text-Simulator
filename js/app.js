const GLYPH_W = 48;
const GLYPH_H = 52;
const GLYPH_MARGIN = 2;
const SPACE_SIZE = 15;
const NAME_POS_X_START = 100;
const NAME_POS_X_END = 495;
const NAME_POS_Y = 222;
const TEXT_POS_X = 250;
const TEXT_POS_Y = 325;
// 110x250
// 495x250
// 192
// 495 - 192 = 303 (free space)
// 303 / 2 = 151
// 395x60

new Vue({
  el: "#app",
  data: {
    meta: {},
    glyph_meta: {},
    char: "Anna",
    name: "Анна",
    text: "Привет, друг!\nКак твои дела?",
    emotion: "",
    emotions: [],
    error: "",
    canvas: null,
    ctx: null,
    resources: {},
  },
  methods: {
    init() {
      return new Promise(async (resolve) => {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.resources.text_box = await this.preloadImage("img/textbox.png");
        this.resources.font_c = await this.preloadImage("img/fc.png");
        this.resources.font = await this.preloadImage("img/f.png");
        this.resources.mask = await this.preloadImage("img/mask.png");

        this.emotion = this.emotions[0];

        resolve();
      });
    },
    async render() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw textbox
      this.ctx.drawImage(this.resources.text_box, 0, 0);

      try {
        // Draw name
        this.drawName(this.name);

        // Draw text
        this.drawText(this.text);
        this.error = "";
      } catch (error) {
        this.error = "Unknown glyph. See glyph_meta.json";
      }

      // Draw portrait
      await this.drawPortrait(this.char, this.emotion);
    },
    preloadImage(url) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onabort = (ev) => reject(ev);
        image.src = url;
      });
    },
    rowLimit(e) {
      if (e.code == "Enter") {
        if (this.text.split("\n").length == 2) {
          e.preventDefault();
          return false;
        }
      }
    },
    createTempCanvas(w, h) {
      const canvas = document.createElement("canvas");

      canvas.width = w;
      canvas.height = h;

      return canvas;
    },
    drawName(text) {
      if (text == "") return;
      const glyphs = [];
      for (let i = 0; i < text.length; i++) {
        const tempCanvas = this.createTempCanvas(GLYPH_W, GLYPH_H);
        const tempCTX = tempCanvas.getContext("2d");
        const meta = this.glyph_meta[text[i]];

        tempCTX.drawImage(
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

        glyphs.push(trim(tempCanvas));
      }

      let width = glyphs.map((c) => c.width).reduce((total, n) => (total += n));
      let x = NAME_POS_X_END - NAME_POS_X_START;
      let x1 = x - width;
      let x2 = x1 / 2;
      let corX = x2 + NAME_POS_X_START;
      let corY = NAME_POS_Y;

      for (let i = 0; i < text.length; i++) {
        const canvas = glyphs[i];

        this.ctx.drawImage(canvas, corX, corY);
        corX += canvas.width;
      }
    },
    drawText(text) {
      let corX = TEXT_POS_X;
      let corY = TEXT_POS_Y;

      for (let i = 0; i < text.length; i++) {
        const tempCanvas = this.createTempCanvas(GLYPH_W, GLYPH_H);
        const tempCTX = tempCanvas.getContext("2d");
        const meta = this.glyph_meta[text[i]];

        if (text[i] == "\n") {
          corX = TEXT_POS_X;
          corY += GLYPH_H;
          continue;
        }

        if (text[i] == " ") {
          corX += SPACE_SIZE;
          continue;
        }

        tempCTX.drawImage(
          this.resources.font_c,
          meta[0] * GLYPH_W,
          meta[1] * GLYPH_H,
          GLYPH_W,
          GLYPH_H,
          0,
          0,
          GLYPH_W,
          GLYPH_H
        );

        const trimmedCanvas = trim(tempCanvas);

        this.ctx.drawImage(trimmedCanvas, corX, corY);
        corX += trimmedCanvas.width + GLYPH_MARGIN;
      }
    },
    async drawPortrait(name, emotion) {
      const image = await this.preloadImage(
        `img\\portraits\\${name}\\${emotion}.png`
      );
      const tempCanvas = this.createTempCanvas(image.width, image.height);
      const tempCTX = tempCanvas.getContext("2d");

      tempCTX.drawImage(this.resources.mask, 0, 0);
      tempCTX.globalCompositeOperation = "source-in";
      tempCTX.drawImage(image, 0, 0);

      this.ctx.drawImage(tempCanvas, 1200, 0);
    },
  },
  watch: {
    async char() {
      this.emotions = this.meta[this.char];
      this.emotion = this.emotions[0];
      await this.render();
    },
    async emotion() {
      await this.render();
    },
    async name() {
      await this.render();
    },
    async text() {
      await this.render();
    },
  },
  async mounted() {
    let response = await fetch("portrait_meta.json");
    let json = await response.json();

    this.meta = json;

    response = await fetch("glyph_meta.json");
    json = await response.json();

    this.glyph_meta = json;

    this.emotions = this.meta[this.char];

    await this.init();
  },
});

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
