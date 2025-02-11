import React from "react"

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // 開発環境でのみエラー詳細を表示
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught:", error)
      console.error("Error info:", errorInfo)
    }

    // エラー情報をローカルストレージに保存
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
      const logs = JSON.parse(localStorage.getItem("errorLogs") || "[]")
      logs.push(errorLog)
      localStorage.setItem("errorLogs", JSON.stringify(logs.slice(-10)))
    } catch (e) {
      console.error("Error logging failed:", e)
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state
    if (retryCount < 3) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }))
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const { retryCount } = this.state
      const remainingRetries = 3 - retryCount

      return (
        <div className="error-container">
          <div className="error-content">
            <h2 className="error-title">エラーが発生しました</h2>
            <p className="error-message">
              予期せぬエラーが発生しました
              {remainingRetries > 0 && <span className="retry-info">（残り再試行回数: {remainingRetries}回）</span>}
            </p>
            <button onClick={this.handleRetry} className="retry-button" disabled={retryCount >= 3}>
              {retryCount >= 3 ? "ページを更新" : "再試行"}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

