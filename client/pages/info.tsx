import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import MyUploadThumbnail from '@/components/my-upload-img/MyUploadThumbnail'
import MyTextField from '@/components/my-text-field/MyTextField'
import { User } from '@/types/user'
import { useValidate, ValidateRule, Validator } from '@/hooks/validateHook'
import MyButton from '@/components/my-button/MyButton'
import MyPopupConfirm from '@/components/my-popup/MyPopupConfirm'
import baseApi from '@/apis/baseApi'
import { setUserInfo } from '@/store/reducers/userSlice'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import MyLoadingSkeleton from '@/components/my-loading-skeleton/MyLoadingSkeleton'
import { PagingResult } from '@/types/paging'
import { Order } from '@/types/order'
import { formatMoney } from '@/common/format'
import ImageOrdersEmpty from '../assets/images/orders-empty.jpg'
import OrderItem from '@/components/order-item/OrderItem'
import PopupOrderDetail from '@/components/popup-oder-detail/PopupOrderDetail'

const VALIDATORS: Validator[] = [
  {
    field: 'name',
    name: 'Họ tên',
    rules: [ValidateRule.Required],
  },
  {
    field: 'phoneNumber',
    name: 'Số điện thoại',
    rules: [ValidateRule.PhoneNumber],
  },
]

const getOrdersByUserId = async (userId: string): Promise<PagingResult> => {
  const res = await baseApi.get('orders/paging', {
    userId,
  })
  const pagingResult: PagingResult = res.data
  return pagingResult
}

const InForPage = () => {
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate } = useValidate(VALIDATORS)
  const [isActivePopupOrderDetail, setIsActivePopupOrderDetail] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [totalMoney, setTotalMoney] = useState<number>(0)
  const [isActivePopupConfirm, setIsActivePopupConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [currentUserInfo, setCurrentUserInfo] = useState<User>({
    avatar: '',
    code: '',
    cart: [],
    createdAt: new Date(),
    email: '',
    id: '',
    isAdmin: false,
    name: '',
    orders: [],
    password: '',
    updatedAt: new Date(),
    address: {
      city: '',
      detail: '',
      district: '',
    },
    phoneNumber: '',
  })

  useEffect(() => {
    if (!userInfo) return
    setCurrentUserInfo({ ...userInfo })
  }, [userInfo])

  useEffect(() => {
    const getOrders = async () => {
      if (!userInfo) return
      setIsLoadingOrders(true)
      try {
        const pagingResult = await getOrdersByUserId(userInfo.id)
        const orders: Order[] = pagingResult.data
        setOrders(orders)
        setTotalMoney(
          orders.reduce((prev, cur) => {
            return prev + cur.totalMoney
          }, 0)
        )
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    getOrders()
  }, [userInfo])

  if (!userInfo) {
    return <div></div>
  }

  const saveUserAvatar = async (e: string) => {
    setCurrentUserInfo((prev) => ({
      ...prev,
      avatar: e,
    }))

    try {
      const res = await baseApi.put(`users/${userInfo.id}`, {
        avatar: e,
      })

      const newUserInfo: User = res.data
      dispatch(setUserInfo(newUserInfo))
      openToast({
        msg: 'Lưu ảnh đại diện thành công',
        type: ToastMsgType.Success,
      })
    } catch (error) {
      console.log(error)
      openToast({
        msg: 'Lưu ảnh đại diện thất bại',
        type: ToastMsgType.Danger,
      })
    }
  }

  const handleChange = (func: (prev: User) => User) => {
    return setCurrentUserInfo((prev) => {
      const newVal = func(prev)
      if (isValidated) {
        validate(newVal)
      }
      return newVal
    })
  }

  const closePopupConfirm = () => {
    setIsActivePopupConfirm(false)
  }

  const openPopupConfirm = () => {
    if (!validate(currentUserInfo)) return
    setIsActivePopupConfirm(true)
  }

  const handleWatchDetail = (e: string) => {
    setSelectedOrderId(e)
    setIsActivePopupOrderDetail(true)
  }

  const handleClosePopupWatchDetail = async (isReload: boolean = false) => {
    setSelectedOrderId('')
    setIsActivePopupOrderDetail(false)
    if (isReload) {
      if (!userInfo) return
      setIsLoadingOrders(true)
      try {
        const pagingResult = await getOrdersByUserId(userInfo.id)
        const orders: Order[] = pagingResult.data
        setOrders(orders)
        setTotalMoney(
          orders.reduce((prev, cur) => {
            return prev + cur.totalMoney
          }, 0)
        )
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingOrders(false)
      }
    }
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    try {
      const res = await baseApi.put(`users/${userInfo.id}`, {
        address: currentUserInfo.address,
        phoneNumber: currentUserInfo.phoneNumber,
        name: currentUserInfo.name,
      })

      const newUserInfo: User = res.data
      dispatch(setUserInfo(newUserInfo))
      openToast({
        msg: 'Lưu thông tin thành công',
        type: ToastMsgType.Success,
      })
    } catch (error) {
      console.log(error)
      openToast({
        msg: 'Lưu thông tin thất bại',
        type: ToastMsgType.Danger,
      })
    } finally {
      setIsLoadingSave(false)
      closePopupConfirm()
    }
  }

  return (
    <>
      <Head>
        <title>{userInfo?.name || 'Thông tin tài khoản'}</title>
      </Head>
      <main className="w-full pt-9">
        <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto ">
          <div className="p-6 rounded-md bg-white">
            <div className="flex items-center">
              <div className="relative">
                <MyUploadThumbnail
                  name="avatar"
                  id="avatar"
                  width={144}
                  height={144}
                  isShowChangeBtn={true}
                  isShowRemoveBtn={false}
                  value={currentUserInfo.avatar}
                  onChange={saveUserAvatar}
                />
              </div>
              <div className="ml-6 grow flex items-center justify-between">
                <div>
                  <div className="text-2xl font-medium">{currentUserInfo.name}</div>
                  <div className="text-gray-500">{currentUserInfo.email}</div>
                </div>
                <div className="text-lg text-right">
                  {isLoadingOrders ? (
                    <div className="flex flex-col items-end gap-y-2">
                      <MyLoadingSkeleton className="h-6 w-32 rounded-md" />
                      <MyLoadingSkeleton className="h-6 w-56 rounded-md" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <span>Tổng đơn hàng: </span>
                        <span className="text-primary font-bold">{orders.length}</span>
                      </div>
                      <div>
                        <span>Số tiền đã chi: </span>
                        <span className="text-primary font-bold">
                          <span>{formatMoney(totalMoney)}</span>
                          <span className="text-base inline-block -translate-y-[2px]">₫</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-2 gap-x-6">
                <MyTextField
                  id="name"
                  name="name"
                  label="Họ tên"
                  value={currentUserInfo.name}
                  error={error.name}
                  onChange={(e) => handleChange((prev) => ({ ...prev, name: e.target.value }))}
                />
                <MyTextField
                  id="email"
                  name="email"
                  label="Email"
                  disabled
                  value={currentUserInfo.email}
                  error={error.email}
                  onChange={(e) => handleChange((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-6 mt-6">
                <MyTextField
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Số điện thoại"
                  value={currentUserInfo.phoneNumber}
                  error={error.phoneNumber}
                  onChange={(e) =>
                    handleChange((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                />
                <MyTextField
                  id="city"
                  name="city"
                  label="Tỉnh/Thành phố"
                  value={currentUserInfo.address?.city}
                  onChange={(e) =>
                    handleChange((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        city: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-x-6 mt-6">
                <MyTextField
                  id="district"
                  name="district"
                  label="Quận/Huyện"
                  value={currentUserInfo.address?.district}
                  onChange={(e) =>
                    handleChange((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        district: e.target.value,
                      },
                    }))
                  }
                />
                <MyTextField
                  id="detail"
                  name="detail"
                  label="Địa chỉ chi tiết"
                  value={currentUserInfo.address?.detail}
                  onChange={(e) =>
                    handleChange((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        detail: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="mt-9 flex justify-center">
                <MyButton text="Lưu thông tin" onClick={openPopupConfirm} />
              </div>
            </div>
          </div>

          <div className="text-2xl leading-none my-4 font-bold flex items-end justify-between">
            Danh sách đơn hàng
          </div>
          <div className="p-6 rounded-md bg-white">
            {isLoadingOrders ? (
              [0, 1, 2].map((item) => (
                <div key={item} className="grid grid-cols-1 gap-y-6">
                  <div className="h-32 px-6 py-4 shadow-[0_0_8px_0_rgba(0,0,0,0.15)] rounded-md grid grid-cols-3 border-l-8 border-[#DDDBDD] hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-shadow duration-200">
                    <div className="flex flex-col justify-between">
                      <MyLoadingSkeleton className="h-5 w-32 rounded-md" />
                      <MyLoadingSkeleton className="h-5 w-24 rounded-md" />
                      <MyLoadingSkeleton className="h-5 w-48 rounded-md" />
                    </div>
                    <div className="self-center justify-self-center">
                      <MyLoadingSkeleton className="h-5 w-24 rounded-md" />
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <MyLoadingSkeleton className="rounded-md h-10 w-[150px]" />
                      <MyLoadingSkeleton className="rounded-md h-10 w-[150px]" />
                    </div>
                  </div>
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="relative w-full h-[432px] flex flex-col items-center">
                <Image
                  src={ImageOrdersEmpty}
                  alt="orders-empty"
                  height={432}
                  width={632}
                  className="w-[632px] h-[432px]"
                />
                <div className="absolute left-1/2 top-4 -translate-x-1/2 text-gray-500 text-xl">
                  Bạn chưa có đơn hàng nào
                </div>
                <Link
                  href="/home"
                  className="group flex items-center leading-none absolute left-1/2 bottom-4 -translate-x-1/2 text-primary text-lg"
                >
                  <div className="group-hover:underline">Bắt đầu mua sắm</div>
                  <div className="text-sm pl-1 flex items-center -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-6">
                {orders.map((order) => {
                  return (
                    <OrderItem key={order.id} orderData={order} onWatchDetail={handleWatchDetail} />
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <MyPopupConfirm
          isActive={isActivePopupConfirm}
          isLoading={isLoadingSave}
          onClose={closePopupConfirm}
          onAgree={handleSave}
        >
          <div>Xác nhận lưu thông tin</div>
        </MyPopupConfirm>

        <PopupOrderDetail
          isActive={isActivePopupOrderDetail}
          orderId={selectedOrderId}
          onClose={handleClosePopupWatchDetail}
        />
      </main>
    </>
  )
}

export default InForPage
