import React, { ReactElement } from 'react'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'

type Props = {
  id: string
  name?: string
  label?: string
  placeholder?: string
  value?: string | number
  error?: string
  type?: string
  autoComplete?: string
  className?: string
  labelClassName?: string
  inputStyle?: React.CSSProperties
  required?: boolean
  height?: number
  startIcon?: HTMLElement | ReactElement
  endIcon?: HTMLElement | ReactElement
  isParentLoading?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onClickStartIcon?: (e: React.MouseEvent<HTMLDivElement>) => void
  onClickEndIcon?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const MyTextArea = ({
  id,
  name,
  label,
  placeholder,
  value,
  error,
  autoComplete = 'off',
  className,
  labelClassName,
  inputStyle,
  required = false,
  startIcon,
  endIcon,
  height,
  isParentLoading = false,
  disabled = false,
  onChange,
  onClickStartIcon,
  onClickEndIcon,
}: Props) => {
  if (isParentLoading) {
    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />}
        <MyLoadingSkeleton
          className="w-full"
          style={{ height: height ? `${height}px` : undefined }}
        />
      </div>
    )
  }

  let inputClassName = `h-9 border border-gray-400 rounded-md outline-none ring-primary-ring caret-primary px-3 w-full transition-colors focus:border-primary focus:ring-2 py-2 disabled:bg-slate-200 ${
    startIcon ? 'pl-10' : 'pl-3'
  } ${endIcon ? 'pr-10' : ''}`

  if (error) {
    inputClassName = `h-9 border border-red-600 rounded-md outline-none ring-red-200 caret-red-600 w-full transition-colors focus:border-red-600 focus:ring-2 py-2 disabled:bg-slate-200 ${
      startIcon ? 'pl-10' : 'pl-3'
    } ${endIcon ? 'pr-16' : 'pr-10'}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typeof onChange === 'function') {
      onChange(e)
    }
  }

  const handleClickStartIcon = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof onClickStartIcon === 'function') {
      onClickStartIcon(e)
    }
  }

  const handleClickEndIcon = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof onClickEndIcon === 'function') {
      onClickEndIcon(e)
    }
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={id} className={`w-max mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-600 font-medium pl-1">*</span>}
        </label>
      )}
      <div className="w-full relative" style={{ height: height ? `${height}px` : undefined }}>
        {startIcon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2" onClick={handleClickStartIcon}>
            <>{startIcon}</>
          </div>
        )}
        <textarea
          id={id}
          name={name}
          value={value}
          autoComplete={autoComplete}
          className={inputClassName + 'resize-none'}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            ...inputStyle,
            height: height ? `${height}px` : undefined,
          }}
          onChange={handleChange}
        />
        {endIcon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${error ? 'right-10' : 'right-3'}`}
            onClick={handleClickEndIcon}
          >
            <>{endIcon}</>
          </div>
        )}
        {error && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 group">
            <span className="text-red-600">
              <i className="fa-solid fa-circle-info"></i>
            </span>
            <div className="absolute opacity-0 invisible w-max bottom-full -right-3 bg-white transition-all shadow-custom px-2 py-1 text-sm rounded-md group-hover:opacity-100 group-hover:visible">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTextArea
