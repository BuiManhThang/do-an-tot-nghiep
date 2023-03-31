import React, { ReactElement, useEffect, useRef, useState } from 'react'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'

export type MySelectOption = {
  text: string
  value: string | number | boolean | undefined | null
}

type MyTextFieldProps = {
  id: string
  name?: string
  label?: string
  value?: string | number | null | boolean
  options?: MySelectOption[]
  error?: string
  className?: string
  inputStyle?: React.CSSProperties
  required?: boolean
  isHorizontal?: boolean
  isOptionsTop?: boolean
  displayedItems?: number
  isParentLoading?: boolean
  startIcon?: HTMLElement | ReactElement
  onChange?: (selectedOptionValue: string | number | boolean | undefined | null) => void
  onClickStartIcon?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const MySelect = ({
  id,
  name,
  label,
  value,
  options = [],
  error,
  className,
  inputStyle,
  required = false,
  isHorizontal = false,
  isOptionsTop = false,
  displayedItems = 5,
  isParentLoading = false,
  startIcon,
  onChange,
  onClickStartIcon,
}: MyTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(false)
  const [hoverIndex, setHoverIndex] = useState<number>(-1)

  let inputClassName = `h-9 border border-gray-400 rounded-md outline-none ring-primary-ring caret-primary px-3 w-full transition-colors focus:border-primary focus:ring-2 pr-10 cursor-pointer ${
    startIcon ? 'pl-10' : 'pl-3'
  }`

  if (error) {
    inputClassName = `h-9 border border-red-600 rounded-md outline-none ring-red-200 caret-primary pr-10 w-full transition-colors focus:border-red-600 focus:ring-2 pr-16 cursor-pointer ${
      startIcon ? 'pl-10' : 'pl-3'
    }`
  }

  const optionListMaxHeight = `${displayedItems * 36}px`
  const selectedOptionIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedOptionIndex === -1 ? null : options[selectedOptionIndex]
  const selectedOptionText = selectedOption ? selectedOption.text : ''

  useEffect(() => {
    setInputValue(selectedOptionText)
  }, [selectedOptionText])

  if (isParentLoading) {
    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />}
        <MyLoadingSkeleton className="w-full h-9 rounded-md" />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleClickStartIcon = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof onClickStartIcon === 'function') {
      onClickStartIcon(e)
    }
  }

  const handleClickOption = (selectedOption: MySelectOption) => {
    if (typeof onChange === 'function') {
      if (selectedOption.value === value) {
        onChange(null)
        return
      }
      onChange(selectedOption.value)
    }
  }

  const openOptions = () => {
    setIsActive(true)
    if (selectedOptionIndex >= 0) {
      setHoverIndex(selectedOptionIndex)
    } else {
      setHoverIndex(-1)
    }
    inputRef.current?.focus()
  }

  const closeOptions = () => {
    setTimeout(() => {
      setIsActive(false)
    }, 100)
  }

  const handleMouseEnterOption = (option: MySelectOption, index: number) => {
    setHoverIndex(index)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key === 'ArrowDown') {
      e.preventDefault()
      if (!isActive) {
        openOptions()
        return
      }
      const nextIndex = hoverIndex + 1
      if (nextIndex < options.length) {
        setHoverIndex(nextIndex)
      }
    } else if (key === 'ArrowUp') {
      e.preventDefault()
      if (!isActive) {
        openOptions()
        return
      }
      const prevIndex = hoverIndex - 1
      if (prevIndex >= 0) {
        setHoverIndex(prevIndex)
      }
    } else if (key === 'Enter') {
      e.preventDefault()
      if (!isActive) {
        openOptions()
        return
      }
      if (hoverIndex === -1) {
        return
      }
      const newSelectedOption = options[hoverIndex]
      handleClickOption(newSelectedOption)
      closeOptions()
    }
  }

  const toggleOptions = () => {
    if (isActive) {
      closeOptions()
      return
    }
    openOptions()
  }

  return (
    <div className={`flex w-full ${isHorizontal ? 'items-center' : 'flex-col'} ${className}`}>
      {label && (
        <label htmlFor={id} className={`w-max ${isHorizontal ? 'flex-shrink-0 mr-3' : 'mb-1'}`}>
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
          value={inputValue}
          autoComplete="off"
          readOnly={true}
          className={inputClassName}
          style={inputStyle}
          onChange={handleChange}
          onFocus={openOptions}
          onBlur={closeOptions}
          onKeyDown={handleKeyDown}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 right-0 w-9 h-9 flex items-center justify-center cursor-pointer rounded-md border border-transparent overflow-hidden"
          onClick={toggleOptions}
        >
          <div className="w-full h-full flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200">
            <i
              className={`fa-solid fa-chevron-down transition-transform ${
                isActive ? 'rotate-180' : ''
              }`}
            ></i>
          </div>
        </div>
        <div
          className={`absolute z-10 left-0 w-full shadow-custom rounded-md overflow-hidden transition-all ${
            isActive ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-3'
          } ${isOptionsTop ? 'bottom-[calc(100%_+_2px)]' : 'top-[calc(100%_+_2px)]'}`}
        >
          <ul
            className="overflow-auto bg-white w-full"
            style={{
              maxHeight: optionListMaxHeight,
            }}
          >
            {options.map((option, index) => {
              return (
                <li
                  key={`${option.value}`}
                  className={`px-3 h-9 flex items-center cursor-pointer w-full ${
                    selectedOption?.value === option.value
                      ? 'bg-primary text-white font-medium'
                      : ''
                  } ${
                    hoverIndex === index
                      ? selectedOption?.value === option.value
                        ? 'bg-primary-hover'
                        : 'bg-gray-200'
                      : ''
                  }`}
                  onClick={() => handleClickOption(option)}
                  onMouseEnter={() => handleMouseEnterOption(option, index)}
                >
                  <div
                    className="whitespace-nowrap text-ellipsis overflow-hidden w-full"
                    title={option.text}
                  >
                    {option.text}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        {error && (
          <div className="absolute top-1/2 right-10 -translate-y-1/2 group">
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

export default MySelect
