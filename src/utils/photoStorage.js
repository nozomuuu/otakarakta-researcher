import { db } from "./db"

const COMPRESSION_QUALITY = 0.3
const TARGET_WIDTH = 800

export const photoStorage = {
  async compressImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // 元の画像のアスペクト比を維持
        const targetWidth = TARGET_WIDTH
        const targetHeight = (img.height / img.width) * targetWidth

        canvas.width = targetWidth
        canvas.height = targetHeight

        // 画像を描画
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        resolve(canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY))
      }
      img.src = dataUrl
    })
  },

  async save(photo) {
    try {
      const compressedData = await this.compressImage(photo.data)
      const photoWithCompressedData = {
        ...photo,
        data: compressedData,
      }
      await db.savePhoto(photoWithCompressedData)
      return true
    } catch (error) {
      console.error("Failed to save photo:", error)
      return false
    }
  },

  async load() {
    try {
      const photos = await db.getAllPhotos()
      return photos
    } catch (error) {
      console.error("Failed to load photos:", error)
      return []
    }
  },

  async clear() {
    try {
      await db.clearAllPhotos()
      return true
    } catch (error) {
      console.error("Failed to clear photos:", error)
      return false
    }
  },

  verify() {
    if (!window.indexedDB) {
      console.error("IndexedDB not supported")
      return false
    }
    return true
  },
}

