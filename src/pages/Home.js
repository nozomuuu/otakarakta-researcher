import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.css"

function Home() {
  const navigate = useNavigate()
  const [buttonAudio] = useState(new Audio("/button.mp3"))
  const [state, setState] = useState({
    loadingProgress: 0,
    loadingComplete: false,
    showContent: false,
    imagesLoaded: false,
    error: null,
  })

  const mountedRef = useRef(true)
  const imagesRef = useRef({
    title: null,
    char1: null,
    char2: null,
  })

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        console.log(`Attempting to load image: ${src}`) // Debug log
        const img = new Image()

        img.onload = () => {
          console.log(`Successfully loaded image: ${src}`) // Debug log
          resolve(img)
        }

        img.onerror = (e) => {
          console.error(`Failed to load image: ${src}`, e) // Debug log
          reject(new Error(`Failed to load image: ${src}`))
        }

        img.src = src
      })
    }

    const init = async () => {
      try {
        console.log("Starting image loading process") // Debug log

        const imageSources = {
          title: "images/otakarakuta/Title.png", // Removed leading slash
          char1: "images/otakarakuta/Home.png", // Removed leading slash
          char2: "images/otakarakuta/Home2.png", // Removed leading slash
        }

        // Reset state
        setState((prev) => ({
          ...prev,
          loadingProgress: 0,
          loadingComplete: false,
          showContent: false,
          imagesLoaded: false,
          error: null,
        }))

        // Load images
        let loaded = 0
        const total = Object.keys(imageSources).length

        for (const [key, src] of Object.entries(imageSources)) {
          if (!mountedRef.current) return
          console.log(`Loading image ${key}: ${src}`) // Debug log

          try {
            await preloadImage(src)
            if (!mountedRef.current) return

            loaded++
            const progress = (loaded / total) * 100
            console.log(`Progress: ${progress}%`) // Debug log

            setState((prev) => ({
              ...prev,
              loadingProgress: progress,
            }))
          } catch (error) {
            console.error(`Error loading ${key}:`, error) // Debug log
            throw error
          }
        }

        // All images loaded
        if (!mountedRef.current) return
        console.log("All images loaded successfully") // Debug log
        setState((prev) => ({ ...prev, imagesLoaded: true }))

        // Wait before completing loading
        await new Promise((resolve) => setTimeout(resolve, 1000))
        if (!mountedRef.current) return
        setState((prev) => ({ ...prev, loadingComplete: true }))

        // Wait for fade out
        await new Promise((resolve) => setTimeout(resolve, 1000))
        if (!mountedRef.current) return
        setState((prev) => ({ ...prev, showContent: true }))
      } catch (error) {
        console.error("Failed to load images:", error)
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: error.message,
            loadingComplete: true,
            showContent: true,
            imagesLoaded: false,
          }))
        }
      }
    }

    init()
  }, [])

  const handleClick = () => {
    buttonAudio.currentTime = 0
    buttonAudio.play().catch(console.error)
    setTimeout(() => navigate("/rules"), 200)
  }

  return (
    <div className="root-container">
      {!state.showContent && (
        <div className={`loading-screen ${state.loadingComplete ? "fade-out" : ""}`}>
          <div className="loading-content">
            <div>Loading...</div>
            <div className="loading-progress">{Math.round(state.loadingProgress)}%</div>
            {state.error && <div className="loading-error">Error: {state.error}</div>}
          </div>
        </div>
      )}

      <div className={`home-container ${state.showContent ? "show" : ""}`}>
        <div className="game-window">
          <div className="screen-container">
            <div className="content-area">
              <div className="title-container">
                <img src="images/otakarakuta/Title.png" alt="オタカラクタ リサーチャー" className="title-image" />
              </div>

              <div className="characters-container">
                <img src="images/otakarakuta/Home.png" alt="" className="character-image main-character" />
                <img src="images/otakarakuta/Home2.png" alt="" className="character-image sub-character" />
              </div>

              <div className="start-text" onClick={handleClick}>
                ▶︎ はじめる
              </div>
            </div>
            <div className="screen-reflection" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

