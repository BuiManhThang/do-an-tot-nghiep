import React from 'react'

type Props = {
  score: number
  maxScore?: number
  className?: string
}

const MyDisplayStars = ({ score, className = '', maxScore = 5 }: Props) => {
  const fullStars: React.ReactNode[] = []
  const emptyStars: React.ReactNode[] = []

  for (let index = 1; index <= maxScore; index++) {
    if (index === parseInt(score.toString())) {
      if (score === parseInt(score.toString())) {
        fullStars.push(
          <div key={index}>
            <i className="fa-solid fa-star"></i>
          </div>
        )
        continue
      }
      fullStars.push(
        <div key={index}>
          <i className="fa-solid fa-star-half-stroke"></i>
        </div>
      )
      continue
    }
    if (index < score) {
      fullStars.push(
        <div key={index}>
          <i className="fa-solid fa-star"></i>
        </div>
      )
      continue
    }
    if (index > score) {
      emptyStars.push(
        <div key={index}>
          <i className="fa-regular fa-star"></i>
        </div>
      )
    }
  }

  return (
    <div className={'flex items-center ' + className}>
      {fullStars}
      {emptyStars}
    </div>
  )
}

export default MyDisplayStars
