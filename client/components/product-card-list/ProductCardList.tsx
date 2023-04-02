import React from 'react'

type Props = {
  children?: React.ReactNode | React.ReactNode[]
  isInProductsView?: boolean
}

const ProductCardList = ({ children, isInProductsView }: Props) => {
  if (isInProductsView)
    return <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">{children}</div>
  return <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">{children}</div>
}

export default ProductCardList
