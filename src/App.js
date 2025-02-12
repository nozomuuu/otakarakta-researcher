"use client"

import { useEffect, useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { firebase } from "./utils/firebase-config"
import { handleFirebaseError } from "./utils/errorHandler"

// 正しいパスからコンポーネントをインポート
import Report from "./pages/Report"
import SharedPhoto from "./pages/SharedPhoto"

function App() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("アプリケーションの初期化を開始...")

        // 環境変数の確認
        const envVars = [
          "REACT_APP_FIREBASE_API_KEY",
          "REACT_APP_FIREBASE_AUTH_DOMAIN",
          "REACT_APP_FIREBASE_PROJECT_ID",
          "REACT_APP_FIREBASE_STORAGE_BUCKET",
          "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
          "REACT_APP_FIREBASE_APP_ID",
        ]

        const missingVars = envVars.filter((varName) => !process.env[varName])
        if (missingVars.length > 0) {
          throw new Error(`必要な環境変数が設定されていません: ${missingVars.join(", ")}`)
        }

        await firebase
        console.log("Firebaseの初期化が完了しました")
        setInitialized(true)
      } catch (error) {
        console.error("初期化エラー:", error)
        const errorInfo = handleFirebaseError(error)
        setError(errorInfo)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (error) {
    return (
      <div className="error-container">
        <div className="game-window">
          <div className="message-box">
            <h2>初期化エラー</h2>
            <p>{error.userMessage}</p>
            {process.env.NODE_ENV === "development" && (
              <pre className="technical-details">{error.technicalDetails}</pre>
            )}
            <button className="action-button" onClick={() => window.location.reload()}>
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="game-window">
          <div className="message-box">よみこんでいます...</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/report" replace />} />
      <Route path="/report" element={initialized ? <Report /> : <Navigate to="/" replace />} />
      <Route path="/shared/:shareCode" element={initialized ? <SharedPhoto /> : <Navigate to="/" replace />} />
      <Route
        path="*"
        element={
          <div className="error-container">
            <div className="game-window">
              <div className="message-box">
                ページが見つかりません
                <button className="action-button" onClick={() => (window.location.href = "/")}>
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App

