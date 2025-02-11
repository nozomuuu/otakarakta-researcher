"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCamera } from "../hooks/useCamera"
import { CameraSwitchIcon } from "../components/icons/CameraSwitch"
import { Toast } from "../components/Toast"
import "./TakePhoto.css"

const THUMBNAIL_DISPLAY_TIME = 3000
const MAX_PHOTOS = 60
const TIME_LIMIT = 10 * 60 * 1000 // 10分

const TakePhoto = () => {
  const { state: cameraState, videoRef, initializeCamera, capturePhoto, switchCamera } = useCamera()
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState({
    isTransitioning: true,
    remainingTime: TIME_LIMIT,
    showConfirmDialog: false,
    showThumbnail: false,
    thumbnailPhoto: null,
    photoCount: 0,
    photos: [],
  })

  // タイマー処理
  useEffect(() => {
    let timer
    if (!state.isTransitioning && !cameraState.isInitializing && state.remainingTime > 0) {
      timer = setInterval(() => {
        setState((prev) => {
          const newTime = prev.remainingTime - 1000
          if (newTime <= 0) {
            handleTimeUp()
            return { ...prev, remainingTime: 0 }
          }
          return { ...prev, remainingTime: newTime }
        })
      }, 1000)
    }

    return () => timer && clearInterval(timer)
  }, [state.isTransitioning, cameraState.isInitializing, state.remainingTime])

  // 初期化
  useEffect(() => {
    const timer = setTimeout(
      () => {
        initializeCamera()
        setState((prev) => ({ ...prev, isTransitioning: false }))
      },
      location.state?.fromRules ? 1000 : 0,
    )

    return () => clearTimeout(timer)
  }, [location.state, initializeCamera])

  // 写真撮影
  const handleCapture = useCallback(async () => {
    if (state.photoCount >= MAX_PHOTOS) return

    try {
      const photoData = await capturePhoto()
      if (!photoData) return

      const audio = new Audio("/shutter.mp3")
      await audio.play().catch(console.error)

      const newPhoto = {
        id: Date.now(),
        data: photoData,
        timestamp: new Date().toISOString(),
      }

      setState((prev) => {
        const updatedPhotos = [...prev.photos, newPhoto]
        localStorage.setItem("photos", JSON.stringify(updatedPhotos))

        if (updatedPhotos.length >= MAX_PHOTOS) {
          navigate("/report", { state: { reason: "max-photos" } })
        }

        return {
          ...prev,
          photos: updatedPhotos,
          photoCount: updatedPhotos.length,
          showThumbnail: true,
          thumbnailPhoto: photoData,
        }
      })

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          showThumbnail: false,
          thumbnailPhoto: null,
        }))
      }, THUMBNAIL_DISPLAY_TIME)
    } catch (error) {
      console.error("Failed to capture photo:", error)
      Toast.show("写真の撮影に失敗しました")
    }
  }, [state.photoCount, capturePhoto, navigate])

  // 制限時間終了
  const handleTimeUp = useCallback(() => {
    if (state.photoCount > 0) {
      navigate("/report", { state: { reason: "time-up" } })
    }
  }, [state.photoCount, navigate])

  // 報告処理
  const handleReport = useCallback(() => {
    if (state.photoCount === 0) return
    setState((prev) => ({ ...prev, showConfirmDialog: true }))
  }, [state.photoCount])

  // 確認ダイアログ
  const handleConfirm = useCallback(
    (confirmed) => {
      if (confirmed) {
        navigate("/report", { state: { reason: "manual" } })
      } else {
        setState((prev) => ({ ...prev, showConfirmDialog: false }))
      }
    },
    [navigate],
  )

  // 時間フォーマット
  const formatTime = useCallback((ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  // エラー表示
  if (cameraState.error && cameraState.retryCount >= 3) {
    return (
      <div className="take-photo-container show">
        <div className="game-window">
          <div className="screen-container">
            <div className="error-message">
              <p>{cameraState.error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                もう一度試す
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ローディング表示
  if (cameraState.isInitializing) {
    return (
      <div className="take-photo-container show">
        <div className="game-window">
          <div className="screen-container">
            <div className="loading-message">
              <div className="loading-spinner"></div>
              カメラを準備中...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`take-photo-container ${!state.isTransitioning ? "show" : ""}`}>
      <div className="game-window">
        <div className="screen-container">
          <div className="camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
              style={{
                transform: cameraState.facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />
            <div className="camera-overlay">
              <div className="camera-frame">
                <div className="corner-tl" />
                <div className="corner-tr" />
                <div className="corner-bl" />
                <div className="corner-br" />
              </div>
              <div className="top-info">
                <div className="timer">{formatTime(state.remainingTime)}</div>
                <div className="photo-count">
                  {state.photoCount} / {MAX_PHOTOS}
                </div>
              </div>
              <div className="bottom-info">
                <button className="capture-btn report-btn" onClick={handleReport} disabled={state.photoCount === 0}>
                  ほうこくする
                </button>
                <button className="capture-btn switch-camera-btn" onClick={switchCamera}>
                  <CameraSwitchIcon className="camera-switch-icon" />
                </button>
                <button className="capture-btn" onClick={handleCapture} disabled={state.photoCount >= MAX_PHOTOS}>
                  しゃしんをとる
                </button>
              </div>
            </div>

            {state.showThumbnail && state.thumbnailPhoto && (
              <div className="thumbnail-preview">
                <img src={state.thumbnailPhoto || "/placeholder.svg"} alt="最新の写真" className="thumbnail" />
              </div>
            )}
          </div>

          {state.showConfirmDialog && (
            <div className="confirm-dialog">
              <div className="confirm-content">
                <p>ほうこくを始めますか？</p>
                <div className="confirm-buttons">
                  <button onClick={() => handleConfirm(true)}>はい</button>
                  <button onClick={() => handleConfirm(false)}>いいえ</button>
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

