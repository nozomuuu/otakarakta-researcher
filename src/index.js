import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

const container = document.getElementById("root")
const root = createRoot(container)

// エラーバウンダリー
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#1b5e20",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div>エラーが発生しました</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#8bc34a",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

