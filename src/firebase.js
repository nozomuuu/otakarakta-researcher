import { initializeApp } from "firebase/app";
import { getStorage as getFirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig } from "./utils/firebase-config";

// Firebase初期化の状態管理
let app = null;
let storage = null;
let initializationError = null;

const initializeFirebase = async () => {
  try {
    // 設定値の検証
    if (!firebaseConfig.apiKey || !firebaseConfig.storageBucket) {
      throw new Error(`Required Firebase configuration is missing:
        apiKey: ${!!firebaseConfig.apiKey}
        storageBucket: ${!!firebaseConfig.storageBucket}
      `);
    }

    // Firebase初期化
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully with config:", {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });

    // Storage初期化
    storage = getFirebaseStorage(app);

    // Storage初期化の検証
    if (!storage || !storage.app || !storage.app.options.storageBucket) {
      throw new Error(`Firebase Storage initialization failed:
        storage: ${!!storage}
        app: ${!!storage?.app}
        bucket: ${storage?.app?.options?.storageBucket}
      `);
    }

    // 開発環境の場合はエミュレーターに接続
    if (process.env.NODE_ENV === "development") {
      connectStorageEmulator(storage, "localhost", 9199);
      console.log("Connected to Firebase Storage emulator");
    }

    console.log("Firebase Storage initialized successfully with bucket:", storage.app.options.storageBucket);

    return { success: true };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    initializationError = error;
    return { success: false, error };
  }
};

// 初期化実行
const initializationPromise = initializeFirebase();

// 初期化状態の確認関数
export const getFirebaseStatus = async () => {
  const initResult = await initializationPromise;
  return {
    isInitialized: initResult.success,
    error: initializationError,
    storageBucket: storage?.app?.options?.storageBucket,
    config: {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey ? "[REDACTED]" : undefined,
    },
  };
};

// ストレージの取得関数
export const getStorageInstance = async () => {
  const status = await getFirebaseStatus();
  if (!status.isInitialized) {
    throw new Error("Firebase Storage is not initialized");
  }
  return storage;
};

export { storage };