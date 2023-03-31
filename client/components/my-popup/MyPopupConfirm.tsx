import React from 'react'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyPopup from './MyPopup'

type Props = {
  isActive?: boolean
  children?: React.ReactNode[] | React.ReactNode
  title?: string
  footer?: React.ReactNode
  isLoading?: boolean
  textClose?: string
  textAgree?: string
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  onClose?: () => void
  onAgree?: () => void
}

const MyPopupConfirm = ({
  isActive,
  title = 'Thông báo',
  children,
  isLoading = false,
  textClose = 'Hủy',
  textAgree = 'Đồng ý',
  width,
  height,
  minWidth = '360px',
  minHeight,
  onClose,
  onAgree,
}: Props) => {
  return (
    <MyPopup
      isActive={isActive}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-x-4 justify-end">
          <MyButton
            text={textClose}
            type={MyButtonType.Secondary}
            style={{
              width: '80px',
            }}
            onClick={onClose}
          />
          <MyButton
            text={textAgree}
            style={{
              width: '80px',
            }}
            isLoading={isLoading}
            onClick={onAgree}
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

export default MyPopupConfirm
