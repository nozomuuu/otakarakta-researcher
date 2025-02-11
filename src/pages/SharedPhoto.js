"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sharePhoto } from "../utils/sharePhoto"
import "./SharedPhoto.css"

export default function SharedPhoto() {
  const [code, setCode] = useState("")
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code || code.length !== 6) return

    try {
      setIsLoading(true)
      setError(null)

      const result = await sharePhoto.download(code)

      if (result.success) {
        setPhoto(result.url)
      } else {
        throw new Error(result.error || "しゃしんの取得に失敗しました")
      }
    } catch (error) {
      console.error("Download failed:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (!photo) return
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${photo}" alt="Shared photo" />
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="shared-photo-container">
      <div className="game-window">
        <div className="screen-container">
          <div className="content-area">
            <h2>きょうゆうされた しゃしん</h2>

            {!photo ? (
              <form onSubmit={handleSubmit} className="code-form">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="きょうゆうコードを にゅうりょく"
                  maxLength={6}
                  className="code-input"
                />
                <button type="submit" className="action-button" disabled={isLoading || code.length !== 6}>
                  {isLoading ? "よみこみちゅう..." : "けんさく"}
                </button>
              </form>
            ) : (
              <div className="photo-display">
                <img src={photo || "/placeholder.svg"} alt="Shared photo" className="shared-image" />
                <div className="button-container">
                  <button onClick={handlePrint} className="action-button">
                    プリントする
                  </button>
                  <button onClick={() => setPhoto(null)} className="action-button">
                    べつのしゃしんをさがす
                  </button>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button onClick={() => navigate("/")} className="action-button">
              ホームにもどる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

