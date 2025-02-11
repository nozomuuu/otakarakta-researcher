export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="読み込み中">
      <div className="loading-content">
        <div className="loading-spinner" aria-hidden="true" />
        <p>読み込み中...</p>
      </div>
    </div>
  )
}

