import React, { useEffect, useState } from 'react'
import MyPopup from '../my-popup/MyPopup'
import MyButton from '../my-button/MyButton'
import { Review } from '@/types/review'
import Image from 'next/image'
import { convertDate } from '@/common/format'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import Link from 'next/link'

const getReviewsFunc = async (
  productId?: string,
  userId?: string,
  pageIndex = 1
): Promise<PagingResult> => {
  const res = await baseApi.get('reviews/paging', {
    productId,
    userId,
    sort: 'createdAt',
    direction: 'desc',
    pageSize: 10,
    pageIndex,
  })

  const pagingResult: PagingResult = res.data
  return pagingResult
}

type Props = {
  userId?: string
  productId?: string
  isActive?: boolean
  onClose?: () => void
}

const PopupWatchReview = ({ isActive = false, userId, productId, onClose }: Props) => {
  const [pageIndex, setPageIndex] = useState<number>(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    const getReviews = async () => {
      if (!productId && !userId) {
        setReviews([])
        setTotalRecords(0)
        return
      }
      try {
        const pagingResult = await getReviewsFunc(productId, userId)
        setReviews(pagingResult.data)
        setTotalRecords(pagingResult.total)
      } catch (error) {
        console.log(error)
        setReviews([])
        setTotalRecords(0)
      }
    }

    setPageIndex(1)
    getReviews()
  }, [isActive, userId, productId])

  const getReviewPaging = async (productId?: string, userId?: string, pageIndex: number = 1) => {
    if (!productId && !userId) return
    try {
      const pagingResult = await getReviewsFunc(productId, userId, pageIndex)
      setReviews([...reviews, ...pagingResult.data])
      setTotalRecords(pagingResult.total)
    } catch (error) {
      console.log(error)
      setReviews([])
      setTotalRecords(0)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (reviews.length === totalRecords) return

    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      const newPageIndex = pageIndex + 1
      getReviewPaging(productId, userId, newPageIndex)
      setPageIndex(newPageIndex)
    }
  }

  return (
    <MyPopup
      isActive={isActive}
      title="Danh sách đánh giá"
      onClose={onClose}
      footer={
        <div className="flex items-center gap-x-4 justify-end">
          <MyButton
            text="Đóng"
            style={{
              width: '80px',
            }}
            onClick={onClose}
          />
        </div>
      }
    >
      <ul className="w-[600px] max-h-[590px] overflow-auto pt-[2px]" onScroll={handleScroll}>
        {reviews.map((review) => (
          <div
            key={review.id}
            className="ml-2 border-b border-gray-300 mb-4 last:border-b-0 last:mb-0"
          >
            <div className="flex items-center gap-x-2">
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                width={32}
                height={32}
                className="w-8 h-8 object-cover object-center rounded-full ring-[1px] ring-black"
              />
              <div className="flex gap-x-1 items-end">
                <div className="font-bold leading-5">{review.user.name}</div>
                <div className="text-gray-600 text-sm">-</div>
                <div className="text-gray-600 text-sm">{convertDate(review.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center gap-x-3 my-1">
              <div className="flex items-center gap-x-1 py-2 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="text-yellow-400">
                    {star <= review.score ? (
                      <i className="fa-solid fa-star"></i>
                    ) : (
                      <i className="fa-regular fa-star"></i>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href={`products/${review.productId}`}
                className="flex-grow flex items-center gap-x-3 group"
              >
                <Image
                  src={review.product.image}
                  alt={review.product.name}
                  width={56}
                  height={56}
                  className="w-14 h-w-14 object-cover object-center ring-[1px] ring-gray-300"
                />
                <div
                  title={review.product.name}
                  className="font-bold group-hover:text-primary transition-colors overflow-hidden text-ellipsis pr-1"
                  style={{
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    display: '-webkit-box',
                  }}
                >
                  {review.product.name}
                </div>
              </Link>
            </div>
            <div className="mb-2">{review.comment}</div>
          </div>
        ))}
      </ul>
    </MyPopup>
  )
}

export default PopupWatchReview
