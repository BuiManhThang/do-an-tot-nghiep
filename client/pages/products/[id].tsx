import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import baseApi from '@/apis/baseApi'
import MySlider from '@/components/my-slider/MySlider'
import MyCounter from '@/components/my-counter/MyCounter'
import MyDisplayStars from '@/components/my-display-stars/MyDisplayStars'
import { formatMoney } from '@/common/format'
import MyButton, { MyButtonType } from '@/components/my-button/MyButton'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addToCart } from '@/store/reducers/cartSlice'
import { ProductInCart } from '@/types/user'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import ProductCardList from '@/components/product-card-list/ProductCardList'
import ProductCard from '@/components/product-card/ProductCard'
import { PagingResult } from '@/types/paging'
import ReviewItem from '@/components/review-item/ReviewItem'
import Link from 'next/link'
import { ViewHistory } from '@/types/viewHistory'

const getRelatedProductsFunc = async (categoryId: string): Promise<Product[]> => {
  const res = await baseApi.get('products/paging', {
    categoryId: categoryId,
  })
  const pagingResult: PagingResult = res.data
  const relatedProducts: Product[] = pagingResult.data
  return relatedProducts
}

const getViewedProductsFunc = async (userId: string): Promise<Product[]> => {
  const res = await baseApi.get('viewHistory/paging', {
    userId,
  })
  const pagingResult: PagingResult = res.data
  const viewHistory: ViewHistory[] = pagingResult.data
  const products = viewHistory.map((v) => v.product)
  return products
}

const ProductDetailPage = () => {
  const router = useRouter()
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const dispatch = useAppDispatch()
  const { openToast } = useToastMsg()
  const [productData, setProductData] = useState<Product>()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [viewedProducts, setViewedProducts] = useState<Product[]>([])
  const [buyNumber, setBuyNumber] = useState<number>(1)
  const [avgScore, setAvgScore] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    const getRelatedProducts = async (categoryId: string) => {
      try {
        const res = await getRelatedProductsFunc(categoryId)
        setRelatedProducts(res)
      } catch (error) {
        setRelatedProducts([])
      }
    }

    const handleViewHistory = async () => {
      const productId = router.query.id
      if (!userInfo?.id || typeof productId !== 'string') return
      const viewedProductsRes = await getViewedProductsFunc(userInfo.id)
      setViewedProducts(viewedProductsRes)
      if (viewedProductsRes.find((p) => p.id === productId)) return
      await baseApi.post('viewHistory/user', {
        productId: productId,
      })
    }

    const getInitData = async () => {
      if (!router.query.id) return
      try {
        const res = await baseApi.get(`products/${router.query.id}`)
        const productDataRes: Product = res.data
        getRelatedProducts(productDataRes.categoryId)
        setProductData(productDataRes)
        handleViewHistory()
      } catch (error) {
        console.log(error)
      }
    }

    getInitData()
  }, [router.query.id, userInfo?.id])

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
            <div className="w-full h-[576px] shadow-custom rounded-md overflow-hidden">
              {productData?.image && productData.gallery && (
                <MySlider images={[productData.image, ...productData.gallery]} height={576} />
              )}
            </div>

            {/* Detail */}
            <div className="grid grid-cols-1 grid-rows-[auto_150px] h-[576px]">
              <div>
                <div className="text-2xl leading-none font-bold">{productData?.name}</div>
                <div className="flex items-center gap-x-3 text-sm py-5 border-b border-gray-300">
                  <MyDisplayStars score={avgScore} className="text-yellow-400" />
                  <Link
                    href={'#comment-section'}
                    className="text-primary cursor-pointer hover:underline"
                  >{`${totalReviews} đánh giá`}</Link>
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
                  <span>Danh mục: </span>
                  <span>{productData?.category.name}</span>
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

              <div className="mb-0 mt-auto border border-gray-300 rounded-md p-4">
                <div className="uppercase font-medium mb-2">Chúng tôi cam kết!</div>
                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                  <div className="flex items-center gap-x-3">
                    <i className="fa-solid fa-shield text-lg text-primary"></i>
                    <span>Hàng hóa đảm bảo chất lượng</span>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <i className="fa-regular fa-clock text-lg text-primary"></i>
                    <span>Giao đúng hẹn, đủ hàng</span>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <i className="fa-solid fa-repeat text-lg text-primary"></i>
                    <span>Đổi trả, hoàn tiền dễ dàng</span>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <i className="fa-solid fa-thumbs-up text-lg text-primary"></i>
                    <span>Thân thiện, vui vẻ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment */}
        <div id="comment-section" className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
          <div className="mt-14">
            <h2 className="text-left font-bold text-3xl leading-[45px]">Đánh giá sản phẩm</h2>
            <ReviewItem
              productId={router.query.id?.toString() || ''}
              onChangeAvgScore={(e: number) => setAvgScore(e)}
              onChangeTotalReviews={(e: number) => setTotalReviews(e)}
            />
          </div>
        </div>

        {/* Related */}
        <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
          <div className="mt-14">
            <h2 className="text-left font-bold text-3xl mb-6">Sản phẩm liên quan</h2>
            <ProductCardList>
              {relatedProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </ProductCardList>
            <div className="mt-8 flex items-center justify-center">
              <MyButton
                text="Xem tất cả sản phẩm"
                endIcon={<i className="fa-solid fa-chevron-right"></i>}
                type={MyButtonType.PrimarySolid}
                style={{
                  padding: '0 32px',
                  height: '42px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Viewed */}
        <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
          <div className="mt-14">
            <h2 className="text-left font-bold text-3xl mb-6">Sản phẩm đã xem</h2>
            <ProductCardList>
              {viewedProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </ProductCardList>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductDetailPage
