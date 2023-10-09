import { createApp } from 'vue'
import { loadImage, createCanvas, trim } from './utils.js'

const GLYPH_W = 48
const GLYPH_H = 52
const GLYPH_OUT_W = 40
const GLYPH_OUT_H = 44
const GLYPH_NAME_MARGIN = 1
const GLYPH_TEXT_MARGIN = 0
const SPACE_SIZE = 10
const NAME_POS_X_START = 100
const NAME_POS_X_END = 495
const NAME_POS_Y = 228
const TEXT_POS_X = 300
const TEXT_POS_Y = 308
const MAX_TEXT_ROW = 3

createApp({
  data() {
    return {
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
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      // Loading meta data
      console.log('Loading meta data...')
      this.portraits = await (await fetch('data\\portrait_meta.json')).json()
      this.glyphs = await (await fetch('data\\glyph_meta.json')).json()

      // Initialize canvas and context
      console.log('Initialize canvas and context...')
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })

      // Loading resources
      console.log('Loading resources...')
      this.resources.textBox = await loadImage('img/textbox.png')
      this.resources.fontColored = await loadImage('img/fc.png')
      this.resources.font = await loadImage('img/f.png')
      this.resources.mask = await loadImage('img/mask.png')
      this.resources.portrait = await loadImage('img/portraits/Anna/0.png')

      // Set default values
      console.log('Set default values...')
      this.portrait = this.name = 'Anna'
      this.emotion = 0
      this.text = 'Welcome!'

      // Running render
      this.render()
    },
    render() {
      this.loading = true
      console.log('Rendering...')

      // Clear canvas
      console.log('Clearing canvas...')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Drawing all elements
      console.log('Drawing...')
      this.ctx.drawImage(this.resources.textBox, 0, 0)
      this.drawName(this.name)
      this.drawText(this.text)
      this.drawPortrait(this.resources.portrait)

      this.loading = false
      console.log('=========================================')
    },
    rowLimit(e) {
      if (e.code == 'Enter') {
        if (this.text.split('\n').length == MAX_TEXT_ROW) {
          e.preventDefault()
          return false
        }
      }
    },
    download(e) {
      e.target.download = `${this.name}.png`
      e.target.href = this.canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
    },
    drawName(text) {
      // If text is empty, not draw
      if (text == '') return

      // Initialize word
      const word = []

      for (let i = 0; i < text.length; i++) {
        // If letter eq space, then push space in word
        if (text[i] == ' ') {
          word.push(createCanvas(SPACE_SIZE, GLYPH_H)[0])
          continue
        }

        // Initialize empty canvas and meta
        const [canvas, ctx] = createCanvas(GLYPH_W, GLYPH_H)
        const meta = this.glyphs[text[i]]

        // If glyph not found
        if (meta == undefined) {
          this.name_error = 'Unknown glyph. See glyph_meta.json'
          return
        }

        // Clear error
        this.name_error = ''

        // Drawing letter in empty canvas
        ctx.drawImage(
          this.resources.font,
          meta[0] * GLYPH_W,
          meta[1] * GLYPH_H,
          GLYPH_W,
          GLYPH_H,
          0,
          0,
          GLYPH_OUT_W,
          GLYPH_OUT_H
        )

        // Push trim letter in word
        word.push(trim(canvas))
      }

      // Get word width and get x pos of centered name
      const width = word
        .map((letter) => letter.width)
        .reduce((total, width) => (total += width))
      let posX =
        (NAME_POS_X_END - NAME_POS_X_START - width) / 2 + NAME_POS_X_START

      // Drawing word
      console.log(`Drawing name: ${text}`)
      for (const letter of word) {
        this.ctx.drawImage(letter, posX, NAME_POS_Y)
        posX += letter.width + GLYPH_NAME_MARGIN
      }
    },
    drawText(text) {
      // If text is empty, not draw
      if (text == '') return

      // Initialize text positions
      let posX = TEXT_POS_X
      let posY = TEXT_POS_Y

      for (let i = 0; i < text.length; i++) {
        // If letter eq new line, then change pos
        if (text[i] == '\n') {
          posX = TEXT_POS_X
          posY += GLYPH_H
          continue
        }

        // If letter eq space, then change x pos
        if (text[i] == ' ') {
          posX += SPACE_SIZE
          continue
        }

        const [canvas, ctx] = createCanvas(GLYPH_W, GLYPH_H)
        const meta = this.glyphs[text[i]]

        // If glyph not found
        if (meta == undefined) {
          this.text_error = 'Unknown glyph. See glyph_meta.json'
          return
        }

        // Clear error
        this.text_error = ''

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
        )

        const trimmedCanvas = trim(canvas)

        // Drawing letter
        this.ctx.drawImage(trimmedCanvas, posX, posY)
        posX += trimmedCanvas.width + GLYPH_TEXT_MARGIN
      }

      console.log(`Drawing text: ${text}`)
    },
    drawPortrait(image) {
      console.log(`Drawing portrait: ${this.portrait}`)
      const [canvas, ctx] = createCanvas(image.width, image.height)

      // Drawing portrait and mask
      ctx.drawImage(this.resources.mask, 0, 0)
      ctx.globalCompositeOperation = 'source-in'
      ctx.drawImage(image, 0, 0)

      this.ctx.drawImage(canvas, 1200, 0)
    },
    async updatePortrait() {
      this.emotion = 0
      this.resources.portrait = await loadImage(
        `img\\portraits\\${this.portrait}\\${this.emotion}.png`
      )
      this.render()
    },
    async updateEmotion() {
      this.resources.portrait = await loadImage(
        `img\\portraits\\${this.portrait}\\${this.emotion}.png`
      )
      this.render()
    },
  },
}).mount('#app')
