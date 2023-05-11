import { CardProduct } from '@/types/product'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MyButton from '../my-button/MyButton'
import { formatMoney } from '@/common/format'
import { ProductInCart } from '@/types/user'
import { useAppDispatch } from '@/hooks/reduxHook'
import { addToCart } from '@/store/reducers/cartSlice'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'

type Props = {
  product: CardProduct
}

const ProductCard = ({ product }: Props) => {
  const { openToast } = useToastMsg()
  const dispatch = useAppDispatch()

  const handleClickAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const addedProduct = {
      amount: 1,
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      code: product.code,
      image: product.image,
      price: product.price,
      unit: product.unit,
    }
    dispatch(addToCart(addedProduct))
    openToast({
      msg: 'Thêm sản phẩm vào giỏ hàng thành công',
      type: ToastMsgType.Success,
    })
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="rounded-lg bg-white shadow-custom overflow-hidden group hover:shadow-custom-xl transition-shadow duration-300"
    >
      <div className="relative w-full h-[350px] lg:h-[250px] mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill={true}
          sizes="(max-width: 1018px) 417px, 285px"
          className="object-cover object-center"
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center group-hover:backdrop-blur-[2px]">
          <div className="font-medium text-lg text-white bg-primary/90 w-[80px] h-[80px] rounded-full flex items-center justify-center shadow-sm scale-90 opacity-0 transition-all ease-linear group-hover:scale-110 group-hover:opacity-100">
            Chi tiết
          </div>
        </div>
      </div>

      <div className="pb-3 px-3">
        <div
          className="font-bold text-lg overflow-hidden leading-5 mb-2 h-10"
          style={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            display: '-webkit-box',
          }}
          title={product.name}
        >
          {`${product.name}`}
        </div>
        <div className="text-sm text-gray-500 leading-none mb-1">
          <span>Đơn vị: </span> <span>{product.unit}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-primary">
            <span>{formatMoney(product.price)}</span>
            <span className="text-xs inline-block -translate-y-1 font-medium">₫</span>
          </div>
          <div>
            <MyButton
              startIcon={<i className="fa-solid fa-cart-plus"></i>}
              text="Thêm vào giỏ"
              onClick={handleClickAddToCart}
              style={{
                fontSize: '14px',
                height: '30px',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
