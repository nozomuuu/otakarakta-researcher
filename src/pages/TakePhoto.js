"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { photoStorage } from "../utils/photoStorage"
import { CameraSwitchIcon } from "../components/icons/CameraSwitch"
import "./TakePhoto.css"

const MAX_PHOTOS = 60
const ASPECT_RATIO = 1.391

const TakePhoto = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(10 * 60)
  const [photosRemaining, setPhotosRemaining] = useState(MAX_PHOTOS)
  const [lastPhoto, setLastPhoto] = useState(null)
  const [showThumbnail, setShowThumbnail] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [error, setError] = useState(null)
  const [thumbnailVisible, setThumbnailVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [facingMode, setFacingMode] = useState("environment")
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const thumbnailTimer = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const mounted = useRef(true)

  // カメラの初期化
  const initCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (mounted.current && videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve)
          }
        })

        setIsRecording(true)
        setError(null)
      }
    } catch (error) {
      console.error("Camera initialization failed:", error)
      if (mounted.current) {
        setError("カメラの起動に失敗しました")
      }
    }
  }, [facingMode])

  // ストレージの確認
  useEffect(() => {
    if (!photoStorage.verify()) {
      setError("ストレージが利用できません")
    }
    return () => {
      mounted.current = false
    }
  }, [])

  // カメラの初期化と後処理
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (mounted.current) {
          initCamera()
          setIsTransitioning(false)
        }
      },
      location.state?.fromRules ? 1000 : 0,
    )

    return () => {
      clearTimeout(timer)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [location.state, initCamera])

  // タイマー処理
  useEffect(() => {
    if (timeRemaining > 0 && !isTransitioning) {
      const timer = setInterval(() => {
        if (mounted.current) {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              setConfirmMessage("せいげんじかんになりました\nほうこくがめんにうつります")
              setShowConfirmDialog(true)
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, isTransitioning])

  // サムネイルタイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (thumbnailTimer.current) {
        clearTimeout(thumbnailTimer.current)
      }
    }
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current || photosRemaining <= 0 || isProcessing) return

    try {
      setIsProcessing(true)

      const shutterAudio = new Audio("/shutter.mp3")
      await shutterAudio.play()

      const canvas = document.createElement("canvas")
      const aspectRatio = 1 / ASPECT_RATIO
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoWidth * aspectRatio
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("キャンバスの作成に失敗しました")
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      const newPhoto = {
        id: Date.now(),
        data: canvas.toDataURL("image/jpeg", 1.0),
        timestamp: new Date().toISOString(),
      }

      const saveSuccess = await photoStorage.save(newPhoto)

      if (!saveSuccess) {
        throw new Error("写真の保存に失敗しました")
      }

      if (mounted.current) {
        setPhotosRemaining((prev) => {
          const remaining = prev - 1
          if (remaining <= 0) {
            setConfirmMessage("フィルムをつかいきりました\nほうこくがめんにうつります")
            setShowConfirmDialog(true)
          }
          return remaining
        })

        setLastPhoto(newPhoto.data)
        setThumbnailVisible(true)

        if (thumbnailTimer.current) {
          clearTimeout(thumbnailTimer.current)
        }

        thumbnailTimer.current = setTimeout(() => {
          if (mounted.current) {
            setThumbnailVisible(false)
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Photo capture failed:", error)
      setError(error.message || "写真の撮影に失敗しました")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReport = () => {
    try {
      const buttonAudio = new Audio("/button.mp3")
      buttonAudio.play()

      const savedPhotos = photoStorage.load()
      if (savedPhotos.length === 0) {
        throw new Error("写真が保存されていません")
      }

      setConfirmMessage("たんさくをおわりますか？")
      setShowConfirmDialog(true)
    } catch (error) {
      console.error("Report initiation failed:", error)
      setError(error.message || "エラーが発生しました")
    }
  }

  const handleConfirmReport = async (confirmed) => {
    if (!confirmed) {
      setShowConfirmDialog(false)
      return
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const overlay = document.createElement("div")
      overlay.className = "transition-overlay"
      document.body.appendChild(overlay)

      const savedPhotos = photoStorage.load()
      if (savedPhotos.length === 0) {
        throw new Error("写真が見つかりません")
      }

      setTimeout(() => {
        overlay.style.opacity = "1"
        setTimeout(() => {
          navigate("/report", {
            replace: true,
            state: { fromTakePhoto: true },
          })
          setTimeout(() => {
            document.body.removeChild(overlay)
          }, 1000)
        }, 1000)
      }, 50)
    } catch (error) {
      console.error("Navigation failed:", error)
      setError(error.message || "エラーが発生しました")
    }
  }

  const handleError = () => {
    setError(null)
    window.location.reload()
  }

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    return seconds <= 10 ? `<span class="text-red">${formattedTime}</span>` : formattedTime
  }

  if (error) {
    return (
      <div className="take-photo-container show">
        <div className="game-window">
          <div className="screen-container">
            <div className="error-dialog">
              <p>{error}</p>
              <button className="action-button" onClick={handleError}>
                もう一度試す
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`take-photo-container ${!isTransitioning ? "show" : ""}`}>
      <div className="game-window">
        <div className="screen-container">
          <div className="camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview"
              style={{
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />
            {isRecording && (
              <div className="camera-overlay">
                <div className="camera-frame">
                  <div className="corner-tl" />
                  <div className="corner-tr" />
                  <div className="corner-bl" />
                  <div className="corner-br" />
                </div>
                <div className="top-info">
                  <div className="timer" dangerouslySetInnerHTML={{ __html: formatTime(timeRemaining) }} />
                  <div className={`photo-count ${photosRemaining <= 10 ? "text-red" : ""}`}>{photosRemaining}</div>
                </div>
                <div className="bottom-info">
                  <div className="left-buttons">
                    <button className="capture-btn report-btn" onClick={handleReport}>
                      ほうこくする
                    </button>
                    <button className="capture-btn switch-camera-btn" onClick={handleSwitchCamera}>
                      <CameraSwitchIcon className="camera-switch-icon" />
                    </button>
                  </div>
                  <button
                    className="capture-btn take-photo-btn"
                    onClick={handleCapture}
                    disabled={photosRemaining <= 0 || isProcessing}
                  >
                    {isProcessing ? "しょり中..." : "しゃしんをとる"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {thumbnailVisible && lastPhoto && (
            <div className="thumbnail-preview fade-out">
              <img src={lastPhoto || "/placeholder.svg"} alt="最後の写真" />
            </div>
          )}

          {showConfirmDialog && (
            <div className="confirm-dialog">
              <div className="confirm-content">
                <p>{confirmMessage}</p>
                <div className="confirm-buttons">
                  {confirmMessage === "たんさくをおわりますか？" ? (
                    <>
                      <button onClick={() => handleConfirmReport(true)}>おわる</button>
                      <button onClick={() => handleConfirmReport(false)}>いいえ</button>
                    </>
                  ) : (
                    <button onClick={() => handleConfirmReport(true)}>はい</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TakePhoto

