import React from 'react'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'

const LoadingProductCart = () => {
  return (
    <div className="rounded-lg bg-white shadow-custom overflow-hidden group hover:shadow-custom-xl transition-shadow duration-300">
      <MyLoadingSkeleton className="w-full h-[350px] lg:h-[250px] mb-3" />
      <div className="pb-3 px-3">
        <MyLoadingSkeleton className="h-[18px] rounded-md mb-1" />
        <MyLoadingSkeleton className="mb-2 h-[18px] rounded-md" />
        <MyLoadingSkeleton className="h-[14px] w-28 mb-1 rounded-md" />
        <div className="flex items-center justify-between">
          <MyLoadingSkeleton className="h-[30px] w-16 rounded-md" />
          <MyLoadingSkeleton className="h-[30px] w-[132px] rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default LoadingProductCart
