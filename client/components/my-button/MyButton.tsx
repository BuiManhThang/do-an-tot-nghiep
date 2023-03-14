import React, { ReactElement } from 'react'

export enum MyButtonType {
  Primary = 1,
  Secondary = 2,
}

type MyButtonProps = {
  text?: string
  title?: string
  type?: MyButtonType
  className?: string
  startIcon?: HTMLElement | ReactElement
  endIcon?: HTMLElement | ReactElement
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const MyButton = ({
  text,
  title,
  className,
  startIcon,
  endIcon,
  type = MyButtonType.Primary,
  onClick,
}: MyButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  if (type === MyButtonType.Secondary) {
    return (
      <button
        title={title}
        className={`${className} outline-none bg-white border-secondary border hover:bg-secondary-hover focus:bg-secondary-hover focus:ring-2 ring-secondary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-secondary leading-none min-w-fit`}
        onClick={handleClick}
      >
        <>
          {startIcon && startIcon}
          {text && (
            <span className={`${startIcon ? 'pl-2' : ''} ${endIcon ? 'pr-2' : ''}`}>{text}</span>
          )}
          {endIcon && endIcon}
        </>
      </button>
    )
  }
  return (
    <button
      title={title}
      className={`${className} outline-none bg-primary hover:bg-primary-hover focus:bg-primary-hover focus:ring-2 ring-primary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md text-white leading-none min-w-fit`}
      onClick={handleClick}
    >
      <>
        {startIcon && startIcon}
        {text && (
          <span className={`${startIcon ? 'pl-2' : ''} ${endIcon ? 'pr-2' : ''}`}>{text}</span>
        )}
        {endIcon && endIcon}
      </>
    </button>
  )
}

export default MyButton
