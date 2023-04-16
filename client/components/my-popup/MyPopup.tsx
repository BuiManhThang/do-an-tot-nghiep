import React, { useEffect, useRef, useState } from 'react'

type Props = {
  isActive?: boolean
  children?: React.ReactNode[] | React.ReactNode
  title?: string | React.ReactNode | React.ReactNode[]
  footer?: React.ReactNode
  overlayStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  isShowHeader?: boolean
  isCloseWhenClickOverlay?: boolean
  onClose?: () => void
}

const MyPopup = ({
  isActive = false,
  children,
  title,
  footer,
  overlayStyle,
  bodyStyle,
  isShowHeader = true,
  isCloseWhenClickOverlay = false,
  onClose,
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [realIsActive, setRealIsActive] = useState(isActive)
  const [realIsActiveTransition, setRealIsActiveTransition] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setRealIsActive(true)
    } else {
      setRealIsActiveTransition(false)
    }
  }, [isActive])

  useEffect(() => {
    if (realIsActive) {
      setTimeout(() => {
        setRealIsActiveTransition(true)
      }, 50)
    }
  }, [realIsActive])

  const handleClickClose = () => {
    if (typeof onClose === 'function') {
      onClose()
    }
  }

  const handleTransitionEnd = () => {
    if (!isActive) {
      setRealIsActive(false)
    }
  }

  const handleClickOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return
    if (e.target !== overlayRef.current) return
    if (typeof onClose !== 'function') return
    if (!isCloseWhenClickOverlay) return
    onClose()
  }

  if (!realIsActive) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed top-0 left-0 w-full h-screen z-50 backdrop-blur-md flex items-center justify-center transition-opacity duration-300 ${
        realIsActiveTransition ? '' : 'opacity-0'
      }`}
      style={overlayStyle}
      onClick={handleClickOverlay}
    >
      <div
        className={`shadow-custom rounded-md bg-white transition-transform duration-300 ${
          realIsActiveTransition ? '' : 'translate-y-3'
        }`}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Header */}
        {isShowHeader && (
          <div className="flex items-center justify-between py-4 pl-6 pr-4">
            <div className="text-2xl font-medium">{title}</div>
            <div
              className="self-start w-6 h-6 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer text-gray-700"
              title="Đóng"
              onClick={handleClickClose}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="pb-4 px-6" style={bodyStyle}>
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="pb-4 px-6">{footer}</div>}
      </div>
    </div>
  )
}

export default MyPopup
