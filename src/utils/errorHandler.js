export const handleFirebaseError = (error) => {
  console.error("Firebaseエラー:", error)

  let userMessage = "エラーが発生しました。"
  let technicalDetails = error.message

  // エラーメッセージの分類
  if (error.message.includes("Storage Bucket")) {
    userMessage = "Firebaseの設定に問題があります。"
    technicalDetails = `
      Storage Bucketの設定を確認してください。
      現在の設定: ${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}
      期待される形式: your-project-id.appspot.com
    `
  } else if (error.message.includes("API Key")) {
    userMessage = "Firebase APIキーの設定に問題があります。"
  } else if (error.message.includes("network")) {
    userMessage = "ネットワーク接続を確認してください。"
  }

  // 開発環境の場合は環境変数の状態を追加
  if (process.env.NODE_ENV === "development") {
    technicalDetails +=
      "\n\n環境変数の状態:\n" +
      JSON.stringify(
        {
          REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY ? "設定済み" : "未設定",
          REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? "設定済み" : "未設定",
          REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID ? "設定済み" : "未設定",
          REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? "設定済み" : "未設定",
        },
        null,
        2,
      )
  }

  return {
    userMessage,
    technicalDetails,
    timestamp: new Date().toISOString(),
  }
}

