import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MyCounter from '../my-counter/MyCounter'
import { ProductInCart } from '@/types/user'
import { formatMoney } from '@/common/format'
import { Header } from '@/pages/cart'
import { useAppDispatch } from '@/hooks/reduxHook'
import { addToCart, minusFromCart, removeFromCart } from '@/store/reducers/cartSlice'

type Props = {
  columns: Header[]
  isView?: boolean
  itemData: ProductInCart
}

const CartItem = ({ columns, isView = false, itemData }: Props) => {
  const dispatch = useAppDispatch()

  const handleChangeCounter = (e: number | '') => {
    // if (e === '') {
    //   return
    // }
    const addedProduct: ProductInCart = {
      ...itemData,
    }
    addedProduct.amount = e || 1
    // if (e > itemData.amount) {
    //   dispatch(addToCart(addedProduct))
    //   return
    // }
    dispatch(addToCart(addedProduct))
  }

  const handleClickDelete = () => {
    dispatch(removeFromCart(itemData))
  }

  return (
    <tr className="group">
      {columns.map((column, index) => (
        <td
          key={index}
          style={{ width: column.width, minWidth: column.minWidth }}
          className="px-4 py-5 align-top border-b border-gray-200 group-last:border-b-0"
        >
          {index === 0 ? (
            <div>
              <Link href={`/products/${itemData.id}`}>
                <Image
                  src={itemData.image}
                  alt={itemData.name}
                  height={80}
                  width={80}
                  className="w-20 h-20 rounded-md"
                />
              </Link>
            </div>
          ) : index === 1 ? (
            <div>
              <Link
                href={`/products/${itemData.id}`}
                title={itemData.name}
                className="font-bold hover:text-primary transition-colors overflow-hidden"
                style={{
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  display: '-webkit-box',
                }}
              >
                {itemData.name}
              </Link>
              <div className="text-gray-500 text-sm">
                Đơn vị: <span>{itemData.unit}</span>
              </div>
              <div className="text-gray-500 text-sm">
                Danh mục: <span>{itemData.categoryName}</span>
              </div>
            </div>
          ) : index === 2 ? (
            <div className="font-bold pt-1">
              <span>{formatMoney(itemData?.price)}</span>
              <span className="text-xs inline-block -translate-y-1 font-medium">₫</span>
            </div>
          ) : index === 3 ? (
            <div>
              {isView ? (
                <div>{itemData.amount}</div>
              ) : (
                <MyCounter
                  id={`counter-${itemData.id}`}
                  name={`counter-${itemData.id}`}
                  min={1}
                  max={itemData.amountInSystem}
                  value={itemData.amount}
                  onChange={handleChangeCounter}
                />
              )}
            </div>
          ) : index === 4 ? (
            <div>{itemData.amountInSystem}</div>
          ) : (
            <div
              title="Xóa"
              className="cursor-pointer h-9 w-full flex items-center text-gray-500 hover:text-danger transition-colors leading-none"
              onClick={handleClickDelete}
            >
              <i className="fa-solid fa-trash ext-lg"></i>
            </div>
          )}
        </td>
      ))}
    </tr>
  )
}

export default CartItem
