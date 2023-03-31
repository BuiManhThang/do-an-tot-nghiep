import React, { useState } from 'react'
import { useUpload } from '@/hooks/uploadHook'
import Image from 'next/image'
import MyLoadingCircle from '../my-loading-circle/MyLoadingCircle'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'

type MyUploadThumbnailProps = {
  id: string
  name?: string
  label?: string
  value?: string
  error?: string
  className?: string
  required?: boolean
  isParentLoading?: boolean
  isShowRemoveBtn?: boolean
  isShowChangeBtn?: boolean
  width?: number
  height?: number
  alt?: string
  onChange?: (fileUrl: string) => void
}

const MyUploadThumbnail = ({
  id,
  className,
  error,
  label,
  name,
  required,
  isParentLoading,
  isShowRemoveBtn = true,
  isShowChangeBtn = false,
  value,
  width,
  height,
  alt,
  onChange,
}: MyUploadThumbnailProps) => {
  const { isLoading, uploadFiles } = useUpload()
  const [isDragOver, setIsDragOver] = useState(false)

  if (isParentLoading) {
    return (
      <div className={`w-full h-full ${className}`}>
        {label && <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />}
        <MyLoadingSkeleton
          className={`relative w-full h-full rounded-md`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      </div>
    )
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === 'function') {
      const uploadFileUrls = await uploadFiles(e.target.files)
      if (uploadFileUrls.length) {
        onChange(uploadFileUrls[0])
      }
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    setIsDragOver(false)
    if (typeof onChange === 'function') {
      const uploadFileUrls = await uploadFiles(files)
      if (uploadFileUrls.length) {
        onChange(uploadFileUrls[0])
      }
    }
  }

  const removeImage = () => {
    if (typeof onChange === 'function') {
      onChange('')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (value) {
      return
    }
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    if (value) {
      return
    }
    setIsDragOver(false)
  }

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={isLoading ? '' : id} className="w-max mb-1 inline-block">
          {label}
          {required && <span className="text-red-600 font-medium pl-1">*</span>}
        </label>
      )}

      {/* Main */}
      <div
        className={`relative w-full h-full  border rounded-md ring-primary-ring transition-all ${
          value
            ? 'border-gray-300'
            : isDragOver
            ? 'border-primary ring-2'
            : error
            ? 'border-red-600 border-dashed'
            : 'border-gray-300 border-dashed'
        }`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Empty */}
        {!value && (
          <div
            className={`flex flex-col justify-center items-center w-full h-full`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-primary text-6xl">
              <i className="fa-solid fa-images"></i>
            </div>
            <div className="my-2">
              {isDragOver ? (
                <span>Thả ra để tải lên</span>
              ) : (
                <>
                  Kéo thả hoặc{' '}
                  <label
                    htmlFor={isLoading ? '' : id}
                    className="text-primary cursor-pointer hover:underline"
                  >
                    duyệt
                  </label>{' '}
                  hình ảnh
                </>
              )}
            </div>
            <div className="text-gray-500 text-sm">Cho phép: JPEG, JPG, PNG</div>
          </div>
        )}

        {/* Image */}
        {value && (
          <>
            <Image
              src={value}
              alt={alt || ''}
              width={width}
              height={height}
              style={{
                width: width ? `${width - 2}px` : undefined,
                height: height ? `${height - 2}px` : undefined,
              }}
              className="rounded-md object-contain object-center"
            />
            {isShowRemoveBtn && (
              <div
                title="Xóa"
                className="bg-gray-400 text-white absolute w-4 h-4 -top-2 -right-2 flex items-center justify-center rounded-full text-xs cursor-pointer transition-colors hover:bg-red-600"
                onClick={removeImage}
              >
                <i className="fa-solid fa-xmark"></i>
              </div>
            )}
            {isShowChangeBtn && !isLoading && (
              <label
                htmlFor={id}
                title="Chuyển"
                className="bg-gray-400 text-white absolute w-6 h-6 -bottom-2 -right-2 flex items-center justify-center rounded-full text-xs cursor-pointer transition-colors hover:bg-primary"
              >
                <i className="fa-solid fa-pencil"></i>
              </label>
            )}
          </>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm rounded-md">
            <MyLoadingCircle type="primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute top-3 right-3 group">
            <span className="text-red-600">
              <i className="fa-solid fa-circle-info"></i>
            </span>
            <div className="absolute opacity-0 invisible w-max bottom-full -right-3 bg-white transition-all shadow-custom px-2 py-1 text-sm rounded-md group-hover:opacity-100 group-hover:visible">
              {error}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          hidden
          type="file"
          name={name}
          id={id}
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

export default MyUploadThumbnail
