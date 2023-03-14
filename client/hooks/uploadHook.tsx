import { useState } from 'react'
import { storage } from '../firebase/index'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const useUpload = () => {
  const [isLoading, setIsLoading] = useState(false)

  const uploadFiles = async (files: FileList | null) => {
    setIsLoading(true)
    if (!files) {
      return []
    }
    const storageRef = ref(storage, 'images')
    const uploadList = []
    const filesLength = files.length
    for (let index = 0; index < filesLength; index++) {
      const file = files.item(index)
      if (!file) {
        continue
      }
      const fileRef = ref(storageRef, file?.name)
      uploadList.push(uploadBytes(fileRef, file))
    }

    try {
      const uploadResults = await Promise.all(uploadList)
      const uploadResultsLength = uploadResults.length
      const getfileUrls = []
      for (let index = 0; index < uploadResultsLength; index++) {
        const uploadResult = uploadResults[index]
        getfileUrls.push(getDownloadURL(uploadResult.ref))
      }
      const fileUrls = await Promise.all(getfileUrls)
      return fileUrls
    } catch (error) {
      console.log(error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    uploadFiles,
  }
}
