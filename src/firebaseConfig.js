import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Firebase設定のデバッグと検証用関数
const validateFirebaseConfig = (config) => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  const missingFields = requiredFields.filter((field) => !config[field])

  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(", ")}`)
  }

  // 環境変数の形式を検証
  if (!config.apiKey.startsWith("AIza")) {
    throw new Error("Invalid Firebase API Key format")
  }

  if (!config.authDomain.includes(".firebaseapp.com")) {
    throw new Error("Invalid Firebase Auth Domain format")
  }

  if (!config.storageBucket.includes(".appspot.com")) {
    throw new Error("Invalid Firebase Storage Bucket format")
  }

  return config
}

// Firebase設定
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
    console.error("Firebase configuration error:", error)
    throw error
  }
}

// Firebase初期化とリトライロジック
const initializeFirebase = () => {
  let retryCount = 0
  const maxRetries = 3

  const tryInitialize = () => {
    try {
      const config = getFirebaseConfig()
      const app = initializeApp(config)
      const storage = getStorage(app)

      console.log("Firebase initialized successfully")
      return { app, storage }
    } catch (error) {
      console.error(`Firebase initialization attempt ${retryCount + 1} failed:`, error)

      if (retryCount < maxRetries) {
        retryCount++
        console.log(`Retrying Firebase initialization (${retryCount}/${maxRetries})...`)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(tryInitialize())
          }, 1000 * retryCount) // 指数バックオフ
        })
      }

      throw error
    }
  }

  return tryInitialize()
}

export const firebase = initializeFirebase()
export const firebaseConfig = getFirebaseConfig()

