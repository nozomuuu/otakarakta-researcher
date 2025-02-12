import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from "nanoid"
import { firebase } from "./firebase-config"

const storage = getStorage(firebase.app)

export const sharePhoto = {
  async upload(photoData) {
    try {
      // Base64データをBlobに変換
      const base64Response = await fetch(photoData)
      const blob = await base64Response.blob()

      // ファイル名を生成（一意のIDを使用）
      const shareCode = nanoid(6)
      const fileName = `shared/${shareCode}.jpg`

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
      console.log("写真をアップロード中...", metadata)
      const snapshot = await uploadBytes(storageRef, blob, metadata)
      console.log("アップロード完了:", snapshot)

      // ダウンロードURLを取得
      const url = await getDownloadURL(snapshot.ref)
      console.log("ダウンロードURL:", url)

      return {
        success: true,
        shareCode,
        url,
      }
    } catch (error) {
      console.error("アップロードエラー:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },
}

