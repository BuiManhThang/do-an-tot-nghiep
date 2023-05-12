import baseApi from '@/apis/baseApi'
import { formatMoney } from '@/common/format'
import { OrderStatus } from '@/enum/orderStatus'
import { ToastMsgType } from '@/enum/toastMsg'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { Header } from '@/pages/cart'
import { Order } from '@/types/order'
import React, { useEffect, useState } from 'react'
import CartItem from '../cart-item/CartItem'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import MyPopup from '../my-popup/MyPopup'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'
import UserInfo from '../user-info/UserInfo'
import { handleClientError } from '@/common/errorHandler'
import { AxiosError } from 'axios'

const HEADERS: Header[] = [
  {
    text: 'Hình ảnh',
    width: 112,
    minWidth: 112,
  },
  {
    text: 'Tên sản phẩm',
    minWidth: 150,
  },
  {
    text: 'Giá bán',
    width: 150,
    minWidth: 150,
  },
  {
    text: 'SL',
    width: 70,
    minWidth: 70,
  },
]

type Props = {
  isActive: boolean
  orderId: string
  isAdminView?: boolean
  onClose?: (isReload: boolean) => void
}

const PopupOrderDetail = ({
  isActive,
  orderId,
  isAdminView = false,
  onClose = () => {},
}: Props) => {
  const { openToast } = useToastMsg()
  const [isConfirm, setIsConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isActivePopupCancelOrder, setIsActivePopupCancelOrder] = useState(false)
  const [isLoadingCancelOrder, setIsLoadingCancelOrder] = useState(false)
  const [orderDetail, setOrderDetail] = useState<Order>()
  const [numberProducts, setNumberProducts] = useState(0)
  const [headers, setHeaders] = useState<Header[]>(HEADERS)

  useEffect(() => {
    const getOrderDetail = async (orderId: string) => {
      setIsLoading(true)
      try {
        const resOrder = await baseApi.get(`orders/${orderId}`)
        const orderDetailRes: Order = resOrder.data
        const numberProducts = orderDetailRes.products.reduce((prev, cur) => {
          return prev + cur.amount
        }, 0)
        setOrderDetail(orderDetailRes)
        setNumberProducts(numberProducts)
        if (orderDetailRes.status === OrderStatus.Pending) {
          setHeaders((prev) => {
            return [
              ...prev,
              {
                text: 'Kho',
                width: 80,
                minWidth: 80,
              },
            ]
          })
        }
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (isActive) {
      getOrderDetail(orderId)
    } else {
      setHeaders(HEADERS)
    }
  }, [isActive, orderId])

  const handleCancelOrder = async () => {
    if (!orderDetail) return
    setIsLoadingCancelOrder(true)
    try {
      let msg = ''
      if (isAdminView && orderDetail?.status === OrderStatus.Pending && isConfirm) {
        await baseApi.put(`orders/${orderDetail?.id}`, {
          ...orderDetail,
          status: OrderStatus.Confirmed,
        })
        msg = `Xác nhận thành công đơn hàng số <${orderDetail.code}>`
      } else if (isAdminView && orderDetail?.status === OrderStatus.Pending && !isConfirm) {
        await baseApi.delete(`orders/${orderDetail.id}`)
        msg = `Hủy thành công đơn hàng số <${orderDetail.code}>`
      } else if (isAdminView && orderDetail?.status === OrderStatus.Confirmed) {
        await baseApi.put(`orders/${orderDetail.id}`, {
          ...orderDetail,
          status: OrderStatus.Success,
        })
        msg = `Hoàn thành đơn hàng số <${orderDetail.code}>`
      } else {
        await baseApi.delete(`orders/${orderDetail.id}`)
        msg = `Hủy thành công đơn hàng số <${orderDetail.code}>`
      }
      openToast({
        msg: msg,
        type: ToastMsgType.Success,
      })
      setIsLoadingCancelOrder(false)
      setIsActivePopupCancelOrder(false)
      onClose(true)
    } catch (error: AxiosError | any) {
      setIsLoadingCancelOrder(false)
      setIsActivePopupCancelOrder(false)
      const clientError = handleClientError(error)
      let msg = 'Có lỗi xảy ra'
      if (clientError.product) {
        msg = clientError.product
      }
      openToast({
        msg,
        type: ToastMsgType.Danger,
      })
      setIsLoadingCancelOrder(false)
    }
  }

  return (
    <MyPopup
      isActive={isActive}
      title={
        <div className="flex items-center">
          <div>Thông tin đơn hàng</div>
          <div
            className={`ml-4 flex items-center justify-center font-medium border-2 rounded-md h-6 text-base px-4 ${
              orderDetail?.status === OrderStatus.Pending
                ? 'border-orange-500 text-orange-500'
                : orderDetail?.status === OrderStatus.Confirmed
                ? 'border-primary text-primary'
                : orderDetail?.status === OrderStatus.Success
                ? 'border-green-500 text-green-500'
                : ''
            }`}
          >
            {orderDetail?.status === OrderStatus.Pending ? (
              <div>Chờ xác nhận</div>
            ) : orderDetail?.status === OrderStatus.Confirmed ? (
              <div>Đã xác nhận</div>
            ) : orderDetail?.status === OrderStatus.Success ? (
              <div>Đã giao dịch</div>
            ) : null}
          </div>
        </div>
      }
      onClose={() => onClose(false)}
    >
      {isLoading ? (
        <div>
          <div className="flex gap-x-9">
            <div className="h-[412px] w-[600px] overflow-auto">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="flex border-b first:border-t border-gray-300 h-[137px] py-3 pr-3"
                >
                  <MyLoadingSkeleton className="w-28 h-28 rounded-md mr-6" />
                  <div className="py-3 flex flex-col justify-between grow">
                    <MyLoadingSkeleton className="w-12 h-4 rounded-md" />
                    <MyLoadingSkeleton className="w-full h-4 rounded-md" />
                    <MyLoadingSkeleton className="w-24 h-4 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[412px] w-[500px] overflow-auto flex flex-col justify-between pt-4 pb-3">
              <MyLoadingSkeleton className="w-56 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-80 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-56 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-80 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-56 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-80 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-96 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-80 h-6 rounded-md" />
              <MyLoadingSkeleton className="w-56 h-6 rounded-md" />
            </div>
          </div>
          <MyLoadingSkeleton className="h-4 w-full mt-6 mb-3 rounded-md" />
          <MyLoadingSkeleton className="h-5 w-full mb-6 rounded-md" />
          <MyLoadingSkeleton className="h-[52px] w-full rounded-md" />
        </div>
      ) : (
        <div>
          <div className="h-[412px] overflow-x-hidden flex gap-x-9 border-t border-b border-gray-300">
            <div
              className={`w-[600px] max-h-[411px] overflow-auto shrink-0 transition-all duration-200 relative`}
            >
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th
                        className="h-14 px-4 text-left border-b border-gray-200 bg-white sticky top-0 z-[1]"
                        key={header.text}
                        style={{
                          width: header.width,
                          minWidth: header.minWidth,
                        }}
                      >
                        {header.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderDetail?.products?.map((product) => {
                    return (
                      <CartItem
                        key={`${product.id}`}
                        itemData={product}
                        isView={true}
                        columns={headers}
                      />
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div
              className={`w-[500px] max-h-[411px] overflow-auto shrink-0 transition-all duration-200`}
            >
              {orderDetail && (
                <UserInfo
                  userName={orderDetail?.userName}
                  userAddress={
                    orderDetail
                      ? {
                          city: orderDetail.userCity,
                          district: orderDetail.userDistrict,
                          detail: orderDetail.userAddressDetail,
                        }
                      : undefined
                  }
                  userEmail={orderDetail?.userEmail}
                  userPhoneNumber={orderDetail?.userPhoneNumber}
                  note={orderDetail?.note}
                  orderCreatedAt={orderDetail?.createdAt}
                  orderCode={orderDetail?.code}
                  userCode={isAdminView ? orderDetail?.user?.code : undefined}
                />
              )}
            </div>
          </div>
          <div className="flex items-end justify-between gap-x-9">
            <div className="pt-6 pb-1 text-left grow">
              <div className="leading-none flex justify-between">
                <span>Số lượng sản phẩm</span>
                <span className="text-primary">{numberProducts}</span>
              </div>
              <div className="text-lg font-medium mt-3 leading-none flex justify-between">
                <span>Tổng tiền</span>
                <span className="text-primary">
                  <span>{orderDetail ? formatMoney(orderDetail.totalMoney) : ''}</span>
                  <span className="text-sm inline-block -translate-y-[3px]">₫</span>
                </span>
              </div>
            </div>
            {isAdminView ? (
              <div className="flex w-[500px] overflow-hidden">
                {orderDetail?.status === OrderStatus.Pending ? (
                  <div className="w-full shrink-0 grid grid-cols-3 gap-x-2 transition-all duration-200">
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                      }}
                      text="Đóng"
                      type={MyButtonType.Secondary}
                      onClick={() => onClose(false)}
                    />
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                      }}
                      text="Hủy đơn hàng"
                      type={MyButtonType.Secondary}
                      onClick={() => {
                        setIsActivePopupCancelOrder(true)
                        setIsConfirm(false)
                      }}
                    />
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                        paddingLeft: '4px',
                        paddingRight: '4px',
                      }}
                      text="Xác nhận đơn hàng"
                      onClick={() => {
                        if (orderDetail.products.some((p) => p.amount > p.amountInSystem)) {
                          openToast({
                            msg: 'Số lượng mua vượt quá số lượng trong kho',
                            type: ToastMsgType.Danger,
                          })
                          return
                        }
                        setIsActivePopupCancelOrder(true)
                        setIsConfirm(true)
                      }}
                    />
                  </div>
                ) : orderDetail?.status === OrderStatus.Confirmed ? (
                  <div className="w-full shrink-0 grid grid-cols-2 gap-x-4 transition-all duration-200">
                    <MyButton
                      style={{
                        borderRadius: '8px',
                        width: '100%',
                        height: '52px',
                      }}
                      text="Đóng"
                      type={MyButtonType.Secondary}
                      onClick={() => onClose(false)}
                    />
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                      }}
                      text="Hoàn thành đơn hàng"
                      onClick={() => setIsActivePopupCancelOrder(true)}
                    />
                  </div>
                ) : (
                  <MyButton
                    style={{
                      width: '100%',
                      height: '52px',
                    }}
                    text="Đóng"
                    onClick={() => onClose(false)}
                  />
                )}
              </div>
            ) : (
              <div className="flex w-[500px] overflow-hidden">
                {orderDetail?.status === OrderStatus.Pending ? (
                  <div className="w-full shrink-0 grid grid-cols-2 gap-x-4 transition-all duration-200">
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                      }}
                      text="Hủy đơn hàng"
                      type={MyButtonType.Secondary}
                      onClick={() => setIsActivePopupCancelOrder(true)}
                    />
                    <MyButton
                      style={{
                        width: '100%',
                        height: '52px',
                      }}
                      text="Đóng"
                      onClick={() => onClose(false)}
                    />
                  </div>
                ) : (
                  <MyButton
                    style={{
                      width: '100%',
                      height: '52px',
                    }}
                    text="Đóng"
                    onClick={() => onClose(false)}
                  />
                )}
              </div>
            )}
          </div>

          <MyPopupConfirm
            isActive={isActivePopupCancelOrder}
            isLoading={isLoadingCancelOrder}
            title="Xác nhận"
            textClose="Hủy"
            textAgree="Đồng ý"
            onClose={() => setIsActivePopupCancelOrder(false)}
            onAgree={handleCancelOrder}
          >
            <div>
              {isAdminView
                ? orderDetail?.status === OrderStatus.Pending
                  ? isConfirm
                    ? 'Bạn có chắc chắn xác nhận đơn hàng?'
                    : 'Bạn có chắc chắn muốn hủy đơn hàng?'
                  : 'Bạn có chắc chắn muôn hoàn thành đơn hàng?'
                : 'Bạn có chắc chắn muốn hủy đơn hàng?'}
            </div>
          </MyPopupConfirm>
        </div>
      )}
    </MyPopup>
  )
}

export default PopupOrderDetail
