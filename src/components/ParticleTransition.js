import { useEffect, useRef } from "react"
import "./ParticleTransition.css"

const ParticleTransition = ({ imageUrl, onComplete }) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef()
  const timeoutRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const particles = []
    const targetPositions = []
    let phase = "scatter" // scatter, gather
    let progress = 0

    const init = async () => {
      // Load and draw the image
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // Set canvas size
      canvas.width = 200
      canvas.height = 200

      // Draw image scaled to fit canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Create particles from image
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4
          if (data[i + 3] > 128) {
            // If pixel is visible enough
            particles.push({
              x: x,
              y: y,
              originX: x,
              originY: y,
              size: 2,
              color: `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, ${data[i + 3] / 255})`,
            })
          }
        }
      }

      // Generate target positions for QR code pattern
      const qrSize = 25
      const cellSize = canvas.width / qrSize

      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          if (Math.random() > 0.7) {
            // Create QR-like pattern
            targetPositions.push({
              x: x * cellSize,
              y: y * cellSize,
            })
          }
        }
      }

      // Add position detection patterns
      const addCornerPattern = (startX, startY) => {
        for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 7; x++) {
            if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
              targetPositions.push({
                x: (startX + x) * cellSize,
                y: (startY + y) * cellSize,
              })
            }
          }
        }
      }

      // Add corner patterns
      addCornerPattern(2, 2) // Top-left
      addCornerPattern(16, 2) // Top-right
      addCornerPattern(2, 16) // Bottom-left

      particlesRef.current = particles
      animate()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (phase === "scatter") {
        progress += 0.01
        if (progress >= 1) {
          phase = "gather"
          progress = 0
        }

        particles.forEach((particle) => {
          // Scatter particles
          const angle = Math.random() * Math.PI * 2
          const force = 50 * (1 - progress)
          particle.x += Math.cos(angle) * force * (Math.random() - 0.5)
          particle.y += Math.sin(angle) * force * (Math.random() - 0.5)

          ctx.fillStyle = particle.color
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        })
      } else if (phase === "gather") {
        progress += 0.01
        if (progress >= 1) {
          cancelAnimationFrame(animationFrameRef.current)
          timeoutRef.current = setTimeout(() => {
            onComplete()
          }, 500)
          return
        }

        particles.forEach((particle, i) => {
          const target = targetPositions[i % targetPositions.length]

          // Move towards target position
          particle.x = particle.x + (target.x - particle.x) * 0.1
          particle.y = particle.y + (target.y - particle.y) * 0.1

          ctx.fillStyle = "black"
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    init()

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [imageUrl, onComplete])

  return <canvas ref={canvasRef} className="particle-transition" />
}

export default ParticleTransition

