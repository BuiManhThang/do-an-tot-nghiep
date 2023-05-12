import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import CartItem from '@/components/cart-item/CartItem'
import MyButton, { MyButtonType } from '@/components/my-button/MyButton'
import EmptyCartImage from '../assets/images/cart-empty.jpg'
import { useRouter } from 'next/router'
import { formatMoney } from '@/common/format'
import MyCheckbox from '@/components/my-checkbox/MyCheckbox'
import MyTextField from '@/components/my-text-field/MyTextField'
import MyTextArea from '@/components/my-textarea/MyTextarea'
import MySelect from '@/components/my-select/MySelect'
import MyPopupInfo from '@/components/my-popup/MyPopupInfo'
import { CreateOrder, Order } from '@/types/order'
import MyPopupConfirm from '@/components/my-popup/MyPopupConfirm'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import baseApi from '@/apis/baseApi'
import { removeCart } from '@/store/reducers/cartSlice'
import { setUserInfo } from '@/store/reducers/userSlice'
import { Product } from '@/types/product'
import { ProductInCart } from '@/types/user'
import { handleClientError } from '@/common/errorHandler'
import { ValidateRule, Validator, useValidate } from '@/hooks/validateHook'

export type Header = {
  text: string
  width?: number
  minWidth?: number
}

const HEADERS: Header[] = [
  {
    text: 'Hình ảnh',
    width: 112,
    minWidth: 112,
  },
  {
    text: 'Tên sản phẩm',
    width: 225,
    minWidth: 225,
  },
  {
    text: 'Giá bán',
    minWidth: 150,
  },
  {
    text: 'Số lượng',
    width: 150,
    minWidth: 150,
  },
  {
    text: 'Kho',
    width: 80,
    minWidth: 80,
  },
  {
    text: '',
    width: 46,
    minWidth: 46,
  },
]

const VALIDATORS: Validator[] = [
  {
    field: 'userName',
    name: 'Họ tên',
    rules: [ValidateRule.Required],
  },
  {
    field: 'userPhoneNumber',
    name: 'Số điện thoại',
    rules: [ValidateRule.Required],
  },
  {
    field: 'userEmail',
    name: 'Email',
    rules: [ValidateRule.Required],
  },
  {
    field: 'userCity',
    name: 'Tỉnh/Thành phố',
    rules: [ValidateRule.Required],
  },
  {
    field: 'userDistrict',
    name: 'Quận/Huyện',
    rules: [ValidateRule.Required],
  },
  {
    field: 'userAddressDetail',
    name: 'Địa chỉ chi tiết',
    rules: [ValidateRule.Required],
  },
]

const Cart = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const products = useAppSelector((state) => state.cart.products)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate } = useValidate(VALIDATORS)
  const [productsWithAmount, setProductsWithAmount] = useState<ProductInCart[]>([])
  const [isActivePopupConfigm, setIsActivePopupConfigm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isActivePopupInfo, setIsActivePopupInfo] = useState(false)
  const [msgPopupInfo, setMsgPopupInfo] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isAgree, setIsAgree] = useState<boolean>(false)
  const [orderData, setOrderData] = useState<CreateOrder>({
    code: '',
    products: [],
    totalMoney: 0,
    userId: '',
    note: '',
    userName: userInfo?.name || '',
    userPhoneNumber: userInfo?.phoneNumber || '',
    userEmail: userInfo?.email || '',
    userCity: userInfo?.address?.city || '',
    userDistrict: userInfo?.address?.district || '',
    userAddressDetail: userInfo?.address?.detail || '',
  })

  useEffect(() => {
    let totalTmp = 0
    let totalPriceTmp = 0
    products.forEach((product) => {
      totalTmp += product.amount
      totalPriceTmp += product.amount * product.price
    })

    setTotal(totalTmp)
    setTotalPrice(totalPriceTmp)
  }, [products])

  useEffect(() => {
    const getProductsByIds = async () => {
      try {
        const productIds = products.map((p) => p.id)
        const productIdsString = productIds.join(';')
        const res = await baseApi.get(`products/ids/${productIdsString}`)
        const resData: Product[] = res.data
        const productsWithAmountRes: ProductInCart[] = products.map((product) => {
          return {
            ...product,
            amountInSystem: resData.find((p) => p.id === product.id)?.amount || 0,
          }
        })
        setProductsWithAmount(productsWithAmountRes)
      } catch (error) {
        console.log(error)
        setProductsWithAmount(products.map((p) => ({ ...p, amountInSystem: 0 })))
      }
    }

    if (products.length && !productsWithAmount.length) {
      getProductsByIds()
    } else {
      const productsWithAmountRes: ProductInCart[] = products.map((product) => {
        return {
          ...product,
          amountInSystem: productsWithAmount.find((p) => p.id === product.id)?.amountInSystem || 0,
        }
      })
      setProductsWithAmount(productsWithAmountRes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  const handleClickContinueBuy = () => {
    router.push('/')
  }

  const handleClickMakeOrder = () => {
    if (!userInfo) {
      setIsActivePopupInfo(true)
      setMsgPopupInfo('Bạn cần đăng nhập trước khi đặt hàng')
      return
    }
    if (!validate(orderData)) return
    if (!isAgree) {
      setIsActivePopupInfo(true)
      setMsgPopupInfo('Bạn cần đồng ý với chính sách và điều khoản của website')
      return
    }
    if (productsWithAmount.some((p) => p.amount > p.amountInSystem)) {
      setIsActivePopupInfo(true)
      setMsgPopupInfo('Sản phẩm vượt quá số lượng trong kho')
      return
    }
    if (
      !userInfo.phoneNumber ||
      !userInfo.address ||
      !userInfo.address.city ||
      !userInfo.address.district ||
      !userInfo.address.detail
    ) {
      setIsActivePopupInfo(true)
      setMsgPopupInfo('Bạn cần cập nhật đầy đủ thông tin thanh toán trước khi đặt hàng')
      return
    }

    setIsActivePopupConfigm(true)
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    try {
      await baseApi.post('orders', {
        code: '',
        products: products,
        totalMoney: totalPrice,
        userId: userInfo?.id,
        note: orderData.note,
        userName: orderData.userName,
        userPhoneNumber: orderData.userPhoneNumber,
        userEmail: orderData.userEmail,
        userCity: orderData.userCity,
        userDistrict: orderData.userDistrict,
        userAddressDetail: orderData.userAddressDetail,
      })

      dispatch(removeCart())
      dispatch(
        setUserInfo({
          ...userInfo,
          cart: [],
        })
      )

      openToast({
        msg: 'Đặt hàng thành công',
        type: ToastMsgType.Success,
      })
    } catch (error) {
      console.log(error)
      const clientError = handleClientError(error)
      let msg = 'Đặt hàng thất bại'
      if (clientError.product) {
        msg = clientError.product
      }
      openToast({
        msg,
        type: ToastMsgType.Danger,
      })
    } finally {
      setIsLoadingSave(false)
      setIsActivePopupConfigm(false)
    }
  }

  const handleChange = (func: (prev: CreateOrder) => CreateOrder) => {
    return setOrderData((prev) => {
      const newVal = func(prev)
      if (isValidated) {
        validate(newVal)
      }
      return newVal
    })
  }

  return (
    <>
      <Head>
        <title>Giỏ hàng</title>
      </Head>
      <main className="pt-9 min-h-[calc(100vh_-_590px)]">
        {products.length === 0 ? (
          <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
            <div className="relative flex justify-center">
              <Image src={EmptyCartImage} alt="empty-cart" width={612} height={612} />
              <div className="text-center absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500">
                Giỏ hàng của bạn đang trống
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <MyButton
                type={MyButtonType.PrimarySolid}
                text="Tiếp tục mua sắm"
                onClick={handleClickContinueBuy}
              />
            </div>
          </div>
        ) : (
          <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto grid grid-cols-3 gap-x-5">
            <div className="col-start-1 col-end-3">
              <div className="p-4 rounded-md bg-white">
                <table className="w-full">
                  <thead>
                    <tr>
                      {HEADERS.map((header) => (
                        <th
                          className="h-14 px-4 text-left border-b border-gray-200"
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
                    {productsWithAmount.map((product) => (
                      <CartItem columns={HEADERS} itemData={product} key={product.id} />
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <MyButton
                    type={MyButtonType.PrimarySolid}
                    text="Tiếp tục mua sắm"
                    onClick={handleClickContinueBuy}
                  />
                </div>
              </div>

              <div className="text-2xl leading-none my-4 font-bold flex items-end justify-between">
                <span>Thông tin thanh toán</span>
                <span className="text-base text-black font-normal leading-none">
                  {userInfo ? (
                    <Link href={'/info'} className="text-primary">
                      Cập nhật thông tin thanh toán
                    </Link>
                  ) : (
                    <span>
                      <Link href={'/sign-in'} className="text-primary">
                        Đăng nhập
                      </Link>
                      <span>/</span>
                      <Link href={'/register'} className="text-primary">
                        Đăng ký
                      </Link>
                      <span> để hoàn thiện thông tin</span>
                    </span>
                  )}
                </span>
              </div>

              <div className="py-4 px-8 rounded-md bg-white">
                <div className="py-2">
                  <MyTextField
                    id="userName"
                    name="userName"
                    label="Họ tên"
                    required={true}
                    value={orderData.userName}
                    error={error.userName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange((prev) => ({
                        ...prev,
                        userName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="py-2">
                    <MyTextField
                      id="userPhoneNumber"
                      name="userPhoneNumber"
                      label="Số điện thoại"
                      required={true}
                      value={orderData.userPhoneNumber}
                      error={error.userPhoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          userPhoneNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="py-2">
                    <MyTextField
                      id="userEmail"
                      name="userEmail"
                      label="Email"
                      required={true}
                      value={orderData.userEmail}
                      error={error.userEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          userEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="py-2">
                    <MyTextField
                      id="userCity"
                      name="userCity"
                      label="Tỉnh/Thành phố"
                      required={true}
                      value={orderData.userCity}
                      error={error.userCity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          userCity: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="py-2">
                    <MyTextField
                      id="userDistrict"
                      name="userDistrict"
                      label="Quận/Huyện"
                      required={true}
                      value={orderData.userDistrict}
                      error={error.userDistrict}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          userDistrict: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="py-2">
                  <MyTextField
                    id="userAddressDetail"
                    name="userAddressDetail"
                    label="Địa chỉ chi tiết"
                    required={true}
                    value={orderData.userAddressDetail}
                    error={error.userAddressDetail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange((prev) => ({
                        ...prev,
                        userAddressDetail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="py-2">
                  <MyTextArea
                    id="note"
                    name="note"
                    label="Ghi chú"
                    height={150}
                    value={orderData.note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-start-3 col-end-4">
              <div className="pt-6 px-4 pb-9 rounded-md bg-white sticky top-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tổng sản phẩm:</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pb-6 border-b border-gray-300">
                  <span className="font-medium">Tổng cộng:</span>
                  <div className="font-medium text-primary">
                    <span>{formatMoney(totalPrice)}</span>
                    <span className="text-xs inline-block -translate-y-1 font-medium">₫</span>
                  </div>
                </div>
                <div className="mt-6">
                  <MyCheckbox
                    id="agreement"
                    name="agreement"
                    label="Tôi đã đọc và đồng ý với điều khoản và điều kiện của website"
                    checked={isAgree}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setIsAgree(e.target.checked)
                    }
                  />
                </div>
                <div className="mt-9">
                  <MyButton
                    text="Tiến hành đặt hàng"
                    onClick={handleClickMakeOrder}
                    style={{
                      fontSize: '18px',
                      fontWeight: 'normal',
                      height: '56px',
                      width: '100%',
                    }}
                  />
                </div>
                <div className="text-red-500 text-sm mt-3">
                  (*) Phí phụ thu sẽ được tính khi bạn tiến hành thanh toán.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <MyPopupInfo isActive={isActivePopupInfo} onClose={() => setIsActivePopupInfo(false)}>
        <div>{msgPopupInfo}</div>
      </MyPopupInfo>

      <MyPopupConfirm
        isActive={isActivePopupConfigm}
        isLoading={isLoadingSave}
        onClose={() => setIsActivePopupConfigm(false)}
        onAgree={handleSave}
      >
        <div>Xác nhận tạo đơn đặt hàng</div>
      </MyPopupConfirm>
    </>
  )
}

export default Cart
