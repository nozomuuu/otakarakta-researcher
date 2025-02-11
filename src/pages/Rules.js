import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Rules.css"

function Rules() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showOtakarakuta, setShowOtakarakuta] = useState(false)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [buttonAudio] = useState(new Audio("/button.mp3"))
  const [isTransitioning, setIsTransitioning] = useState(false)

  const messages = [
    "せいげんじかんないに かくれている\nオタカラクタを さつえいしてもらうぞ！",
    "オタカラクタを みつけたら\nこのアプリで さつえいしよう！",
    "オタカラクタは ぜんぶで\n５０たい いるぞ！",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false)
      if (step === 2) {
        setShowOtakarakuta(true)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [step])

  const handleNext = () => {
    buttonAudio.currentTime = 0
    buttonAudio.play().catch(console.error)

    if (isTyping) {
      setIsTyping(false)
      return
    }

    if (step < messages.length - 1) {
      setStep((s) => s + 1)
      setIsTyping(true)
      setShowOtakarakuta(false)
    }
  }

  const handleImageClick = (imageSrc) => {
    buttonAudio.currentTime = 0
    buttonAudio.play().catch(console.error)
    setZoomedImage(zoomedImage === imageSrc ? null : imageSrc)
  }

  const handleStart = () => {
    buttonAudio.currentTime = 0
    buttonAudio.play().catch(console.error)
    setIsTransitioning(true)

    // Create transition overlay with unique ID
    const overlay = document.createElement("div")
    overlay.id = "transition-overlay"
    overlay.className = "transition-overlay"
    document.body.appendChild(overlay)

    // Fade to black
    setTimeout(() => {
      overlay.style.opacity = "1"
      // Navigate after fade completes
      setTimeout(() => {
        navigate("/takephoto", {
          state: {
            fromRules: true,
            transitionTime: Date.now(),
          },
        })
        // Clean up overlay
        const existingOverlay = document.getElementById("transition-overlay")
        if (existingOverlay) {
          existingOverlay.remove()
        }
      }, 1000)
    }, 50)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const existingOverlay = document.getElementById("transition-overlay")
      if (existingOverlay) {
        existingOverlay.remove()
      }
    }
  }, [])

  return (
    <div className={`rules-container ${isTransitioning ? "transitioning" : ""}`}>
      <div className="rules-window">
        <div className="screen-container">
          <div className="title-box">
            <img
              src="/images/otakarakuta/Title2.png"
              alt="ぼうけんの ルール"
              className="rules-title-image pixel-perfect"
            />
          </div>

          <div className="content-area">
            <div className="image-area">
              {step === 0 && !isTyping && (
                <img
                  src="/images/otakarakuta/Kakureteiru.png"
                  alt="かくれているオタカラクタ"
                  className="scene-image pixel-perfect"
                />
              )}
              {step === 1 && !isTyping && (
                <img
                  src="/images/otakarakuta/Satsuei.png"
                  alt="さつえいするオタカラクタ"
                  className="scene-image pixel-perfect"
                />
              )}
              {showOtakarakuta && (
                <div className="otakarakuta-scroll">
                  <div className="otakarakuta-container">
                    {[...Array(100)].map((_, i) => (
                      <img
                        key={i}
                        src={`/images/otakarakuta/${(i % 50) + 1}.png`}
                        alt={`オタカラクタ ${(i % 50) + 1}`}
                        className={`otakarakuta-item ${zoomedImage === `/images/otakarakuta/${(i % 50) + 1}.png` ? "zoomed" : ""}`}
                        onClick={() => handleImageClick(`/images/otakarakuta/${(i % 50) + 1}.png`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-box" onClick={step < messages.length - 1 ? handleNext : undefined}>
              <p className={`message ${isTyping ? "typing" : ""}`}>{messages[step]}</p>
              {!isTyping && step < messages.length - 1 && <span className="cursor">▼</span>}
            </div>
          </div>

          {!isTyping && step === messages.length - 1 && (
            <div className="start-text" onClick={handleStart}>
              ▶︎ はじめる
            </div>
          )}
          <div className="screen-reflection" />
        </div>
      </div>

      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => handleImageClick(null)}>
          <img src={zoomedImage || "/placeholder.svg"} alt="拡大表示" className="zoomed-image pixel-perfect" />
        </div>
      )}
    </div>
  )
}

export default Rules

