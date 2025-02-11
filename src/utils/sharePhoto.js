import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from "nanoid"
import { getStorageInstance, getFirebaseStatus } from "../firebase"

export const sharePhoto = {
  generateShareCode: () => {
    return nanoid(6).toUpperCase()
  },

  async createImageBlob(imageData) {
    try {
      if (!imageData.startsWith("data:image/")) {
        throw new Error("Invalid image data")
      }

      const base64Data = imageData.split(",")[1]
      const byteCharacters = atob(base64Data)
      const byteArrays = []

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

  async upload(imageData) {
    try {
      console.log("Starting upload process...")

      // ファイルサイズのチェック
      const base64Length = imageData.length - "data:image/jpeg;base64,".length
      const sizeInBytes = base64Length * 0.75
      const sizeInMB = sizeInBytes / (1024 * 1024)

      if (sizeInMB > 5) {
        throw new Error("画像サイズが大きすぎます（5MB以下にしてください）")
      }

      // Firebase初期化状態の確認
      const status = await getFirebaseStatus()
      if (!status.isInitialized) {
        console.error("Firebase initialization status:", status)
        throw new Error(status.error?.message || "Firebaseが正しく初期化されていません")
      }

      // Storageインスタンスの取得
      const storage = await getStorageInstance()
      console.log("Storage instance retrieved")

      const shareCode = this.generateShareCode()
      console.log("Generated share code:", shareCode)

      const imageBlob = await this.createImageBlob(imageData)
      console.log("Created image blob:", {
        type: imageBlob.type,
        size: imageBlob.size,
      })

      // フルパスでの参照作成
      const path = `shared/${shareCode}.jpg`
      const storageRef = ref(storage, path)

      console.log("Storage reference created:", {
        bucket: storage.app.options.storageBucket,
        path,
        fullPath: storageRef.fullPath,
      })

      // メタデータ設定
      const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
          shareCode: shareCode,
          uploadedAt: new Date().toISOString(),
        },
      }

      // アップロード実行
      console.log("Starting upload with metadata:", metadata)
      const uploadResult = await uploadBytes(storageRef, imageBlob, metadata)
      console.log("Upload successful:", uploadResult)

      // ダウンロードURL取得
      const downloadURL = await getDownloadURL(uploadResult.ref)
      console.log("Download URL generated:", downloadURL)

      return {
        success: true,
        shareCode,
        url: downloadURL,
      }
    } catch (error) {
      console.error("Upload failed:", error)

      return {
        success: false,
        error: error.message || "しゃしんのアップロードに失敗しました",
      }
    }
  },

  async download(shareCode) {
    try {
      // Firebase初期化状態の確認
      const status = await getFirebaseStatus()
      if (!status.isInitialized) {
        throw new Error("Firebaseが正しく初期化されていません")
      }

      // Storageインスタンスの取得
      const storage = await getStorageInstance()

      const normalizedCode = shareCode.toUpperCase()
      const storageRef = ref(storage, `shared/${normalizedCode}.jpg`)

      const url = await getDownloadURL(storageRef)
      console.log("Download URL retrieved:", url)

      return {
        success: true,
        url,
      }
    } catch (error) {
      console.error("Download failed:", error)

      let errorMessage = "しゃしんの取得に失敗しました"
      if (error.code === "storage/object-not-found") {
        errorMessage = "しゃしんが見つかりません"
      } else if (error.code === "storage/unauthorized") {
        errorMessage = "アクセス権限がありません"
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  },
}

