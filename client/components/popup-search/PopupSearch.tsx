import React, { useEffect, useRef, useState } from 'react'
import MyPopup from '../my-popup/MyPopup'
import MyTextField from '../my-text-field/MyTextField'
import { Product } from '@/types/product'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import Image from 'next/image'
import Link from 'next/link'
import { formatMoney } from '@/common/format'
import { useRouter } from 'next/router'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import MyButton from '../my-button/MyButton'

type Props = {
  isActive?: boolean
  onClose?: () => void
}

const PopupSearch = ({ isActive, onClose }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    } else {
      clearTimeout(timeoutFunc.current)
    }

    return () => {
      clearTimeout(timeoutFunc.current)
    }
  }, [isActive])

  const fetchProducts = async (currentSearchText: string) => {
    setIsLoading(true)
    try {
      const res = await baseApi.get('products/paging', {
        pageIndex: 1,
        pageSize: 5,
        searchText: currentSearchText,
        isActive: true,
      })

      const pagingResult: PagingResult = res.data
      setProducts(pagingResult.data)
      setTotalProducts(pagingResult.total)
    } catch (error) {
      console.log(error)
      setProducts([])
      setTotalProducts(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setProducts([])
    setSearchText('')
    setTotalProducts(0)
    if (typeof onClose !== 'function') return
    onClose()
  }

  const handleChangeSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    clearTimeout(timeoutFunc.current)
    timeoutFunc.current = setTimeout(() => {
      fetchProducts(e.target.value)
    }, 500)
  }

  const handleClickProduct = (selectedProduct: Product) => {
    handleClose()
    router.push(`products/${selectedProduct.id}`)
  }

  const handleWatchAll = () => {
    if (totalProducts === 0) return
    handleClose()
    router.push(`products?searchText=${searchText}`)
  }

  const handleClickStartIcon = () => {
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && totalProducts > 0) handleWatchAll()
  }

  return (
    <MyPopup
      isActive={isActive}
      overlayStyle={{
        alignItems: 'flex-start',
        paddingTop: '24px',
      }}
      bodyStyle={{
        padding: '0',
      }}
      isShowHeader={false}
      isCloseWhenClickOverlay={true}
      onClose={handleClose}
    >
      <div className="w-[600px]">
        <MyTextField
          id="search"
          inputRef={inputRef}
          name="search"
          placeholder="Tìm kiếm theo tên sản phẩm"
          inputStyle={{
            border: 'none',
            height: '56px',
            paddingRight: '36px',
            paddingLeft: '64px',
          }}
          startIcon={
            <i className="fa-solid fa-magnifying-glass text-gray-500 text-xl inline-block ml-2"></i>
          }
          value={searchText}
          onChange={handleChangeSearchText}
          onClickStartIcon={handleClickStartIcon}
          onKeyDown={handleKeyDown}
        />
        <div className="w-full">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((loadingItem) => (
              <div
                key={loadingItem}
                className="px-6 py-3 flex items-center gap-x-3 w-full cursor-default"
              >
                <MyLoadingSkeleton className="rounded-md w-20 h-20" />
                <div className="w-[460px]">
                  <MyLoadingSkeleton className="rounded-md h-4 mb-2 w-full" />
                  <MyLoadingSkeleton className="rounded-md h-4 mb-2 w-32" />
                  <MyLoadingSkeleton className="rounded-md h-4 w-48" />
                </div>
              </div>
            ))
          ) : (
            <>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="px-6 py-3 flex items-center gap-x-3 w-full cursor-pointer group transition-colors hover:bg-primary/10"
                  onClick={() => handleClickProduct(product)}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 border border-gray-300 rounded-md object-center object-cover"
                  />
                  <div className="w-[460px]">
                    <div
                      className="font-medium w-full leading-none mb-2 overflow-hidden text-ellipsis whitespace-nowrap transition-colors group-hover:text-primary"
                      title={product.name}
                    >
                      {product.name}
                    </div>
                    <div className="text-gray-500 leading-none mb-2">
                      <span>Đơn vị: </span>
                      <span>{product.unit}</span>
                    </div>
                    <div className="text-gray-500 leading-none">
                      <span>Giá bán: </span>
                      <span className="text-primary">{formatMoney(product.price)}đ</span>
                    </div>
                  </div>
                </div>
              ))}
              {totalProducts > 0 && (
                <MyButton
                  text={`Xem tất cả ${totalProducts} sản phẩm`}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '0 0 6px 6px',
                  }}
                  onClick={handleWatchAll}
                />
              )}
            </>
          )}
        </div>
      </div>
    </MyPopup>
  )
}

export default PopupSearch
