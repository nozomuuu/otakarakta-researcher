// IndexedDBを使用して写真を保存するためのユーティリティ
const DB_NAME = "otakarakuta_photos"
const STORE_NAME = "photos"
const DB_VERSION = 1

export const db = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" })
        }
      }
    })
  },

  async savePhoto(photo) {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(photo)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async getAllPhotos() {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async clearAllPhotos() {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },
}

