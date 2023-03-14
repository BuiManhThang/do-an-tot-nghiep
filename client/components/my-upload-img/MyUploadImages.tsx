import React, { useState } from 'react'
import { useUpload } from '@/hooks/uploadHook'
import Image from 'next/image'
import MyLoadingCircle from '../my-loading-circle/MyLoadingCircle'

type Props = {
  id: string
  name?: string
  label?: string
  value?: string[]
  error?: string
  className?: string
  required?: boolean
  alt?: string
  onChange?: (fileUrl: string[]) => void
}

const MyUploadImages = ({
  id,
  className,
  error,
  label,
  name,
  required,
  value,
  alt,
  onChange,
}: Props) => {
  const { isLoading, uploadFiles } = useUpload()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === 'function') {
      const uploadFileUrls = await uploadFiles(e.target.files)
      if (uploadFileUrls.length) {
        const oldValue = value ? value : []
        onChange([...oldValue, ...uploadFileUrls])
      }
    }
  }

  const removeImage = (imageIndex: number) => {
    if (typeof onChange === 'function') {
      const newImages = value?.filter((_, index) => index !== imageIndex) || []
      onChange(newImages)
    }
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Label */}
      <label htmlFor={isLoading ? '' : id} className="w-max mb-1">
        {label}
        {required && <span className="text-red-600 font-medium pl-1">*</span>}
      </label>

      {/* Main */}
      <div
        className={`relative w-full h-24 flex items-center border rounded-md ring-primary-ring transition-all overflow-auto ${
          error ? 'border-red-600' : 'border-gray-300'
        }`}
      >
        {/* Button */}
        <label
          htmlFor={isLoading ? '' : id}
          title={isLoading ? 'Đang tải' : ''}
          className={`sticky z-[11] left-0 w-[94px] h-full flex items-center shrink-0 bg-white`}
        >
          <div
            className={`ml-2 relative cursor-pointer w-20 h-[70px] flex flex-col items-center justify-center text-white bg-gray-400 rounded-md transition-colors ${
              isLoading ? '' : 'hover:bg-primary'
            }`}
          >
            {isLoading ? (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <MyLoadingCircle />
              </div>
            ) : (
              <>
                <i className="fa-solid fa-plus text-2xl"></i>
                <div className="text-sm">Thêm ảnh</div>
              </>
            )}
          </div>
        </label>

        {/* Images */}
        {value &&
          value.map((image, imageIndex) => (
            <div
              key={imageIndex}
              className="relative border border-gray-300 rounded-md bg-white mr-1 shrink-0 last:mr-0"
            >
              <Image
                src={image}
                alt={alt || ''}
                width={80}
                height={70}
                className="rounded-md w-[80px] h-[70px] object-contain"
              />
              <div
                title="Xóa"
                className="bg-gray-400 text-white absolute w-4 h-4 -top-1 -right-1 flex items-center justify-center rounded-full text-xs cursor-pointer transition-colors hover:bg-red-600 z-10"
                onClick={() => removeImage(imageIndex)}
              >
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>
          ))}

        {/* Input */}
        <input
          hidden
          type="file"
          name={name}
          id={id}
          accept="image/png, image/jpeg, image/jpg"
          multiple
          onChange={handleChange}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="absolute top-0 right-0 group">
          <span className="text-red-600">
            <i className="fa-solid fa-circle-info"></i>
          </span>
          <div className="absolute opacity-0 invisible w-max bottom-full -right-3 bg-white transition-all shadow-custom px-2 py-1 text-sm rounded-md group-hover:opacity-100 group-hover:visible">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyUploadImages
