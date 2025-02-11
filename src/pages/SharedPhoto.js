import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from "nanoid"
import { storage } from "../firebase"

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

      const shareCode = this.generateShareCode()
      console.log("Generated share code:", shareCode)

      const imageBlob = await this.createImageBlob(imageData)
      console.log("Created image blob:", imageBlob.type, imageBlob.size)

      const storageRef = ref(storage, `shared/${shareCode}`)
      console.log("Created storage reference:", storageRef.fullPath)

      const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
          shareCode: shareCode,
          uploadedAt: new Date().toISOString(),
        },
      }

      console.log("Starting upload with metadata:", metadata)
      const uploadResult = await uploadBytes(storageRef, imageBlob, metadata)
      console.log("Upload completed:", uploadResult)

      const downloadURL = await getDownloadURL(uploadResult.ref)
      console.log("Generated download URL:", downloadURL)

      return {
        success: true,
        shareCode,
        url: downloadURL,
      }
    } catch (error) {
      console.error("Upload error:", error)

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

  async download(shareCode) {
    try {
      console.log("Starting download for share code:", shareCode)

      const normalizedCode = shareCode.toUpperCase()
      const storageRef = ref(storage, `shared/${normalizedCode}`)
      console.log("Created storage reference:", storageRef.fullPath)

      const url = await getDownloadURL(storageRef)
      console.log("Generated download URL:", url)

      return {
        success: true,
        url,
      }
    } catch (error) {
      console.error("Download error:", error)

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

