// Firebase設定のデバッグ用関数
const debugFirebaseConfig = (config) => {
  console.log("=== Firebase Configuration Debug ===")
  console.log("API Key:", config.apiKey)
  console.log("Auth Domain:", config.authDomain)
  console.log("Project ID:", config.projectId)
  console.log("Storage Bucket:", config.storageBucket)
  console.log("Messaging Sender ID:", config.messagingSenderId)
  console.log("App ID:", config.appId)
  console.log("=== End Firebase Configuration Debug ===")

  // 必須項目のチェック
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  const missingFields = requiredFields.filter((field) => !config[field])
  if (missingFields.length > 0) {
    console.error("Missing required Firebase configuration fields:", missingFields)
  }

  return config
}

// Firebase設定
export const firebaseConfig = debugFirebaseConfig({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
})

// 設定値の検証
if (!firebaseConfig.apiKey || !firebaseConfig.storageBucket) {
  console.error("Firebase configuration is incomplete:", {
    apiKey: !!firebaseConfig.apiKey,
    storageBucket: !!firebaseConfig.storageBucket,
    envVars: {
      REACT_APP_FIREBASE_API_KEY: !!process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_STORAGE_BUCKET: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    },
  })
}

// 開発用のログ出力
if (process.env.NODE_ENV === "development") {
  console.log("Current environment:", process.env.NODE_ENV)
  console.log("Available environment variables:", {
    REACT_APP_FIREBASE_API_KEY: !!process.env.REACT_APP_FIREBASE_API_KEY,
    REACT_APP_FIREBASE_AUTH_DOMAIN: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    REACT_APP_FIREBASE_PROJECT_ID: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
    REACT_APP_FIREBASE_STORAGE_BUCKET: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    REACT_APP_FIREBASE_APP_ID: !!process.env.REACT_APP_FIREBASE_APP_ID,
  })
}

