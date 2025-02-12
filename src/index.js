import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

// エラーバウンダリーコンポーネント
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("アプリケーションエラー:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="game-window">
            <div className="message-box">
              <h2>エラーが発生しました</h2>
              <p>{this.state.error.message}</p>
              <button className="action-button" onClick={() => window.location.reload()}>
                再読み込み
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

