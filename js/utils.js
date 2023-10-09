const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onabort = (ev) => reject(ev)
    image.src = url
  })
}

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  return [canvas, canvas.getContext('2d', { willReadFrequently: true })]
}

// Credits: github.com/remy
// MIT http://rem.mit-license.org

const trim = (c) => {
  var ctx = c.getContext('2d'),
    copy = document.createElement('canvas').getContext('2d'),
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
    y

  for (i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      x = (i / 4) % c.width
      y = ~~(i / 4 / c.width)

      if (bound.top === null) {
        bound.top = y
      }

      if (bound.left === null) {
        bound.left = x
      } else if (x < bound.left) {
        bound.left = x
      }

      if (bound.right === null) {
        bound.right = x
      } else if (bound.right < x) {
        bound.right = x
      }

      if (bound.bottom === null) {
        bound.bottom = y
      } else if (bound.bottom < y) {
        bound.bottom = y
      }
    }
  }

  //  var trimHeight = bound.bottom - bound.top,
  var trimWidth = bound.right + 1 - bound.left,
    trimmed = ctx.getImageData(bound.left, 0, trimWidth, c.height)

  copy.canvas.width = trimWidth
  copy.canvas.height = c.height
  copy.putImageData(trimmed, 0, 0)
  // open new window with trimmed image:
  return copy.canvas
}

export { loadImage, trim, createCanvas }
