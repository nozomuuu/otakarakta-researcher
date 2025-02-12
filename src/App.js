"use client"

import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// 環境変数チェック関数
const checkEnvironmentVariables = () => {
  const requiredVars = [
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "REACT_APP_FIREBASE_PROJECT_ID",
    "REACT_APP_FIREBASE_STORAGE_BUCKET",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "REACT_APP_FIREBASE_APP_ID",
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
  }

  console.log("All required environment variables are set")
  return true
}

// Firebase設定のバリデーション
const validateFirebaseConfig = (config) => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  const missingFields = requiredFields.filter((field) => !config[field])
  if (missingFields.length > 0) {
    throw new Error(`Missing Firebase configuration fields: ${missingFields.join(", ")}`)
  }

  console.log("Firebase configuration is valid")
  return config
}

// Firebase設定
const getFirebaseConfig = () => {
  try {
    checkEnvironmentVariables()

    return validateFirebaseConfig({
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    })
  } catch (error) {
    console.error("Firebase configuration error:", error)
    throw error
  }
}

// デバッグ情報を収集する関数
const collectDebugInfo = () => {
  return {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    browserInfo: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    // Firebase設定の一部（機密情報は除く）
    firebaseConfig: {
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    },
    // 環境変数の存在確認（値は表示しない）
    envVarsSet: {
      REACT_APP_FIREBASE_API_KEY: !!process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_STORAGE_BUCKET: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      REACT_APP_FIREBASE_APP_ID: !!process.env.REACT_APP_FIREBASE_APP_ID,
      REACT_APP_FIREBASE_MEASUREMENT_ID: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    },
  }
}

function App() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [initAttempts, setInitAttempts] = useState(0)
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log("Starting Firebase initialization...")

        const envStatus = {
          apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? "設定済み" : "未設定",
          authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? "設定済み" : "未設定",
          projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? "設定済み" : "未設定",
          storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? "設定済み" : "未設定",
          messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? "設定済み" : "未設定",
          appId: process.env.REACT_APP_FIREBASE_APP_ID ? "設定済み" : "未設定",
        }
        setDebugInfo((prevInfo) => ({ ...prevInfo, envStatus }))
        console.log("Environment variables status:", envStatus)

        const config = getFirebaseConfig()
        console.log("Firebase configuration loaded")

        const app = initializeApp(config)
        const storage = getStorage(app)
        console.log("Firebase initialized successfully")

        // デバッグ情報を収集して設定
        const debugInfo = collectDebugInfo()
        setDebugInfo((prevInfo) => ({
          ...prevInfo,
          ...debugInfo,
          firebaseStatus: "initialized",
        }))

        console.log("Debug info:", debugInfo)

        setInitialized(true)
      } catch (err) {
        console.error("Firebase initialization error:", err)
        setError(err.message)

        // エラー時のデバッグ情報を設定
        const errorDebugInfo = collectDebugInfo()
        setDebugInfo((prevInfo) => ({
          ...prevInfo,
          ...errorDebugInfo,
          error: err.message,
          errorStack: err.stack,
        }))

        console.error("Error debug info:", errorDebugInfo)

        if (initAttempts < 3) {
          console.log(`Retrying initialization... (${initAttempts + 1}/3)`)
          setInitAttempts((prev) => prev + 1)
          setTimeout(initializeFirebase, 1000 * (initAttempts + 1))
        }
      }
    }

    initializeFirebase()
  }, [initAttempts])

  if (error) {
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
          <div>初期化エラー</div>
          <small>{error}</small>
          <pre
            style={{
              fontSize: "0.8rem",
              marginTop: "1rem",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          {initAttempts < 3 && (
            <button
              onClick={() => setInitAttempts((prev) => prev + 1)}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#4CAF50",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              再試行
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!initialized) {
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
          }}
        >
          よみこんでいます...
          {initAttempts > 0 && <div>再試行中... ({initAttempts}/3)</div>}
        </div>
      </div>
    )
  }

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
        }}
      >
        <div>初期化完了</div>
        <pre
          style={{
            fontSize: "0.8rem",
            marginTop: "1rem",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default App

