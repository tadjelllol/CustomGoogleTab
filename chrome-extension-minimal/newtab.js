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
