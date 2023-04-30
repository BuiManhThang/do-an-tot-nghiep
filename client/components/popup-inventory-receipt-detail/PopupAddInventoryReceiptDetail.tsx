import React, { useEffect, useState } from 'react'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyPopup from '../my-popup/MyPopup'
import MySelect, { MySelectOption } from '../my-select/MySelect'
import MyTextField from '../my-text-field/MyTextField'
import { CreateInventoryReceiptDetail } from '@/types/inventoryReceipt'
import { Product } from '@/types/product'
import { ValidateRule, useValidate, Validator } from '@/hooks/validateHook'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'

type Props = {
  isActive?: boolean
  value: CreateInventoryReceiptDetail | null
  onClose?: () => void
  onChange?: (newVal: CreateInventoryReceiptDetail) => void
}

const VALIDATORS: Validator[] = [
  {
    field: 'productId',
    name: 'Sản phẩm',
    rules: [ValidateRule.Required],
  },
  {
    field: 'importPrice',
    name: 'Giá nhập',
    rules: [ValidateRule.Required],
  },
  {
    field: 'amount',
    name: 'Số lượng',
    rules: [ValidateRule.Required],
  },
]

const PopupAddInventoryReceiptDetail = ({ isActive, value, onClose, onChange }: Props) => {
  const { error, isValidated, validate, setIsValidated } = useValidate(VALIDATORS)
  const [totalProducts, setTotalProducts] = useState(0)
  const [productOptions, setProductOptions] = useState<MySelectOption[]>([])
  const [inventoryReceiptDetailData, setInventoryReceiptDetailData] =
    useState<CreateInventoryReceiptDetail>({
      amount: '',
      importPrice: '',
      productId: '',
    })

  useEffect(() => {
    if (isActive) {
      setInventoryReceiptDetailData({
        amount: value?.amount || '',
        importPrice: value?.importPrice || '',
        productId: value?.productId || null,
      })
      return
    }
    setInventoryReceiptDetailData({
      amount: '',
      importPrice: '',
      productId: '',
    })
    setIsValidated(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const handleQueryProducts = async (pageIndex: number, searchText: string) => {
    if (pageIndex * 20 >= totalProducts && totalProducts !== 0) return
    try {
      const res = await baseApi.get('products/paging', {
        pageIndex,
        pageSize: 20,
        searchText,
        isActive: true,
      })

      const pagingResult: PagingResult = res.data
      const formatProductOptions: MySelectOption[] = pagingResult.data.map((p: Product) => {
        return {
          text: p.name,
          value: p.id,
          extraData: p,
        }
      })
      if (pageIndex === 1) {
        setProductOptions(formatProductOptions)
        return
      }
      setProductOptions((prev) => [...prev, ...formatProductOptions])
      setTotalProducts(pagingResult.total)
    } catch (error) {
      console.log(error)
      setProductOptions([])
      setTotalProducts(0)
    }
  }

  const handleChange = (
    func: (prev: CreateInventoryReceiptDetail) => CreateInventoryReceiptDetail
  ) => {
    return setInventoryReceiptDetailData((prev) => {
      const newVal = func(prev)
      if (isValidated) {
        validate(newVal)
      }
      return newVal
    })
  }

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!validate(inventoryReceiptDetailData)) return
    const productData: Product =
      productOptions.find((p) => p.value === inventoryReceiptDetailData.productId)?.extraData ||
      null
    if (typeof onChange === 'function')
      onChange({ ...inventoryReceiptDetailData, product: productData })
    if (typeof onClose === 'function') onClose()
  }

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (typeof onClose === 'function') onClose()
  }

  return (
    <MyPopup
      isActive={isActive}
      title="Sản phẩm nhập"
      onClose={onClose}
      footer={
        <div className="flex items-center gap-x-4 justify-end">
          <MyButton
            text="Hủy"
            type={MyButtonType.Secondary}
            style={{
              width: '80px',
            }}
            onClick={handleClose}
          />
          <MyButton
            text={value ? 'Sửa' : 'Thêm'}
            style={{
              width: '80px',
            }}
            onClick={handleSave}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-y-4 w-[380px]">
        <div>
          <MySelect
            id="productId"
            name="productId"
            label="Sản phẩm"
            value={inventoryReceiptDetailData.productId}
            required={true}
            options={productOptions}
            isSelectOnly={false}
            error={error.productId}
            disabled={value ? true : false}
            onQuery={handleQueryProducts}
            onChange={(e: string | number | boolean | undefined | null) =>
              handleChange((prev) => ({
                ...prev,
                productId: `${e}`,
              }))
            }
          />
        </div>

        <div className="row-start-3 row-end-4">
          <MyTextField
            id="importPrice"
            name="importPrice"
            label="Giá nhập"
            type="number"
            min={0}
            required={true}
            value={inventoryReceiptDetailData.importPrice}
            error={error.importPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange((prev) => ({
                ...prev,
                importPrice: parseInt(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <MyTextField
            id="amount"
            name="amount"
            label="Số lượng"
            type="number"
            min={0}
            required={true}
            error={error.amount}
            value={inventoryReceiptDetailData.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange((prev) => ({
                ...prev,
                amount: parseInt(e.target.value),
              }))
            }
          />
        </div>
      </div>
    </MyPopup>
  )
}

export default PopupAddInventoryReceiptDetail
