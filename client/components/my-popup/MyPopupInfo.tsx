import React from 'react'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyPopup from './MyPopup'

type Props = {
  isActive?: boolean
  children?: React.ReactNode[] | React.ReactNode
  title?: string
  footer?: React.ReactNode
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  onClose?: () => void
}

const MyPopupInfo = ({
  isActive,
  title = 'Thông báo',
  children,
  width,
  height,
  minWidth = '360px',
  minHeight,
  onClose,
}: Props) => {
  return (
    <MyPopup
      isActive={isActive}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-x-4 justify-end">
          <MyButton
            text="Đóng"
            style={{
              width: '80px',
            }}
            onClick={onClose}
          />
        </div>
      }
    >
      <div
        style={{
          width,
          height,
          minWidth,
          minHeight,
        }}
      >
        {children}
      </div>
    </MyPopup>
  )
}

export default MyPopupInfo
