import { db } from "./db"

// 圧縮設定を調整
const COMPRESSION_QUALITY = 0.5 // 50%に品質を向上
const TARGET_WIDTH = 1200 // より高解像度に対応

export const photoStorage = {
  async compressImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // アスペクト比を維持したまま、指定サイズにリサイズ
        const aspectRatio = img.height / img.width
        const targetWidth = TARGET_WIDTH
        const targetHeight = targetWidth * aspectRatio

        canvas.width = targetWidth
        canvas.height = targetHeight

        // 画質を維持するための設定を追加
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // 画像を描画
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // ファイルサイズをチェック
        const compressedData = canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY)

        // Base64データのサイズを計算（おおよその値）
        const base64Length = compressedData.length - "data:image/jpeg;base64,".length
        const sizeInBytes = base64Length * 0.75
        const sizeInMB = sizeInBytes / (1024 * 1024)

        // 5MB制限を超える場合は、さらに圧縮
        if (sizeInMB > 4.5) {
          // 余裕を持って4.5MBで判定
          resolve(canvas.toDataURL("image/jpeg", 0.3)) // より強い圧縮を適用
        } else {
          resolve(compressedData)
        }
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

