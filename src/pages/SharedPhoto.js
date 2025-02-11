"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "../firebaseConfig"

// Firebase初期化
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

const SharedPhoto = () => {
  const { shareCode } = useParams()
  const [photoUrl, setPhotoUrl] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSharedPhoto = async () => {
      try {
        if (!shareCode) {
          throw new Error("共有コードが見つかりません")
        }

        // パスを /shared/ に修正
        const photoRef = ref(storage, `shared/${shareCode}.jpg`)

        // ダウンロードURLを取得
        const url = await getDownloadURL(photoRef)
        console.log("Photo URL:", url)

        setPhotoUrl(url)
        setError(null)
      } catch (err) {
        console.error("Error loading shared photo:", err)
        setError("写真の読み込みに失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadSharedPhoto()
  }, [shareCode])

  // 以下のレンダリング部分は変更なし
  if (isLoading) {
    return (
      <div className="shared-photo-container">
        <div className="game-window">
          <div className="screen-container">
            <div className="message-box">よみこんでいます...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-photo-container">
        <div className="game-window">
          <div className="screen-container">
            <div className="message-box">
              {error}
              <br />
              <small>共有コード: {shareCode}</small>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-photo-container">
      <div className="game-window">
        <div className="screen-container">
          <div className="content-area">
            <div className="message-box">共有された写真</div>
            <div className="photo-display-area">
              <img src={photoUrl || "/placeholder.svg"} alt="共有された写真" className="shared-photo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedPhoto

