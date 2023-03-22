import React from 'react'

type Props = {
  children?: React.ReactNode | React.ReactNode[]
}

const ProductCardList = ({ children }: Props) => {
  return <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">{children}</div>
}

export default ProductCardList
