const backgroundImages = [
  "https://w.wallhaven.cc/full/48/wallhaven-4859q2.jpg",
  "https://w.wallhaven.cc/full/nm/wallhaven-nmvv1n.png",
  "https://w.wallhaven.cc/full/6q/wallhaven-6qkpox.png",
  "https://w.wallhaven.cc/full/4x/wallhaven-4xdo1l.jpg",
  "https://images4.alphacoders.com/133/thumb-1920-133244.jpg",
  "https://i.imgur.com/fnNzYr7.png",
  "https://i.imgur.com/AwNWiWa.jpeg",
  "https://images4.alphacoders.com/756/756776.jpg",
  "https://images4.alphacoders.com/745/745135.png",
  "https://images3.alphacoders.com/966/thumb-1920-966720.png",
  "https://images2.alphacoders.com/660/thumb-1920-660298.jpg",
  "https://images5.alphacoders.com/318/thumb-1920-318697.png",
  "https://images6.alphacoders.com/722/thumb-1920-722754.png",
    "https://cdnb.artstation.com/p/assets/images/images/082/151/789/large/2204-cortana-final.jpg?1732195463",
  "https://cdna.artstation.com/p/assets/images/images/082/151/512/large/2204-ark-nowatermark.jpg?1739451842",
  "https://cdnb.artstation.com/p/assets/images/images/082/151/367/large/2204-2hunters9.jpg?1739451597",
  "https://cdnb.artstation.com/p/assets/images/images/082/152/817/large/2204-falloutnv.jpg?1739451908",
  "https://cdnb.artstation.com/p/assets/images/images/011/887/423/4k/erasmus-brosdau-encounter-in-the-snow.jpg?1531935201",
  "https://cdnb.artstation.com/p/assets/images/images/012/953/193/4k/erasmus-brosdau-peace-walker.jpg?1537349396",
  "https://cdna.artstation.com/p/assets/images/images/026/150/150/large/quentin-chaillet-artstation-06.jpg?1588013553",
  "https://cdna.artstation.com/p/assets/images/images/011/316/676/large/cedric-cunanan-asylum-ds.jpg?1528953807",
  "https://4kwallpapers.com/images/wallpapers/death-stranding-playstation-4-pc-games-3440x1440-4202.jpg",
  "https://w.wallhaven.cc/full/57/wallhaven-57qzk3.png",
  "https://w.wallhaven.cc/full/3z/wallhaven-3z8356.png",
  "https://w.wallhaven.cc/full/nm/wallhaven-nmogx9.png",
  "https://w.wallhaven.cc/full/z8/wallhaven-z8x18v.jpg",
  "https://w.wallhaven.cc/full/5w/wallhaven-5w7l19.jpg",
  "https://w.wallhaven.cc/full/1k/wallhaven-1kgrxv.jpg",
  "https://w.wallhaven.cc/full/zy/wallhaven-zyjy2o.jpg",
  "https://w.wallhaven.cc/full/l8/wallhaven-l87pjy.jpg",
  "https://w.wallhaven.cc/full/xl/wallhaven-xlj28l.jpg",
  "https://w.wallhaven.cc/full/dp/wallhaven-dpvvgm.jpg",
  "https://w.wallhaven.cc/full/lm/wallhaven-lm6r3y.jpg",
  "https://w.wallhaven.cc/full/j5/wallhaven-j5gr3y.jpg",
  "https://w.wallhaven.cc/full/md/wallhaven-md7r9m.jpg",
  "https://w.wallhaven.cc/full/0p/wallhaven-0p9jk9.jpg",
  "https://w.wallhaven.cc/full/zy/wallhaven-zykx7w.png",
  "https://i.imgur.com/2kjiVAE.png",
  "https://i.imgur.com/kpNxlQq.png",
  "https://i.imgur.com/2Gt0DrC.png",
  "https://i.imgur.com/jgSDGLm.png",
  "https://i.imgur.com/j9gfcaX.png",
  "https://i.imgur.com/wn36nLX.png",
  "https://i.imgur.com/IYquOKE.png",
  "https://i.imgur.com/x8Zv7Mg.png",
  "https://i.imgur.com/9o8dGCH.png",
  "https://i.imgur.com/4HLNSsO.png",
  "https://i.imgur.com/8TOO7LN.png",
  "https://i.imgur.com/hOCcI8g.png",
  "https://w.wallhaven.cc/full/ex/wallhaven-ex1588.png",
  "https://i.imgur.com/viW4wf4.png",
  "https://i.imgur.com/k0JcrwO.png",
  "https://i.imgur.com/cCKaI7a.png",
  "https://i.imgur.com/dtU5nBy.jpeg",
  "https://w.wallhaven.cc/full/39/wallhaven-39e83d.jpg",
  "https://w.wallhaven.cc/full/nz/wallhaven-nzmvew.jpg",
  "https://images7.alphacoders.com/139/thumb-1920-1394851.jpg",
  "https://images5.alphacoders.com/778/thumb-1920-778941.jpg",
  "https://images2.alphacoders.com/191/thumb-1920-19102.png",
  "https://images8.alphacoders.com/129/thumb-1920-1293832.jpg",
  "https://w.wallhaven.cc/full/jx/wallhaven-jxm7oq.jpg",
]

let currentBackgroundIndex = 0
const imageCache = new Map()
let isTransitioning = false

function preloadImages() {
  const preloadCount = 3
  for (let i = 0; i < preloadCount; i++) {
    const index = (currentBackgroundIndex + i + 1) % backgroundImages.length
    if (!imageCache.has(index)) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = backgroundImages[index]
      imageCache.set(index, img)
    }
  }
}

function changeBackground() {
  if (isTransitioning) return
  isTransitioning = true

  let newIndex
  do {
    newIndex = Math.floor(Math.random() * backgroundImages.length)
  } while (newIndex === currentBackgroundIndex && backgroundImages.length > 1)

  const blockCount = 8 // Bigger vertical sections
  const transitionContainer = document.createElement("div")
  transitionContainer.className = "block-transition-container"
  document.body.appendChild(transitionContainer)

  // Create blocks that show the NEW image while old image stays as background
  for (let i = 0; i < blockCount; i++) {
    const block = document.createElement("div")
    block.className = "transition-block"
    block.style.left = `${(i / blockCount) * 100}%`
    block.style.width = `${100 / blockCount}%`
    block.style.backgroundImage = `url('${backgroundImages[newIndex]}')`
    block.style.backgroundSize = `${blockCount * 100}% 100%` // Scale image to fit all blocks
    block.style.backgroundPosition = `${(i / (blockCount - 1)) * 100}% center`

    transitionContainer.appendChild(block)

    setTimeout(() => {
      block.style.opacity = "1"

      block.style.boxShadow = "0 0 40px rgba(255, 255, 255, 1), 0 0 80px rgba(255, 255, 255, 0.8)"
      block.style.borderColor = "rgba(255, 255, 255, 1)"

      setTimeout(() => {
        block.style.boxShadow = "none"
        block.style.borderColor = "transparent"
      }, 100) // Very quick flash
    }, i * 150) // Faster stagger between sections
  }

  setTimeout(
    () => {
      currentBackgroundIndex = newIndex
      document.body.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`
      extractColorsFromBackground()
    },
    blockCount * 150 + 200,
  )

  setTimeout(
    () => {
      transitionContainer.remove()
      isTransitioning = false
      preloadImages()
    },
    blockCount * 150 + 500,
  ) // Much shorter cleanup time
}

setInterval(changeBackground, 12000)

function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const clockElement = document.getElementById("clock")

  if (clockElement.textContent !== `${hours}:${minutes}`) {
    clockElement.style.transform = "scale(1.05)"
    setTimeout(() => {
      clockElement.textContent = `${hours}:${minutes}`
      clockElement.style.transform = "scale(1)"
    }, 100)
  }
}

setInterval(updateTime, 1000)
updateTime()

document.getElementById("search").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = event.target.value
    if (query.trim()) {
      event.target.style.transform = "scale(0.95)"
      setTimeout(() => {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
      }, 150)
    }
  }
})

const searchBox = document.getElementById("search")
searchBox.addEventListener("focus", function () {
  this.style.transform = "translateY(-2px) scale(1.02)"
})

searchBox.addEventListener("blur", function () {
  this.style.transform = "translateY(0) scale(1)"
})

function removeCustomText() {
  const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)

  let node
  while ((node = textNodes.nextNode())) {
    if (node.textContent.includes("Custom New Tab") || node.textContent.includes("Custom Google Tab")) {
      node.textContent = ""
    }
  }
}

document.addEventListener("DOMContentLoaded", removeCustomText)
setInterval(removeCustomText, 1000)

let mouseThrottleTimer = null
document.addEventListener("mousemove", (e) => {
  if (mouseThrottleTimer) return

  mouseThrottleTimer = setTimeout(() => {
    const bookmarks = document.querySelectorAll(".bookmark")
    const mouseX = e.clientX / window.innerWidth
    const mouseY = e.clientY / window.innerHeight

    bookmarks.forEach((bookmark, index) => {
      const speed = ((index % 3) + 1) * 0.3
      const x = (mouseX - 0.5) * speed
      const y = (mouseY - 0.5) * speed

      bookmark.style.transform += ` translate(${x}px, ${y}px)`
    })

    mouseThrottleTimer = null
  }, 16)
})

function extractColorsFromBackground() {
  const cachedImg = imageCache.get(currentBackgroundIndex)
  if (cachedImg && cachedImg.complete) {
    processImageColors(cachedImg)
    return
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()

  img.crossOrigin = "anonymous"
  img.onload = () => processImageColors(img)

  img.onerror = () => {
    const fallbackColors = ["#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0"]
    applyGradientBorders(fallbackColors)
  }

  img.src = backgroundImages[currentBackgroundIndex]
}

function processImageColors(img) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = 50
  canvas.height = 50
  ctx.drawImage(img, 0, 0, 50, 50)

  const imageData = ctx.getImageData(0, 0, 50, 50)
  const colors = extractVibrantColors(imageData.data)
  applyGradientBorders(colors)
}

function extractVibrantColors(imageData) {
  const colorMap = new Map()
  const step = 8

  for (let i = 0; i < imageData.length; i += step * 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const alpha = imageData[i + 3]

    if (alpha > 128) {
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      const brightness = (r + g + b) / 3

      if (saturation > 0.3 && brightness > 30 && brightness < 220 && max < 240) {
        const isNearWhite = r > 200 && g > 200 && b > 200
        const isNearGray = Math.abs(r - g) < 40 && Math.abs(g - b) < 40 && Math.abs(r - b) < 40

        if (!isNearWhite && !isNearGray) {
          const colorKey = `${Math.floor(r / 30) * 30}-${Math.floor(g / 30) * 30}-${Math.floor(b / 30) * 30}`
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
        }
      }
    }
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split("-").map(Number)
      return `rgb(${r}, ${g}, ${b})`
    })

  return sortedColors.length >= 2 ? sortedColors : ["#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0"]
}

function applyGradientBorders(colors) {
  const fullOpacityColors = colors.map((color) => {
    if (color.includes("rgba")) {
      return color.replace(/rgba$$[^,]+,[^,]+,[^,]+,[^)]+$$/, "rgb($1,$2,$3)")
    }
    return color
  })

  const gradient = `linear-gradient(45deg, ${fullOpacityColors.join(", ")})`

  const searchBox = document.querySelector(".search-box")
  if (searchBox) {
    searchBox.style.background = "rgba(255, 255, 255, 0.15)"
    searchBox.style.backdropFilter = "blur(10px)"
    searchBox.style.borderImage = `${gradient} 1`
    searchBox.style.border = "3px solid transparent"
    searchBox.style.borderRadius = "50px"
    searchBox.style.backgroundClip = "padding-box"
    searchBox.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.4), 
                                 inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                 0 0 20px ${fullOpacityColors[0]}80,
                                 0 0 40px ${fullOpacityColors[0]}40`
  }

  const bookmarks = document.querySelectorAll(".bookmark")
  bookmarks.forEach((bookmark, index) => {
    const colorIndex = index % fullOpacityColors.length
    const glowColor = fullOpacityColors[colorIndex]

    bookmark.style.background = "rgba(255, 255, 255, 0.12)"
    bookmark.style.backdropFilter = "blur(10px)"
    bookmark.style.borderImage = `${gradient} 1`
    bookmark.style.border = "2px solid transparent"
    bookmark.style.borderRadius = "20px"
    bookmark.style.backgroundClip = "padding-box"
    bookmark.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                                0 0 15px ${glowColor}60,
                                0 0 30px ${glowColor}30`

    bookmark.addEventListener("mouseenter", function () {
      this.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.4), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.3),
                              0 0 25px ${glowColor},
                              0 0 50px ${glowColor}60,
                              0 0 75px ${glowColor}30`
    })

    bookmark.addEventListener("mouseleave", function () {
      this.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.2),
                              0 0 15px ${glowColor}60,
                              0 0 30px ${glowColor}30`
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  currentBackgroundIndex = Math.floor(Math.random() * backgroundImages.length)
  document.body.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`

  preloadImages()
  setTimeout(extractColorsFromBackground, 500)
})
