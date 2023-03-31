import React, { ReactElement } from 'react'
import MyLoadingCircle from '../my-loading-circle/MyLoadingCircle'

export enum MyButtonType {
  Primary = 1,
  Secondary = 2,
  PrimarySolid = 3,
}

type MyButtonProps = {
  text?: string
  title?: string
  type?: MyButtonType
  className?: string
  style?: React.CSSProperties
  startIcon?: HTMLElement | ReactElement
  endIcon?: HTMLElement | ReactElement
  isLoading?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const MyButton = ({
  text,
  title,
  className,
  style,
  startIcon,
  endIcon,
  isLoading = false,
  disabled = false,
  type = MyButtonType.Primary,
  onClick,
}: MyButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      return
    }
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  if (type === MyButtonType.Secondary) {
    return (
      <button
        title={title}
        className={`relative outline-none border focus:ring-2 bg-white ring-secondary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md leading-none min-w-fit ${
          isLoading ? 'cursor-default' : ''
        } ${
          disabled
            ? 'text-secondary-disabled border-secondary-disabled hover:bg-white focus:bg-white'
            : 'text-secondary border-secondary hover:bg-secondary-hover focus:bg-secondary-hover'
        } ${className}`}
        style={style}
        disabled={disabled}
        onClick={handleClick}
      >
        {isLoading ? (
          <MyLoadingCircle type="primary" size={24} />
        ) : (
          <>
            {startIcon && startIcon}
            {text && (
              <span
                className={`text-center w-full ${startIcon ? 'pl-2' : ''} ${endIcon ? 'pr-2' : ''}`}
              >
                {text}
              </span>
            )}
            {endIcon && endIcon}
          </>
        )}
      </button>
    )
  }
  if (type === MyButtonType.PrimarySolid) {
    return (
      <button
        title={title}
        className={`relative outline-none bg-white border-primary border hover:bg-primary-hover hover:text-white focus:bg-primary-hover focus:text-white focus:ring-2 ring-primary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-primary leading-none min-w-fit ${
          isLoading ? 'cursor-default' : ''
        } ${className}`}
        style={style}
        disabled={disabled}
        onClick={handleClick}
      >
        {isLoading ? (
          <MyLoadingCircle size={24} />
        ) : (
          <>
            {startIcon && startIcon}
            {text && (
              <span
                className={`text-center w-full ${startIcon ? 'pl-2' : ''} ${endIcon ? 'pr-2' : ''}`}
              >
                {text}
              </span>
            )}
            {endIcon && endIcon}
          </>
        )}
      </button>
    )
  }
  return (
    <button
      title={title}
      className={`relative outline-none focus:ring-2 ring-primary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-white leading-none min-w-fit ${
        isLoading ? 'cursor-default' : ''
      } ${
        disabled
          ? 'bg-primary-disabled hover:bg-primary-disabled focus:bg-primary-disabled'
          : 'bg-primary hover:bg-primary-hover focus:bg-primary-hover'
      } ${className}`}
      style={style}
      disabled={disabled}
      onClick={handleClick}
    >
      {isLoading ? (
        <MyLoadingCircle size={24} />
      ) : (
        <>
          {startIcon && startIcon}
          {text && (
            <span
              className={`text-center w-full ${startIcon ? 'pl-2' : ''} ${endIcon ? 'pr-2' : ''}`}
            >
              {text}
            </span>
          )}
          {endIcon && endIcon}
        </>
      )}
    </button>
  )
}

export default MyButton
