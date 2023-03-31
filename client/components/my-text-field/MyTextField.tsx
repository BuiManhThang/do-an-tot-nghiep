import React, { ReactElement, useEffect, useRef } from 'react'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import IMask from 'imask'
import { formatMoney } from '@/common/format'

type MyTextFieldProps = {
  id: string
  name?: string
  label?: string
  placeholder?: string
  value?: string | number
  error?: string
  type?: string
  autoComplete?: string
  className?: string
  inputStyle?: React.CSSProperties
  required?: boolean
  startIcon?: HTMLElement | ReactElement
  endIcon?: HTMLElement | ReactElement
  disabled?: boolean
  inputRef?: React.Ref<HTMLInputElement> | null
  isParentLoading?: boolean
  min?: number
  max?: number
  thousandsSeparator?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClickStartIcon?: (e: React.MouseEvent<HTMLDivElement>) => void
  onClickEndIcon?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const MyTextField = ({
  id,
  name,
  label,
  placeholder,
  value,
  error,
  type = 'text',
  autoComplete = 'off',
  className,
  inputStyle,
  required = false,
  startIcon,
  endIcon,
  isParentLoading = false,
  disabled = false,
  inputRef,
  min,
  max,
  thousandsSeparator = '.',
  onChange,
  onClickStartIcon,
  onClickEndIcon,
}: MyTextFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // useEffect(() => {
  //   if (isParentLoading === false && type === 'number') {
  //     const input: HTMLElement | null | undefined = containerRef.current?.querySelector(`#${id}`)
  //     if (input) {
  //       const mask = IMask(input, {
  //         mask: Number,
  //         min: min,
  //         max: max,
  //         thousandsSeparator: thousandsSeparator,
  //       })
  //     }
  //   }
  // }, [id, isParentLoading, max, min, thousandsSeparator, type])

  if (isParentLoading) {
    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />}
        <MyLoadingSkeleton className="w-full h-9 rounded-md" />
      </div>
    )
  }

  let formattedType = type

  let inputClassName = `h-9 border border-gray-400 rounded-md outline-none ring-primary-ring caret-primary px-3 w-full transition-colors focus:border-primary focus:ring-2 disabled:bg-slate-200 ${
    startIcon ? 'pl-10' : 'pl-3'
  } ${endIcon ? 'pr-10' : ''}`

  if (error) {
    inputClassName = `h-9 border border-red-600 rounded-md outline-none ring-red-200 caret-red-600 w-full transition-colors focus:border-red-600 focus:ring-2 disabled:bg-slate-200 ${
      startIcon ? 'pl-10' : 'pl-3'
    } ${endIcon ? 'pr-16' : 'pr-10'}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div ref={containerRef} className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="w-max mb-1">
          {label}
          {required && <span className="text-red-600 font-medium pl-1">*</span>}
        </label>
      )}
      <div className="w-full relative">
        {startIcon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2" onClick={handleClickStartIcon}>
            <>{startIcon}</>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={formattedType}
          value={value}
          autoComplete={autoComplete}
          className={`${inputClassName} ${type === 'number' ? 'text-right' : ''}`}
          placeholder={placeholder}
          style={inputStyle}
          disabled={disabled}
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

export default MyTextField
