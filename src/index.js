import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App"

// エラーハンドリングの追加
const handleError = (error) => {
  console.error("Application Error:", error)
  // エラー画面を表示
  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #0f380f;
      color: #9bbc0f;
      font-family: 'Press Start 2P', cursive;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1>エラーが発生しました</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" style="
          background: none;
          border: 2px solid #9bbc0f;
          color: #9bbc0f;
          padding: 10px 20px;
          margin-top: 20px;
          font-family: 'Press Start 2P', cursive;
          cursor: pointer;
        ">
          再読み込み
        </button>
      </div>
    </div>
  `
}

// アプリケーションの初期化を try-catch で囲む
try {
  const container = document.getElementById("root")
  if (!container) throw new Error("Root element not found")

  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )

  // 初期化完了をログに出力
  console.log("Application initialized successfully")
} catch (error) {
  handleError(error)
}

// グローバルエラーハンドリング
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", { message, source, lineno, colno, error })
  handleError(error || new Error(message))
  return true
}

