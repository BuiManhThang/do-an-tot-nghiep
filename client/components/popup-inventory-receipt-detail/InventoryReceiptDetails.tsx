import { CreateInventoryReceiptDetail, InventoryReceiptDetail } from '@/types/inventoryReceipt'
import React, { useState } from 'react'
import MyTable, { Column, TableAlign, TableDataType } from '../my-table/MyTable'
import Image from 'next/image'
import PopupAddInventoryReceiptDetail from './PopupAddInventoryReceiptDetail'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'

const COLUMNS: Column[] = [
  {
    dataType: TableDataType.Text,
    fieldName: 'product',
    childFieldName: 'code',
    title: 'Mã sản phẩm',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'image',
    title: 'Hình ảnh',
    width: 120,
    minWidth: 120,
    template: (rowData) => {
      const inventoryReceiptDetail: InventoryReceiptDetail = rowData as InventoryReceiptDetail
      return (
        <div className="flex items-center justify-center py-1">
          <Image
            src={inventoryReceiptDetail.product.image}
            alt={inventoryReceiptDetail.product.name}
            width={78}
            height={78}
            className="object-contain object-center w-20 h-20 rounded-md overflow-hidden border border-gray-200"
          />
        </div>
      )
    },
  },
  {
    dataType: TableDataType.Text,
    align: TableAlign.Right,
    fieldName: 'amount',
    title: 'Số lượng',
    width: 150,
    minWidth: 150,
  },
  {
    dataType: TableDataType.Money,
    align: TableAlign.Right,
    fieldName: 'importPrice',
    title: 'Giá nhập',
    width: 150,
    minWidth: 150,
  },
]

type Props = {
  label?: string
  required?: boolean
  error?: string
  value: CreateInventoryReceiptDetail[]
  disabled?: boolean
  isParentLoading?: boolean
  onChange?: (newVal: CreateInventoryReceiptDetail[]) => void
}

const InventoryDetail = ({
  label = 'Sản phẩm',
  required = false,
  error,
  value,
  disabled = false,
  isParentLoading = false,
  onChange,
}: Props) => {
  const [isActivePopupDelete, setIsActivePopupDelete] = useState(false)
  const [isActivePopupAdd, setIsActivePopupAdd] = useState(false)
  const [selectedInventoryReceiptDetail, setSelectedInventoryReceiptDetail] =
    useState<CreateInventoryReceiptDetail | null>(null)
  const openPopupAddInventoryReceiptDetail = (
    inventoryReceiptDetail?: CreateInventoryReceiptDetail
  ) => {
    if (disabled) return
    setSelectedInventoryReceiptDetail(inventoryReceiptDetail || null)
    setIsActivePopupAdd(true)
  }

  const handleChange = (newVal: CreateInventoryReceiptDetail) => {
    if (typeof onChange !== 'function') return
    const foundIndex = value.findIndex((x) => x.productId === newVal.productId)
    if (foundIndex === -1) {
      onChange([...value, newVal])
      return
    }
    const newValueEmit: CreateInventoryReceiptDetail[] = JSON.parse(JSON.stringify(value))
    newValueEmit.splice(foundIndex, 1, newVal)
    onChange(newValueEmit)
  }

  const handleDelete = (inventoryReceiptDetail?: CreateInventoryReceiptDetail) => {
    if (typeof onChange !== 'function') return
    const foundIndex = value.findIndex((x) => x.productId === inventoryReceiptDetail?.productId)
    if (foundIndex === -1) {
      return
    }
    const newValueEmit: CreateInventoryReceiptDetail[] = JSON.parse(JSON.stringify(value))
    newValueEmit.splice(foundIndex, 1)
    onChange(newValueEmit)
  }

  return (
    <div className={`flex flex-col w-full`}>
      {(!disabled || label.length > 0) && (
        <div className={`mb-1 flex ${label ? 'justify-between' : 'justify-end'}`}>
          {label && (
            <label className="w-max" onClick={() => openPopupAddInventoryReceiptDetail()}>
              {label}
              {required && <span className="text-red-600 font-medium pl-1">*</span>}
            </label>
          )}
          {!disabled && (
            <div
              className="cursor-pointer text-primary transition-colors hover:text-primary-hover"
              onClick={() => openPopupAddInventoryReceiptDetail()}
            >
              <i className="fa-solid fa-plus"></i> <span className="pl-1 font-medium">Thêm</span>
            </div>
          )}
        </div>
      )}
      {isParentLoading ? (
        <MyLoadingSkeleton className="w-full h-[400px] rounded-md" />
      ) : (
        <div className="w-full relative">
          <div className="h-[400px]">
            <MyTable
              columns={COLUMNS}
              data={value}
              rowIdField="id"
              haveRowIndex={true}
              selectedRows={[]}
              editIcon={
                !disabled && (
                  <i className="fa-solid fa-pen-to-square text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
                )
              }
              deleteIcon={
                !disabled && (
                  <i className="fa-solid fa-trash ext-lg text-gray-700 leading-none cursor-pointer transition-colors hover:text-red-600"></i>
                )
              }
              onEdit={(selectedRow) => openPopupAddInventoryReceiptDetail(selectedRow)}
              onDelete={handleDelete}
            />
          </div>
          {error && (
            <div className="absolute top-[22px] z-[2] right-3 -translate-y-1/2 group">
              <span className="text-red-600">
                <i className="fa-solid fa-circle-info"></i>
              </span>
              <div className="absolute opacity-0 invisible w-max bottom-full -right-3 bg-white transition-all shadow-custom px-2 py-1 text-sm rounded-md group-hover:opacity-100 group-hover:visible">
                {error}
              </div>
            </div>
          )}
        </div>
      )}

      <PopupAddInventoryReceiptDetail
        isActive={isActivePopupAdd}
        value={selectedInventoryReceiptDetail}
        onChange={handleChange}
        onClose={() => setIsActivePopupAdd(false)}
      />
    </div>
  )
}

export default InventoryDetail
