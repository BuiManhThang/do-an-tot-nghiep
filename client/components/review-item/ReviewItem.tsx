import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import { Product } from '@/types/product'
import { Review } from '@/types/review'
import MyTextArea from '../my-textarea/MyTextarea'
import MyButton from '../my-button/MyButton'
import React, { useEffect, useState } from 'react'
import { ValidateRule, Validator, useValidate } from '@/hooks/validateHook'
import { useAppSelector } from '@/hooks/reduxHook'
import Image from 'next/image'
import { convertDate } from '@/common/format'

type Props = {
  productId: string
  onChangeTotalReviews?: (e: number) => void
  onChangeAvgScore?: (e: number) => void
}

const VALIDATORS: Validator[] = [
  {
    field: 'comment',
    name: ' Nội dung đánh giá',
    rules: [ValidateRule.Required],
  },
]

const getReviewsFunc = async (productId: string): Promise<Review[]> => {
  const res = await baseApi.get('reviews/paging', {
    productId,
    sort: 'createdAt',
    direction: 'desc',
  })

  const pagingResult: PagingResult = res.data
  const reviews: Review[] = pagingResult.data
  return reviews
}

const ReviewItem = ({ productId, onChangeAvgScore, onChangeTotalReviews }: Props) => {
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const [reviews, setReviews] = useState<Review[]>([])
  const [hoverStar, setHoverStar] = useState(0)
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState('')
  const [isLoadingSend, setIsLoadingSend] = useState(false)
  const [avgScore, setAvgScore] = useState('0')
  const [numberScore, setNumberScore] = useState<number[]>([0, 0, 0, 0, 0])
  const { validate, isValidated, error } = useValidate(VALIDATORS)

  useEffect(() => {
    const getReviews = async () => {
      if (!productId) return
      try {
        const reviewsRes = await getReviewsFunc(productId)
        setReviews(reviewsRes)
      } catch (error) {
        console.log(error)
        setReviews([])
      }
    }

    getReviews()
  }, [productId])

  useEffect(() => {
    if (reviews.length === 0) {
      setAvgScore('0')
      setNumberScore([0, 0, 0, 0, 0])
      if (typeof onChangeAvgScore === 'function') onChangeAvgScore(0)
      if (typeof onChangeTotalReviews === 'function') onChangeTotalReviews(0)
      return
    }
    let oneScore = 0
    let twoScore = 0
    let threeScore = 0
    let fourScore = 0
    let fiveScore = 0
    const totalScore = reviews.reduce((prev, cur) => {
      switch (cur.score) {
        case 1:
          oneScore += 1
          break
        case 2:
          twoScore += 1
          break
        case 3:
          threeScore += 1
          break
        case 4:
          fourScore += 1
          break
        case 5:
          fiveScore += 1
          break
        default:
          break
      }
      return prev + cur.score
    }, 0)

    const tmpAvgScore = totalScore / reviews.length
    setAvgScore(tmpAvgScore.toFixed(1))
    setNumberScore([oneScore, twoScore, threeScore, fourScore, fiveScore])
    if (typeof onChangeAvgScore === 'function') onChangeAvgScore(tmpAvgScore)
    if (typeof onChangeTotalReviews === 'function') onChangeTotalReviews(reviews.length)
  }, [reviews, onChangeAvgScore, onChangeTotalReviews])

  const handleChangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isValidated) {
      validate({ comment })
    }
    setComment(e.target.value)
  }

  const handleClickSend = async () => {
    if (!validate({ comment })) return
    setIsLoadingSend(true)
    try {
      await baseApi.post('reviews', {
        productId,
        userId: userInfo?.id,
        score,
        comment,
      })
      const reviewsRes = await getReviewsFunc(productId)
      setScore(5)
      setComment('')
      setReviews(reviewsRes)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingSend(false)
    }
  }

  return (
    <div className="grid grid-cols-3 border-t border-gray-300">
      {/* Make comment */}
      <div className="pt-4 pr-4 border-r border-gray-300">
        <div className="pb-4 border-b border-gray-300 grid grid-cols-3 gap-x-6">
          <div className="flex items-center justify-center">
            <div>
              <div className="text-5xl font-bold text-center mb-1">{avgScore}</div>
              <div className="text-xs text-center">{`${reviews.length} đánh giá`}</div>
            </div>
          </div>
          <div className="col-start-2 col-end-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-x-2 mb-4 last:mb-0">
                <div className="text-gray-600 leading-none">{star}</div>
                <div className="text-yellow-400">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                  <div
                    className="h-3 bg-yellow-400 rounded"
                    style={{
                      width: `${
                        reviews.length === 0 ? 0 : (numberScore[star - 1] / reviews.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <div className="font-bold mb-3">Viết đánh giá của riêng bạn</div>
          <div className="flex items-center mb-4">
            <div className="text-gray-600 mr-2">Chất lượng:</div>
            <div className="flex items-center gap-x-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`cursor-pointer transition-colors ${
                    star <= score || star <= hoverStar ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setScore(star)}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                >
                  <i className="fa-solid fa-star"></i>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="inline-block mb-1 text-gray-600">
              Đánh giá của bạn về sản phẩm:
            </label>
            <MyTextArea
              id="comment"
              name="comment"
              height={130}
              inputStyle={{
                backgroundColor: 'transparent',
              }}
              error={error.comment}
              value={comment}
              onChange={handleChangeComment}
            />
          </div>
          <div className="flex justify-center">
            <MyButton
              text="Gửi"
              style={{
                width: '120px',
                height: '40px',
              }}
              isLoading={isLoadingSend}
              onClick={handleClickSend}
            />
          </div>
        </div>
      </div>

      {/* Comment list */}
      <div className="pt-4 pl-4 col-start-2 col-end-4 max-h-[530px] overflow-auto">
        {reviews.length === 0 && <div className="text-gray-600">Chưa có đánh giá!!!</div>}
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
            <div className="flex items-center gap-x-1 py-2">
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
            <div className="mb-2">{review.comment}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewItem
