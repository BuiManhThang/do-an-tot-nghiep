import React from 'react'
import MyPopup from '../my-popup/MyPopup'
import MyButton from '../my-button/MyButton'
import { AssociationRule } from '@/types/associationRule'
import Image from 'next/image'
import { formatMoney } from '@/common/format'

type Props = {
  isActive?: boolean
  associationRule?: AssociationRule
  onClose?: () => void
}

const PopupAssociationRuleDetail = ({ isActive, associationRule, onClose }: Props) => {
  if (!associationRule) return <></>

  return (
    <MyPopup
      isActive={isActive}
      title="Chi tiết luật kết hợp"
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
      <div className="w-[760px]">
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <div className="font-medium mb-3">Tập sản phẩm đầu vào</div>
            <div className="max-h-[256px] overflow-auto">
              {associationRule.productAntecedents.map((product) => (
                <div key={product.id} className="flex items-center mb-2 last:mb-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 mr-3 rounded-md border border-gray-300 object-contain object-center"
                  />
                  <div>
                    <div className="text-sm mb-1">
                      <span>Mã: </span>
                      <span className="font-medium">{product.code}</span>
                    </div>
                    <div className="text-sm mb-1 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                      <span>Tên: </span>
                      <span title={product.name}>{product.name}</span>
                    </div>
                    <div className="text-sm text-primary">
                      <span>Giá: </span>
                      <span>{formatMoney(product.price)}đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-medium mb-3">Tập sản phẩm đầu ra</div>
            <div>
              {associationRule.productConsequents.map((product) => (
                <div key={product.id} className="flex items-center mb-2 last:mb-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 mr-3 rounded-md border border-gray-300 object-contain object-center"
                  />
                  <div>
                    <div className="text-sm mb-1">
                      <span>Mã: </span>
                      <span className="font-medium">{product.code}</span>
                    </div>
                    <div className="text-sm mb-1 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                      <span>Tên: </span>
                      <span title={product.name}>{product.name}</span>
                    </div>
                    <div className="text-sm text-primary">
                      <span>Giá: </span>
                      <span>{formatMoney(product.price)}đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5">
          <div>
            <span>Điểm hỗ trợ tập sản phẩm đầu vào: </span>
            <span className="font-medium">
              {Number(associationRule.antecedentSupport * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span>Điểm hỗ trợ tập sản phẩm đầu ra: </span>
            <span className="font-medium">
              {Number(associationRule.consequentSupport * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span>Điểm hỗ trợ: </span>
            <span className="font-medium">{Number(associationRule.support * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span>Điểm tin cậy: </span>
            <span className="font-medium">
              {Number(associationRule.confidence * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </MyPopup>
  )
}

export default PopupAssociationRuleDetail
