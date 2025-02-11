import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from "nanoid"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "../firebaseConfig"

// Firebase初期化
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export const sharePhoto = {
  async upload(photoData) {
    try {
      // Base64データをBlobに変換
      const base64Response = await fetch(photoData)
      const blob = await base64Response.blob()

      // ファイル名を生成（一意のIDを使用）
      const shareCode = nanoid(6)
      const fileName = `photos/${shareCode}.jpg`

      // Storageの参照を作成
      const storageRef = ref(storage, fileName)

      // メタデータを設定
      const metadata = {
        contentType: "image/jpeg",
        metadata: {
          shareCode: shareCode,
          timestamp: new Date().toISOString(),
        },
      }

      // アップロード実行
      console.log("Uploading photo with metadata:", metadata)
      const snapshot = await uploadBytes(storageRef, blob, metadata)
      console.log("Uploaded photo:", snapshot)

      // ダウンロードURLを取得
      const url = await getDownloadURL(snapshot.ref)
      console.log("Download URL:", url)

      return {
        success: true,
        shareCode,
        url,
      }
    } catch (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },
}

