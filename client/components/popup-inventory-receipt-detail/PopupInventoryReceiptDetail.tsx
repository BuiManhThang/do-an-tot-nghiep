import React, { useEffect, useRef, useState } from 'react'
import MyPopup from '../my-popup/MyPopup'
import MyTextField from '../my-text-field/MyTextField'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyTextArea from '../my-textarea/MyTextarea'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'
import { CreateCategory } from '@/types/category'
import baseApi from '@/apis/baseApi'
import { useValidate, ValidateRule, Validator } from '@/hooks/validateHook'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import {
  CreateInventoryReceipt,
  CreateInventoryReceiptDetail,
  InventoryReceipt,
} from '@/types/inventoryReceipt'
import InventoryReceiptDetails from './InventoryReceiptDetails'
import { useAppSelector } from '@/hooks/reduxHook'
import { convertDate } from '@/common/format'

const VALIDATORS: Validator[] = [
  {
    field: 'inventoryReceiptDetails',
    name: 'Sản phẩm',
    rules: [ValidateRule.Required],
  },
]

type Props = {
  entityId?: string
  isActive?: boolean
  onClose?: () => void
  onSave?: () => void
}

const getNewCode = async () => {
  const res = await baseApi.get('/inventoryReceipts/new-code')
  return res.data as string
}

const getEntityById = async (entityId: string): Promise<InventoryReceipt> => {
  const res = await baseApi.get(`/inventoryReceipts/${entityId}`)
  return res.data as InventoryReceipt
}

const PopupInventoryReceiptDetail = ({ isActive = false, entityId, onClose, onSave }: Props) => {
  const { error, isValidated, validate, setIsValidated } = useValidate(VALIDATORS)
  const useInfo = useAppSelector((state) => state.user.userInfo)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { openToast } = useToastMsg()
  const [isActiveConfirm, setIsActiveConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [popupTitle, setPopupTitle] = useState('Thêm mới đơn nhập')
  const [entityData, setEntityData] = useState<CreateInventoryReceipt>({
    code: '',
    note: '',
    inventoryReceiptDetails: [],
  })

  useEffect(() => {
    const initPopup = async () => {
      setIsLoading(true)
      if (entityId) {
        setPopupTitle('Xem đơn nhập')
        try {
          const entityDataRes = await getEntityById(entityId)
          setEntityData({
            code: entityDataRes.code,
            note: entityDataRes.note || '',
            inventoryReceiptDetails: entityDataRes.inventoryReceiptDetails,
          })
          setTimeout(() => {
            nameInputRef.current?.focus()
          }, 10)
        } catch (error) {
          console.log(error)
        } finally {
          setIsLoading(false)
        }
        return
      }

      setPopupTitle('Thêm mới đơn nhập')
      try {
        const newCodeRes = await getNewCode()
        setEntityData((prev) => ({
          ...prev,
          code: newCodeRes,
        }))
        setTimeout(() => {
          nameInputRef.current?.focus()
        }, 10)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isActive) {
      initPopup()
      return
    }
    setEntityData({
      code: '',
      note: '',
      inventoryReceiptDetails: [],
    })
    setIsValidated(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, entityId])

  const handleChange = (func: (prev: CreateInventoryReceipt) => CreateInventoryReceipt) => {
    return setEntityData((prev) => {
      const newVal = func(prev)
      if (isValidated) {
        validate(newVal)
      }
      return newVal
    })
  }

  const openPopupConfirm = () => {
    if (!validate(entityData)) return
    setIsActiveConfirm(true)
  }

  const closePopupConfirm = () => {
    setIsActiveConfirm(false)
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    let isSuccess = false
    try {
      await baseApi.post('/inventoryReceipts', {
        ...entityData,
      })
      openToast({
        msg: `Lưu đơn nhập có mã ${entityData.code} thành công`,
        type: ToastMsgType.Success,
      })
      isSuccess = true
    } catch (error) {
      console.log(error)
      openToast({
        msg: `Lưu đơn nhập thất bại`,
        type: ToastMsgType.Danger,
      })
    } finally {
      setIsLoadingSave(false)
      closePopupConfirm()
    }
    if (isSuccess) {
      if (typeof onSave === 'function') onSave()
    }
  }

  return (
    <>
      <MyPopup
        isActive={isActive}
        title={popupTitle}
        onClose={onClose}
        footer={
          <div className="flex items-center gap-x-4 justify-end">
            <MyButton
              text="Đóng"
              type={MyButtonType.Secondary}
              style={{
                width: '80px',
              }}
              disabled={isLoading}
              onClick={onClose}
            />
            {!entityId && (
              <MyButton
                text="Lưu"
                style={{
                  width: '80px',
                }}
                disabled={isLoading}
                onClick={openPopupConfirm}
              />
            )}
          </div>
        }
      >
        <form>
          <div className="w-[700px] grid grid-rows-[repeat(auto, 4)] grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <MyTextField
                id="code"
                name="code"
                label="Mã đơn nhập"
                required={true}
                value={entityData.code}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>

            <div className="col-start-2 col-end-3 row-start-1 row-end-4">
              <MyTextArea
                id="note"
                name="note"
                label="Ghi chú"
                isParentLoading={isLoading}
                value={entityData.note}
                height={196}
                disabled={entityId ? true : false}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
              />
            </div>

            <div className="h-16 col-start-1 col-end-2">
              <MyTextField
                id="userId"
                name="userId"
                label="Người lập"
                value={useInfo?.name}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>
            <div className="h-16 col-start-1 col-end-2">
              <MyTextField
                id="createdAt"
                name="createdAt"
                label="Ngày lập"
                value={convertDate(new Date())}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>

            <div className="col-start-1 col-end-3 row-start-4">
              <InventoryReceiptDetails
                required={true}
                value={entityData.inventoryReceiptDetails}
                error={error.inventoryReceiptDetails}
                isParentLoading={isLoading}
                disabled={entityId ? true : false}
                onChange={(e: CreateInventoryReceiptDetail[]) =>
                  handleChange((prev) => ({
                    ...prev,
                    inventoryReceiptDetails: e,
                  }))
                }
              />
            </div>
          </div>
        </form>
      </MyPopup>

      <MyPopupConfirm
        isActive={isActiveConfirm}
        isLoading={isLoadingSave}
        onClose={closePopupConfirm}
        onAgree={handleSave}
      >
        <div>
          <span>{`Xác nhận ${entityId ? 'cập nhật' : 'lưu'} đơn nhập với mã `}</span>
          <span className="font-medium">{entityData.code}</span>
        </div>
      </MyPopupConfirm>
    </>
  )
}

export default PopupInventoryReceiptDetail
