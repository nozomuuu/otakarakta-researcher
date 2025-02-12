"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { photoStorage } from "../utils/photoStorage"
import { sharePhoto } from "../utils/sharePhoto"
import "./Report.css"

const Report = () => {
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [bestShotIndex, setBestShotIndex] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [shareCode, setShareCode] = useState(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const mounted = useRef(true)
  const scrollRef = useRef(null)

  // 写真の読み込み
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        if (location.state?.fromTakePhoto) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        // IndexedDBから写真を読み込む
        const savedPhotos = await photoStorage.load()
        console.log("Loaded photos:", savedPhotos)

        if (!mounted.current) return

        if (!savedPhotos || savedPhotos.length === 0) {
          throw new Error("写真が見つかりません")
        }

        setPhotos(savedPhotos)
        setError(null)
        setIsLoading(false)

        setTimeout(() => {
          if (mounted.current) {
            setIsTransitioning(false)
          }
        }, 100)
      } catch (err) {
        console.error("Error loading photos:", err)
        if (mounted.current) {
          setError(err.message)
          setIsLoading(false)
          setIsTransitioning(false)
        }
      }
    }

    // 即時実行
    loadPhotos()

    // クリーンアップ関数
    return () => {
      mounted.current = false
    }
  }, [location.state])

  // サムネイルのスクロール処理
  const handleScroll = (direction) => {
    if (!scrollRef.current) return

    const scrollAmount = 120 // サムネイルの幅 + マージン
    const currentScroll = scrollRef.current.scrollLeft
    const targetScroll = currentScroll + (direction === "left" ? -scrollAmount : scrollAmount)

    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })
  }

  const handleThumbnailClick = (index) => {
    new Audio("/button.mp3").play().catch(console.error)
    setSelectedIndex(index)
  }

  const handleSetBestShot = () => {
    new Audio("/button.mp3").play().catch(console.error)
    setBestShotIndex(selectedIndex)
  }

  const handleReturnHome = async () => {
    new Audio("/button.mp3").play().catch(console.error)
    await photoStorage.clear() // 写真を削除
    navigate("/")
  }

  // 共有処理
  const handleShare = async () => {
    if (!photos[bestShotIndex]) return

    try {
      setIsSharing(true)

      // 進捗表示を追加
      const progressDiv = document.createElement("div")
      progressDiv.className = "share-progress"
      progressDiv.textContent = "アップロード中..."
      document.body.appendChild(progressDiv)

      const result = await sharePhoto.upload(photos[bestShotIndex].data)

      if (mounted.current) {
        if (result.success) {
          setShareCode(result.shareCode)
          setShowShareDialog(true)
          console.log("Share successful, URL:", result.url)
        } else {
          throw new Error(result.error || "写真の共有に失敗しました")
        }
      }
    } catch (error) {
      console.error("Share failed:", error)
      if (mounted.current) {
        setError(error.message)
      }
    } finally {
      if (mounted.current) {
        setIsSharing(false)
      }
      // 進捗表示を削除
      const progressDiv = document.querySelector(".share-progress")
      if (progressDiv) {
        progressDiv.remove()
      }
    }
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="report-container">
        <div className="game-window">
          <div className="screen-container">
            <div className="message-box">よみこんでいます...</div>
          </div>
        </div>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="report-container">
        <div className="game-window">
          <div className="screen-container">
            <div className="message-box">
              エラーが発生しました。
              <br />
              もういちどさつえいしてください。
              <br />
              <small>{error}</small>
            </div>
            <button className="action-button" onClick={() => navigate("/takephoto")}>
              さつえいにもどる
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`report-container ${isTransitioning ? "transitioning" : "show"}`}>
      <div className="game-window">
        <div className="screen-container">
          <div className="content-area">
            <div className="message-box">
              おつかれさまでした。けっかをほうこくしましょう。
              <br />
              とったしゃしんのなかからベストショットを１まいえらんでください
            </div>

            <div className="photo-display-area">
              <img src={photos[selectedIndex]?.data || "/placeholder.svg"} alt="選択中の写真" className="main-photo" />
            </div>

            <div className="controls-area">
              <div className="thumbnails-area">
                <button className="nav-button" onClick={() => handleScroll("left")} disabled={selectedIndex === 0}>
                  ＜
                </button>
                <div className="thumbnails-scroll" ref={scrollRef}>
                  <div className="thumbnails-track">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={`thumbnail-wrapper ${index === selectedIndex ? "selected" : ""} ${
                          index === bestShotIndex ? "best-shot" : ""
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <img src={photo.data || "/placeholder.svg"} alt={`写真 ${index + 1}`} className="thumbnail" />
                        <div className="thumbnail-number">{index + 1}</div>
                        {index === bestShotIndex && <div className="star-mark">★</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="nav-button"
                  onClick={() => handleScroll("right")}
                  disabled={selectedIndex === photos.length - 1}
                >
                  ＞
                </button>
              </div>

              <div className="button-container">
                <button className="action-button" onClick={handleSetBestShot}>
                  ベストショットにする
                </button>
                {bestShotIndex !== null && (
                  <button className="action-button share-button" onClick={handleShare} disabled={isSharing}>
                    {isSharing ? "しょり中..." : "きょうゆうする"}
                  </button>
                )}
                <button className="action-button" onClick={handleReturnHome} disabled={bestShotIndex === null}>
                  ほうこくをおわる
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 共有ダイアログ */}
      {showShareDialog && (
        <div className="share-dialog">
          <div className="share-content">
            <h3>きょうゆうコード</h3>
            <div className="share-code">{shareCode}</div>
            <p>
              このコードをつかって、べつのデバイスでしゃしんを
              <br />
              みることができます
            </p>
            <button onClick={() => setShowShareDialog(false)}>とじる</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Report

