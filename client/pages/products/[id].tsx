import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import baseApi from '@/apis/baseApi'
import MySlider from '@/components/my-slider/MySlider'
import MyCounter from '@/components/my-counter/MyCounter'
import MyDisplayStars from '@/components/my-display-stars/MyDisplayStars'
import { formatMoney } from '@/common/format'
import MyButton from '@/components/my-button/MyButton'
import { useAppDispatch } from '@/hooks/reduxHook'
import { addToCart } from '@/store/reducers/cartSlice'
import { ProductInCart } from '@/types/user'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'

const ProductDetailPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { openToast } = useToastMsg()
  const [productData, setProductData] = useState<Product>()
  const [buyNumber, setBuyNumber] = useState<number>(1)

  useEffect(() => {
    const getProductData = async () => {
      try {
        const res = await baseApi.get(`products/${router.query.id}`)
        setProductData(res.data)
      } catch (error) {
        console.log(error)
      }
    }

    getProductData()
  }, [router, router.query.id])

  const handleClickAddToCart = () => {
    if (!productData) return
    const addedProduct: ProductInCart = {
      amount: buyNumber,
      id: productData.id,
      name: productData.name,
      categoryId: productData.categoryId,
      categoryName: productData.category.name,
      code: productData.code,
      image: productData.image,
      price: productData.price,
      unit: productData.unit,
    }
    dispatch(addToCart(addedProduct))
    openToast({
      msg: 'Thêm sản phẩm vào giỏ hàng thành công',
      type: ToastMsgType.Success,
    })
  }

  return (
    <>
      <Head>
        <title>{productData?.name ? productData.name : 'Chi tiết'}</title>
      </Head>

      <main className="pt-9">
        <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
          <div className="grid grid-cols-2 gap-x-12">
            {/* Gallery */}
            <div className="w-full h-[576px] shadow-custom">
              {productData?.image && productData.gallery && (
                <MySlider images={[productData.image, ...productData.gallery]} height={576} />
              )}
            </div>

            {/* Detail */}
            <div>
              <div className="text-2xl leading-none font-bold">{productData?.name}</div>
              <div className="flex items-center gap-x-3 text-sm py-5 border-b border-gray-300">
                <MyDisplayStars score={4.5} className="text-yellow-400" />
                <div className="text-primary cursor-pointer hover:underline">20 đánh giá</div>
              </div>

              <div className="mt-5 text-2xl font-bold text-primary">
                <span>Giá bán: </span>
                <span>{formatMoney(productData?.price)}</span>
                <span className="text-base inline-block -translate-y-[5px]">₫</span>
              </div>

              <div className="mt-4">
                <span>Đơn vị: </span>
                <span>{productData?.unit}</span>
              </div>

              <div className="mt-4">
                <span>Số lượng hiện có: </span>
                <span>{productData?.amount}</span>
              </div>

              <div className="mt-3 flex items-center">
                <span>Số lượng mua: </span>
                <div className="w-32 ml-2">
                  <MyCounter
                    id="buyNumber"
                    name="buyNumber"
                    value={buyNumber}
                    min={1}
                    max={productData?.amount}
                    onChange={(e: '' | number) => setBuyNumber(e ? e : 0)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <MyButton
                  startIcon={<i className="fa-solid fa-cart-plus"></i>}
                  text="Thêm vào giỏ hàng"
                  onClick={handleClickAddToCart}
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    height: '56px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductDetailPage
