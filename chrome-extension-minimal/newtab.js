const backgroundImages = [
  "https://preview.redd.it/a-couple-favorite-halo-3-pieces-ive-made-v0-3p705kvhnjje1.jpg?width=2560&format=pjpg&auto=webp&s=7c64ab663da9b5dbb33fef983b6e4165e02f2a94",
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
  "https://images5.alphacoders.com/133/thumb-1920-1331432.png",
  "https://images2.alphacoders.com/191/thumb-1920-19102.png",
  "https://images6.alphacoders.com/769/thumb-1920-769877.jpg",
  "https://images4.alphacoders.com/132/thumb-1920-1324987.jpeg",
  "https://images5.alphacoders.com/543/thumb-1920-543469.jpg",
  "https://images8.alphacoders.com/129/thumb-1920-1293832.jpg",
  "https://w.wallhaven.cc/full/jx/wallhaven-jxm7oq.jpg",
  "https://w.wallhaven.cc/full/wy/wallhaven-wy19vr.jpg",

]

let currentBackgroundIndex = 0

function changeBackground() {
  // Add fade out effect
  document.body.style.opacity = "0.7"

  setTimeout(() => {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length
    document.body.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`

    // Fade back in
    document.body.style.opacity = "1"

    // Extract colors from new background after fade completes
    setTimeout(extractColorsFromBackground, 300)
  }, 300)
}

setInterval(changeBackground, 10000)

function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const clockElement = document.getElementById("clock")

  // Add smooth transition when time changes
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
      // Add search animation
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

// Run on load and periodically check
document.addEventListener("DOMContentLoaded", removeCustomText)
setInterval(removeCustomText, 1000)

document.addEventListener("mousemove", (e) => {
  const bookmarks = document.querySelectorAll(".bookmark")
  const mouseX = e.clientX / window.innerWidth
  const mouseY = e.clientY / window.innerHeight

  bookmarks.forEach((bookmark, index) => {
    const speed = ((index % 3) + 1) * 0.5
    const x = (mouseX - 0.5) * speed
    const y = (mouseY - 0.5) * speed

    bookmark.style.transform += ` translate(${x}px, ${y}px)`
  })
})

function extractColorsFromBackground() {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()

  img.crossOrigin = "anonymous"
  img.onload = () => {
    canvas.width = 100
    canvas.height = 100
    ctx.drawImage(img, 0, 0, 100, 100)

    const imageData = ctx.getImageData(0, 0, 100, 100)
    const colors = extractVibrantColors(imageData.data)
    applyGradientBorders(colors)
  }

  img.onerror = () => {
    const fallbackColors = ["#ffffff", "#f0f0f0", "#e0e0e0", "#d0d0d0"]
    applyGradientBorders(fallbackColors)
  }

  img.src = backgroundImages[currentBackgroundIndex]
}

function extractVibrantColors(imageData) {
  const colorMap = new Map()

  // Sample every 4th pixel for performance
  for (let i = 0; i < imageData.length; i += 16) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const alpha = imageData[i + 3]

    if (alpha > 128) {
      // Check if color is vibrant (not gray/neutral)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max

      // Only include colors with good saturation and avoid very dark/light colors
      if (saturation > 0.3 && max > 60 && max < 240) {
        const colorKey = `${Math.floor(r / 20) * 20}-${Math.floor(g / 20) * 20}-${Math.floor(b / 20) * 20}`
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
      }
    }
  }

  // Get most frequent vibrant colors
  const sortedColors = Array.from(colorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split("-").map(Number)
      return `rgb(${r}, ${g}, ${b})`
    })

  return sortedColors.length >= 2 ? sortedColors : ["#ff4757", "#3742fa", "#2ed573", "#ffa502"]
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s, l]
}

function applyGradientBorders(colors) {
  const fullOpacityColors = colors.map((color) => {
    // Convert to full opacity if it has alpha
    if (color.includes("rgba")) {
      return color.replace(/rgba$$([^,]+),([^,]+),([^,]+),[^)]+$$/, "rgb($1,$2,$3)")
    }
    return color
  })

  const gradient = `linear-gradient(45deg, ${fullOpacityColors.join(", ")})`

  const searchBox = document.querySelector(".search-box")
  if (searchBox) {
    searchBox.style.background = "rgba(255, 255, 255, 0.15)"
    searchBox.style.backdropFilter = "blur(10px)"
    searchBox.style.borderImage = `${gradient} 1`
    searchBox.style.border = "4px solid transparent" // Increased border width for more prominence
    searchBox.style.borderRadius = "50px"
    searchBox.style.backgroundClip = "padding-box"
    searchBox.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.4), 
                                 inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                 0 0 30px ${fullOpacityColors[0]},
                                 0 0 60px ${fullOpacityColors[0]}80,
                                 0 0 90px ${fullOpacityColors[0]}40`
  }

  const bookmarks = document.querySelectorAll(".bookmark")
  bookmarks.forEach((bookmark, index) => {
    const colorIndex = index % fullOpacityColors.length
    const glowColor = fullOpacityColors[colorIndex]

    bookmark.style.background = "rgba(255, 255, 255, 0.12)"
    bookmark.style.backdropFilter = "blur(10px)"
    bookmark.style.borderImage = `${gradient} 1`
    bookmark.style.border = "3px solid transparent" // Increased border width
    bookmark.style.borderRadius = "20px"
    bookmark.style.backgroundClip = "padding-box"
    bookmark.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                                0 0 25px ${glowColor},
                                0 0 50px ${glowColor}60,
                                0 0 75px ${glowColor}30`
  })
}

// Set initial random background
document.addEventListener("DOMContentLoaded", () => {
  currentBackgroundIndex = Math.floor(Math.random() * backgroundImages.length)
  document.body.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`

  // Wait for background to load then extract colors
  setTimeout(extractColorsFromBackground, 1000)
})
