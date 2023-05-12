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
import ReviewItem from '@/components/review-item/ReviewItem'
import Link from 'next/link'
import { getAndSetViewHistory } from '@/store/reducers/viewHistorySlice'
import { RequestStatus } from '@/enum/requestStatus'
import MyLoadingSkeleton from '@/components/my-loading-skeleton/MyLoadingSkeleton'

const getSuggestionFunc = async (productIds: string[]) => {
  const res = await baseApi.get('associationRules/suggestion', {
    ids: productIds.join(';'),
  })
  const products: Product[] = res.data
  return products
}

const ProductDetailPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const cartProducts = useAppSelector((state) => state.cart.products)
  const statusInitCart = useAppSelector((state) => state.cart.status)
  const viewHistoryProductIds = useAppSelector((state) => state.viewHistory.productIds)
  const viewedProducts = useAppSelector((state) => state.viewHistory.products)
  const { openToast } = useToastMsg()
  const [productData, setProductData] = useState<Product>()
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [isLoadingProductData, setIsLoadingProductData] = useState(false)

  const [buyNumber, setBuyNumber] = useState<number>(1)
  const [avgScore, setAvgScore] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    const getInitData = async () => {
      if (!router.query.id) return
      setIsLoadingProductData(true)
      try {
        const res = await baseApi.get(`products/${router.query.id}`)
        const productDataRes: Product = res.data
        setProductData(productDataRes)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingProductData(false)
      }
    }

    getInitData()
  }, [router.query.id])

  useEffect(() => {
    const getSuggestion = async () => {
      if (typeof router.query.id !== 'string') return
      const productId: string = router.query.id
      const cartProductIds = cartProducts.map((p) => p.id)
      const cloneViewHistoryProductIds = [...viewHistoryProductIds]
      if (!cloneViewHistoryProductIds.includes(productId)) {
        cloneViewHistoryProductIds.push(productId)
        if (cloneViewHistoryProductIds.length > 4) {
          cloneViewHistoryProductIds.shift()
        }
      }
      try {
        const res = await getSuggestionFunc([...cartProductIds, ...cloneViewHistoryProductIds])
        setSuggestedProducts(res)
      } catch (error) {
        console.log(error)
        setSuggestedProducts([])
      }
    }
    if (statusInitCart !== RequestStatus.Pending) {
      getSuggestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusInitCart, router.query.id])

  useEffect(() => {
    if (!(typeof router.query.id === 'string')) return
    dispatch(getAndSetViewHistory({ userId: userInfo?.id, productId: router.query.id }))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id])

  const handleClickAddToCart = () => {
    if (!productData) return
    const addedProduct = {
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
              {isLoadingProductData ? (
                <MyLoadingSkeleton className="w-full h-full rounded-md" />
              ) : (
                <>
                  {productData && productData?.image && productData?.gallery ? (
                    <MySlider images={[productData.image, ...productData.gallery]} height={576} />
                  ) : (
                    <></>
                  )}
                </>
              )}
              <></>
            </div>

            {/* Detail */}
            <div className="grid grid-cols-1 grid-rows-[auto_150px] h-[576px]">
              {isLoadingProductData ? (
                <div>
                  <MyLoadingSkeleton className="h-12 rounded-md" />
                  <MyLoadingSkeleton className="h-[21px] w-32 my-5 rounded-md" />
                  <div className="border-b border-gray-300" />
                  <MyLoadingSkeleton className="mt-5 h-8 w-14 rounded-md" />
                  <MyLoadingSkeleton className="mt-4 h-8 w-44 rounded-md" />
                  <MyLoadingSkeleton className="mt-4 h-8 w-16 rounded-md" />
                  <MyLoadingSkeleton className="mt-4 h-8 w-20 rounded-md" />
                  <MyLoadingSkeleton className="mt-3 h-8 w-48 rounded-md" />
                  <MyLoadingSkeleton className="mt-6 h-14 w-[206px] rounded-md" />
                </div>
              ) : (
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
                        disabled={!productData?.amount || !productData.isActive}
                        onChange={(e: '' | number) => setBuyNumber(e ? e : 0)}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    {productData?.amount ? (
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
                    ) : (
                      <div className="text-lg font-bold text-danger">Sản phẩm ngừng kinh doanh</div>
                    )}
                  </div>
                </div>
              )}

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
            <h2 className="text-left font-bold text-3xl mb-6">Có thể bạn quan tâm</h2>
            <ProductCardList>
              {suggestedProducts.map((product) => (
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
                onClick={() => router.replace('/products')}
              />
            </div>
          </div>
        </div>

        {/* Viewed */}
        {viewedProducts.length > 0 && (
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
        )}
      </main>
    </>
  )
}

export default ProductDetailPage
