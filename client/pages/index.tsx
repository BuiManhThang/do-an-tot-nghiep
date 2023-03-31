import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import MySlider from '@/components/my-slider/MySlider'
import ProductCardList from '@/components/product-card-list/ProductCardList'
import ProductCard from '@/components/product-card/ProductCard'
import Image from 'next/image'
import { CardProduct, Product } from '@/types/product'

import Image1 from '../assets/images/test/1.jpg'
import Image2 from '../assets/images/test/2.jpg'
import Image3 from '../assets/images/test/3.jpg'
import Image4 from '../assets/images/test/4.jpg'
import Image5 from '../assets/images/test/5.jpg'
import MyButton, { MyButtonType } from '@/components/my-button/MyButton'
import { PagingResult } from '@/types/paging'
import baseApi from '@/apis/baseApi'
import { Category } from '@/types/category'
import { useAppSelector } from '@/hooks/reduxHook'

const IMAGES = [Image1, Image2, Image3, Image4, Image5]
const IMAGES_2 = [Image3, Image4, Image5]

const WHY_CHOOSE = [
  {
    title: 'Chính sách bảo hành đảm bảo',
    content:
      'Chính sách bảo hành lên tới một năm đối với các lỗi do sản phẩm gây ra, bảo hành 1 đổi 1 trong vòng 1 tháng.',
    icon: <i className="far fa-hand-paper"></i>,
  },
  {
    title: 'Thủ tục mua hàng nhanh chóng',
    content:
      'Mua hàng nhanh chóng, tiện lợi thông qua ứng dụng web, xác nhận đơn hàng chỉ 10 phút sau khi đặt hàng.',
    icon: <i className="fas fa-rocket"></i>,
  },
  {
    title: 'Miễn phí sửa chữa',
    content:
      'Chúng tôi thực hiện chính sách sửa chữa sản phẩm trong vòng 6 tháng sau khi mua sản phẩm.',
    icon: <i className="fas fa-tools"></i>,
  },
]

const WHY_CHOOSE_2 = [
  {
    title: 'Sự kiện mua hàng',
    content: 'Tham gia quay số trúng thưởng đối với đơn hàng từ 1 Tỉ VNĐ.',
    icon: <i className="fas fa-gift"></i>,
  },
  {
    title: 'Bảo hành sản phẩm',
    content: 'Chính sách bảo hành thân thiện, đảm bảo đối với khách hàng.',
    icon: <i className="fas fa-shield-alt"></i>,
  },
  {
    title: 'Thanh toán ngay khi nhận hàng',
    content: 'Thanh toán ngay khi nhận sản phẩm và xác nhận giấy tờ.',
    icon: <i className="fas fa-dollar-sign"></i>,
  },
  {
    title: 'Phục vụ mọi nơi',
    content: 'Phục vụ tận tình, mọi lúc, mọi nơi trên toàn quốc.',
    icon: <i className="fa-solid fa-map"></i>,
  },
]

type CategoryWithProducts = {
  id: string
  name: string
  products: Product[]
}

const getPagingProducts = async (categoryId: string): Promise<Product[]> => {
  const res = await baseApi.get('products/paging', {
    categoryId: categoryId,
    pageIndex: 1,
    pageSize: 8,
    sort: 'code',
    direction: 'desc',
  })
  const pagingResult: PagingResult = res.data
  const products: Product[] = pagingResult.data
  return products
}

const getCategoryWithProductsFunc = async (categories: Category[]) => {
  const queryFuncs: Promise<Product[]>[] = []
  const result: CategoryWithProducts[] = []
  for (let index = 0; index < categories.length; index++) {
    if (index === 4) {
      break
    }
    const category = categories[index]
    result.push({
      id: category.id,
      name: category.name,
      products: [],
    })
    queryFuncs.push(getPagingProducts(category.id))
  }
  const res = await Promise.all(queryFuncs)
  res.forEach((products, index) => {
    result[index].products = products
  })

  return result
}

export default function Home() {
  const categories = useAppSelector((state) => state.navbar.categories)
  const containerRef = useRef<HTMLDivElement>(null)
  const [categoryWithProducts, setCategoryWithProducts] = useState<CategoryWithProducts[]>([])
  const [sliderHeight, setSliderHeight] = useState(620)

  useEffect(() => {
    const handleResizeFunc = (e: Event) => {
      const target = e.target as Window
      if (target.innerWidth > 1024) {
        setSliderHeight(620)
      } else {
        setSliderHeight(274)
      }
    }

    window.addEventListener('resize', handleResizeFunc)

    return () => {
      window.removeEventListener('resize', handleResizeFunc)
    }
  }, [])

  useEffect(() => {
    const getCategoryWithProducts = async () => {
      try {
        const res = await getCategoryWithProductsFunc(categories)
        setCategoryWithProducts(res)
      } catch (error) {
        console.log(error)
      }
    }

    if (categories.length) {
      getCategoryWithProducts()
    }
  }, [categories])

  return (
    <>
      <Head>
        <title>Trang chủ</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main ref={containerRef} className="">
        <div className="w-full h-[274px] lg:h-[620px]">
          <MySlider images={IMAGES} height={sliderHeight} />
        </div>

        <div className="w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
          <div className="w-full grid grid-cols-1 gap-5 lg:grid-cols-3 mt-14">
            {IMAGES_2.map((image, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden w-full h-[380px] lg:h-[166px] relative"
              >
                <Image
                  src={image}
                  alt={`${index}`}
                  fill={true}
                  sizes="(max-width: 768px) 100vw,
                          (max-width: 1200px) 50vw,
                          33vw"
                  className="object-center object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* <div className="mt-8">
            <h2 className="text-center font-bold text-3xl mb-6">Sản phẩm gợi ý</h2>
            <ProductCardList>
              {PRODUCTS.map((product) => (
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
          </div> */}

          {categoryWithProducts.map((categoryWithProduct, index) => {
            return (
              <div className="mt-8" key={index}>
                <h2 className="text-center font-bold text-3xl mb-6">{categoryWithProduct.name}</h2>
                <ProductCardList>
                  {categoryWithProduct.products.map((product) => (
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
            )
          })}

          <div className="grid grid-cols-3 gap-6 text-center mt-10">
            {WHY_CHOOSE.map((item, idx) => (
              <div key={idx}>
                <span className="text-4xl text-[#444]">{item.icon}</span>
                <h3 className="text-2xl font-medium text-[#444] h-[50px] mb-0 mt-[30px]">
                  {item.title}
                </h3>
                <p className="max-w-[300px] mx-auto mt-5 mb-[30px] text-base">{item.content}</p>
                <MyButton text="Mua sắm ngay" type={MyButtonType.PrimarySolid} />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl grid grid-cols-2 lg:grid-cols-4 pt-[50px] px-[50px] pb-8 gap-6 text-center mt-8">
            {WHY_CHOOSE_2.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[70px_1fr] gap-x-5 w-full">
                <div className="text-2xl leading-none flex p-4 h-[70px] w-[70px] justify-center items-center border-2 border-[#777] rounded-full mr-[10px]">
                  {item.icon}
                </div>
                <div className="text-center">
                  <h3 className="mt-0 text-base text-primary font-medium mb-2 text-left">
                    {item.title}
                  </h3>
                  <p className="mt-0 text-sm text-[#777] mb-0 text-justify">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
