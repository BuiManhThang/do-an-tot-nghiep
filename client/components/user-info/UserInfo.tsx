import React from 'react'
import { convertDate } from '@/common/format'
import { UserAddress } from '@/types/user'

type Props = {
  userCode?: string
  userName?: string
  userEmail?: string
  userPhoneNumber?: string
  userAddress?: UserAddress
  note?: string
  orderCode?: string
  orderCreatedAt?: Date
}

const UserInfo = ({
  userCode,
  userName,
  userEmail,
  userPhoneNumber,
  userAddress,
  note,
  orderCode,
  orderCreatedAt,
}: Props) => {
  return (
    <div className="flex flex-col justify-between h-full pt-4 pb-3">
      <div className="flex items-center justify-between">
        <span>
          <span className="font-medium">Mã đơn hàng:</span> {orderCode}
        </span>
        {userCode && (
          <span>
            <span className="font-medium">Mã Người dùng:</span> {userCode}
          </span>
        )}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Họ tên:</span> {userName}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Email:</span> {userEmail}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Số điện thoại:</span> {userPhoneNumber}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Tỉnh/Thành phố:</span> {userAddress?.city}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Quận/Huyện:</span> {userAddress?.district}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Địa chỉ chi tiết:</span> {userAddress?.detail}
      </div>
      <div
        style={{
          WebkitLineClamp: 2,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        <span className="font-medium">Ghi chú:</span> {note}
      </div>
      <div>
        <span className="font-medium">Ngày tạo:</span> {convertDate(orderCreatedAt)}
      </div>
    </div>
  )
}

export default UserInfo
