import React, { ReactElement } from 'react'
import MyLoadingCircle from '../my-loading-circle/MyLoadingCircle'

export enum MyButtonType {
  Primary = 1,
  Secondary = 2,
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
        className={`relative outline-none bg-white border-secondary border hover:bg-secondary-hover focus:bg-secondary-hover focus:ring-2 ring-secondary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-secondary leading-none min-w-fit ${
          isLoading ? 'cursor-default' : ''
        } ${className}`}
        style={style}
        onClick={handleClick}
      >
        {isLoading ? (
          <MyLoadingCircle />
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
      className={`relative outline-none bg-primary hover:bg-primary-hover focus:bg-primary-hover focus:ring-2 ring-primary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-white leading-none min-w-fit ${
        isLoading ? 'cursor-default' : ''
      } ${className}`}
      style={style}
      onClick={handleClick}
    >
      {isLoading ? (
        <MyLoadingCircle />
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
