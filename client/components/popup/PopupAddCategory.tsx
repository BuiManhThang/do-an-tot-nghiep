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

const VALIDATORS: Validator[] = [
  {
    field: 'name',
    name: 'Tên danh mục',
    rules: [ValidateRule.Required],
  },
]

type Props = {
  categoryId?: string
  isActive?: boolean
  onClose?: () => void
  onSave?: () => void
}

const getNewCode = async () => {
  const res = await baseApi.get('/categories/new-code')
  return res.data as string
}

const getCategoryById = async (categoryId: string): Promise<CreateCategory> => {
  const res = await baseApi.get(`/categories/${categoryId}`)
  return res.data as CreateCategory
}

const PopupAddCategory = ({ isActive = false, categoryId, onClose, onSave }: Props) => {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate, setIsValidated } = useValidate(VALIDATORS)
  const [isActiveConfigm, setIsActiveConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [popupTitle, setPopupTitle] = useState('Thêm mới danh mục')
  const [categoryData, setCategoryData] = useState<CreateCategory>({
    code: '',
    name: '',
    desc: '',
    image: '',
  })

  useEffect(() => {
    const initPopup = async () => {
      setIsLoading(true)
      if (categoryId) {
        setPopupTitle('Cập nhật danh mục')
        try {
          const categoryDataRes = await getCategoryById(categoryId)
          setCategoryData({
            code: categoryDataRes.code,
            name: categoryDataRes.name,
            desc: categoryDataRes.desc,
            image: '',
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

      setPopupTitle('Thêm mới danh mục')
      try {
        const newCodeRes = await getNewCode()
        setCategoryData((prev) => ({
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
    setCategoryData({
      code: '',
      name: '',
      desc: '',
      image: '',
    })
    setIsValidated(false)
  }, [isActive, categoryId, setIsValidated])

  const handleChange = (func: (prev: CreateCategory) => CreateCategory) => {
    return setCategoryData((prev) => {
      const newVal = func(prev)
      if (isValidated) {
        validate(newVal)
      }
      return newVal
    })
  }

  const openPopupConfirm = () => {
    setIsActiveConfirm(true)
  }

  const closePopupConfirm = () => {
    setIsActiveConfirm(false)
  }

  const handleOpenPopupConfirm = () => {
    const isValid = validate(categoryData)
    if (!isValid) {
      return
    }
    openPopupConfirm()
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    let isSuccess = false
    try {
      if (categoryId) {
        await baseApi.put(`/categories/${categoryId}`, {
          ...categoryData,
        })
        openToast({
          msg: `Cập nhật danh mục có mã ${categoryData.code} thành công`,
          type: ToastMsgType.Success,
        })
      } else {
        await baseApi.post('/categories', {
          ...categoryData,
        })
        openToast({
          msg: `Lưu danh mục có mã ${categoryData.code} thành công`,
          type: ToastMsgType.Success,
        })
      }
      isSuccess = true
    } catch (error) {
      console.log(error)
      if (categoryId) {
        openToast({
          msg: `Cập nhật danh mục thất bại`,
          type: ToastMsgType.Danger,
        })
      } else {
        openToast({
          msg: `Lưu danh mục thất bại`,
          type: ToastMsgType.Danger,
        })
      }
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
            <MyButton
              text={categoryId ? 'Cập nhật' : 'Lưu'}
              style={{
                width: '80px',
              }}
              disabled={isLoading}
              onClick={handleOpenPopupConfirm}
            />
          </div>
        }
      >
        <form>
          <div className="w-[382px] grid grid-cols-1 gap-y-4">
            <div>
              <MyTextField
                id="code"
                name="code"
                label="Mã danh mục"
                required={true}
                value={categoryData.code}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>

            <div>
              <MyTextField
                id="name"
                name="name"
                label="Tên danh mục"
                required={true}
                isParentLoading={isLoading}
                inputRef={nameInputRef}
                value={categoryData.name}
                error={error.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <MyTextArea
                id="desc"
                name="desc"
                label="Mô tả"
                isParentLoading={isLoading}
                value={categoryData.desc}
                height={95}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    desc: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </form>
      </MyPopup>

      <MyPopupConfirm
        isActive={isActiveConfigm}
        isLoading={isLoadingSave}
        onClose={closePopupConfirm}
        onAgree={handleSave}
      >
        <div>
          <span>{`Xác nhận ${categoryId ? 'cập nhật' : 'lưu'} danh mục với mã `}</span>
          <span className="font-medium">{categoryData.code}</span>
        </div>
      </MyPopupConfirm>
    </>
  )
}

export default PopupAddCategory
