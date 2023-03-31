import React from 'react'
import MyButton from '../my-button/MyButton'
import { OrderStatus } from '@/enum/orderStatus'
import { convertDate, formatMoney } from '@/common/format'
import { Order } from '@/types/order'

type Props = {
  orderData: Order
  onWatchDetail: (orderId: string) => void
}

const OrderItem = ({ orderData, onWatchDetail }: Props) => {
  const totalProducts = orderData.products.reduce((prev, cur) => {
    return prev + cur.amount
  }, 0)

  return (
    <div
      className={`h-32 px-6 py-4 shadow-[0_0_8px_0_rgba(0,0,0,0.15)] rounded-md grid grid-cols-3 border-l-8 ${
        orderData.status === OrderStatus.Pending
          ? 'border-orange-500'
          : orderData.status === OrderStatus.Confirmed
          ? 'border-primary'
          : orderData.status === OrderStatus.Success
          ? 'border-green-500'
          : ''
      } hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-shadow duration-200`}
    >
      <div className="flex flex-col justify-between">
        <div>
          Số đơn: <span className="font-medium">{orderData.code}</span>
        </div>
        <div>
          Số lượng sản phẩm: <span className="font-medium">{totalProducts}</span>
        </div>
        <div>
          <span>Tổng tiền: </span>
          <span className="font-medium">
            <span>{formatMoney(orderData.totalMoney)}</span>
            <span className="text-xs inline-block -translate-y-1 font-medium">₫</span>
          </span>
        </div>
      </div>
      <div className="self-center justify-self-center">
        Ngày lập: <span className="font-medium">{convertDate(orderData.createdAt)}</span>
      </div>
      <div className="flex flex-col justify-between items-end">
        <div
          className={`flex items-center justify-center font-medium border-2 rounded-md h-10 w-[150px] ${
            orderData.status === OrderStatus.Pending
              ? 'border-orange-500 text-orange-500'
              : orderData.status === OrderStatus.Confirmed
              ? 'border-primary text-primary'
              : orderData.status === OrderStatus.Success
              ? 'border-green-500 text-green-500'
              : ''
          }`}
        >
          {orderData.status === OrderStatus.Pending ? (
            <div>Chờ xác nhận</div>
          ) : orderData.status === OrderStatus.Confirmed ? (
            <div>Đã xác nhận</div>
          ) : orderData.status === OrderStatus.Success ? (
            <div>Đã giao dịch</div>
          ) : null}
        </div>
        <MyButton
          style={{
            borderRadius: '6px',
            height: '40px',
            width: '150px',
            padding: '0',
          }}
          text="Xem chi tiết"
          onClick={() => onWatchDetail(orderData.id)}
        />
      </div>
    </div>
  )
}

export default OrderItem
