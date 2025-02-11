import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from "nanoid"
import { storage } from "../firebase"

export const sharePhoto = {
  // 6文字の共有コードを生成
  generateShareCode: () => {
    return nanoid(6)
  },

  // 画像データをBlobに変換
  async createImageBlob(imageData) {
    try {
      // Base64ヘッダーを確認
      if (!imageData.startsWith("data:image/")) {
        throw new Error("Invalid image data")
      }

      // Base64データを抽出
      const base64Data = imageData.split(",")[1]
      const byteCharacters = atob(base64Data)
      const byteArrays = []

      // バイトデータに変換
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }

      return new Blob(byteArrays, { type: "image/jpeg" })
    } catch (error) {
      console.error("Error creating blob:", error)
      throw new Error("画像データの変換に失敗しました")
    }
  },

  // 画像をアップロードして共有コードを返す
  async upload(imageData) {
    let uploadTask = null

    try {
      console.log("Starting upload process...")

      // 共有コードを生成
      const shareCode = this.generateShareCode()
      console.log("Generated share code:", shareCode)

      // Blobを作成
      const imageBlob = await this.createImageBlob(imageData)
      console.log("Created image blob:", imageBlob.type, imageBlob.size)

      // ストレージの参照を作成
      const storageRef = ref(storage, `shared/${shareCode}`)
      console.log("Created storage reference:", storageRef.fullPath)

      // アップロードオプションを設定
      const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
          shareCode: shareCode,
          uploadedAt: new Date().toISOString(),
        },
      }

      // 画像をアップロード
      console.log("Starting upload with metadata:", metadata)
      uploadTask = await uploadBytes(storageRef, imageBlob, metadata)
      console.log("Upload completed:", uploadTask)

      // ダウンロードURLを取得
      const downloadURL = await getDownloadURL(uploadTask.ref)
      console.log("Generated download URL:", downloadURL)

      // アップロードを検証
      const verifyResponse = await fetch(downloadURL, {
        method: "HEAD",
        mode: "cors",
      })

      if (!verifyResponse.ok) {
        throw new Error("アップロードの検証に失敗しました")
      }

      return {
        success: true,
        shareCode,
        url: downloadURL,
      }
    } catch (error) {
      console.error("Upload error:", error)

      // エラーの種類に応じてメッセージを設定
      let errorMessage = "しゃしんのアップロードに失敗しました"
      if (error.code === "storage/unauthorized") {
        errorMessage = "アップロード権限がありません"
      } else if (error.code === "storage/canceled") {
        errorMessage = "アップロードがキャンセルされました"
      } else if (error.code === "storage/unknown") {
        errorMessage = "予期せぬエラーが発生しました"
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  // 共有コードから画像を取得
  async download(shareCode) {
    try {
      console.log("Starting download for share code:", shareCode)

      // ストレージの参照を作成
      const storageRef = ref(storage, `shared/${shareCode}`)
      console.log("Created storage reference:", storageRef.fullPath)

      // ダウンロードURLを取得
      const url = await getDownloadURL(storageRef)
      console.log("Generated download URL:", url)

      // URLの有効性を確認
      const response = await fetch(url, {
        method: "HEAD",
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error("しゃしんが見つかりません")
      }

      // Content-Typeを確認
      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("不正なファイル形式です")
      }

      return {
        success: true,
        url,
      }
    } catch (error) {
      console.error("Download error:", error)

      // エラーの種類に応じてメッセージを設定
      let errorMessage = "しゃしんの取得に失敗しました"
      if (error.code === "storage/object-not-found") {
        errorMessage = "しゃしんが見つかりません"
      } else if (error.code === "storage/unauthorized") {
        errorMessage = "アクセス権限がありません"
      } else if (error.code === "storage/canceled") {
        errorMessage = "ダウンロードがキャンセルされました"
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  },
}

