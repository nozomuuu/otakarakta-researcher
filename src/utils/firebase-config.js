import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Firebase設定のデバッグと検証用関数
const validateFirebaseConfig = (config) => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  // 必須フィールドの存在確認
  const missingFields = requiredFields.filter((field) => !config[field])
  if (missingFields.length > 0) {
    throw new Error(`必須のFirebase設定フィールドが不足しています: ${missingFields.join(", ")}`)
  }

  // Storage Bucketの形式を検証
  if (!config.storageBucket.match(/^[a-z0-9-]+\.appspot\.com$/)) {
    throw new Error(`無効なStorage Bucket形式です: ${config.storageBucket}\n` + `正しい形式: project-id.appspot.com`)
  }

  return config
}

// Firebase設定の取得と検証
const getFirebaseConfig = () => {
  try {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    }

    return validateFirebaseConfig(config)
  } catch (error) {
    console.error("Firebase設定エラー:", error)
    throw error
  }
}

// Firebase初期化とリトライロジック
const initializeFirebase = () => {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 1000

  const tryInitialize = async () => {
    try {
      console.log("Firebase初期化を開始します...")
      const config = getFirebaseConfig()
      console.log("Firebase設定を読み込みました")

      const app = initializeApp(config)
      const storage = getStorage(app)

      console.log("Firebaseの初期化に成功しました")
      return { app, storage }
    } catch (error) {
      console.error(`Firebase初期化エラー (試行 ${retryCount + 1}/${maxRetries}):`, error)

      if (retryCount < maxRetries) {
        retryCount++
        console.log(`${retryCount}回目の再試行を開始します...`)
        await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount))
        return tryInitialize()
      }

      throw error
    }
  }

  return tryInitialize()
}

export const firebase = initializeFirebase()
export const firebaseConfig = getFirebaseConfig()

