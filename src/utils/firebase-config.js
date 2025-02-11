import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Firebase設定のデバッグ用関数
const debugFirebaseConfig = (config) => {
  console.log("=== Firebase Configuration Debug ===")
  console.log("API Key:", config.apiKey ? "設定済み" : "未設定")
  console.log("Auth Domain:", config.authDomain ? "設定済み" : "未設定")
  console.log("Project ID:", config.projectId ? "設定済み" : "未設定")
  console.log("Storage Bucket:", config.storageBucket ? "設定済み" : "未設定")
  console.log("Messaging Sender ID:", config.messagingSenderId ? "設定済み" : "未設定")
  console.log("App ID:", config.appId ? "設定済み" : "未設定")
  console.log("=== End Firebase Configuration Debug ===")

  if (!config.apiKey || !config.storageBucket) {
    throw new Error("Firebase設定が不完全です")
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

// Firebase初期化の検証
try {
  const app = initializeApp(firebaseConfig)
  const storage = getStorage(app)
  console.log("Firebase初期化成功")
} catch (error) {
  console.error("Firebase初期化エラー:", error)
  throw error
}

export default firebaseConfig

