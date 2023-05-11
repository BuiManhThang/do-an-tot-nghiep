import { ValidateRule, Validator, useValidate } from '@/hooks/validateHook'
import React, { useEffect, useRef, useState } from 'react'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { CreateAssociationRule } from '@/types/associationRule'
import baseApi from '@/apis/baseApi'
import { ToastMsgType } from '@/enum/toastMsg'
import MyPopup from '../my-popup/MyPopup'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyTextField from '../my-text-field/MyTextField'
import axios from 'axios'

const VALIDATORS: Validator[] = [
  {
    field: 'min_support',
    name: 'Điểm hỗ trợ tối thiểu',
    rules: [ValidateRule.Required, ValidateRule.Custom],
    custom: (value, field, name, rules) => {
      if (value < 0.02 || value > 1) {
        return `${name} phải >= 0.02 và <= 1`
      }
      return ''
    },
  },
  {
    field: 'min_confidence',
    name: 'Điểm tin cậy tối thiểu',
    rules: [ValidateRule.Required, ValidateRule.Custom],
    custom: (value, field, name, rules) => {
      if (value < 0.02 || value > 1) {
        return `${name} phải >= 0.02 và <= 1`
      }
      return ''
    },
  },
]

type Props = {
  isActive?: boolean
  onClose?: () => void
  onSave?: () => void
}

const PopupGenerateAssociationRule = ({ isActive = false, onClose, onSave }: Props) => {
  const inputSupportRef = useRef<HTMLInputElement>(null)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate, setIsValidated, setError } = useValidate(VALIDATORS)
  const [isActiveConfigm, setIsActiveConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [associationRuleData, setAssociationRuleData] = useState<CreateAssociationRule>({
    min_confidence: 0.02,
    min_support: 0.02,
  })

  useEffect(() => {
    const initPopup = async () => {
      setIsLoading(true)
      try {
        setTimeout(() => {
          inputSupportRef.current?.focus()
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
    setAssociationRuleData({
      min_confidence: 0.02,
      min_support: 0.02,
    })
    setError({})
    setIsValidated(false)
  }, [isActive, setError, setIsValidated])

  const handleChange = (func: (prev: CreateAssociationRule) => CreateAssociationRule) => {
    return setAssociationRuleData((prev) => {
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
    const isValid = validate(associationRuleData)
    if (!isValid) {
      return
    }
    openPopupConfirm()
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    let isSuccess = false
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_RECOMMEND_SERVICE_URL}recommend-service`,
        {
          min_support: associationRuleData.min_support,
          min_confidence: associationRuleData.min_confidence,
        }
      )
      if (res.data === false) {
        isSuccess = false
        openToast({
          msg: `Không sinh được luật kết hợp nào`,
          type: ToastMsgType.Danger,
        })
      } else {
        openToast({
          msg: `Sinh luật kết hơp thành công`,
          type: ToastMsgType.Success,
        })
        isSuccess = true
      }
    } catch (error) {
      console.log(error)
      openToast({
        msg: `Sinh luật kết hơp thất bại`,
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
        title="Sinh luật kết hợp"
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
              text="Sinh luật"
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
                inputRef={inputSupportRef}
                id="min_support"
                name="min_support"
                label="Điểm hỗ trợ tối thiểu"
                required={true}
                type="number"
                min={0.02}
                max={1}
                step={0.01}
                value={associationRuleData.min_support}
                error={error.min_support}
                isParentLoading={isLoading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    min_support: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <MyTextField
                id="min_confidence"
                name="min_confidence"
                label="Điểm tin cậy tối thiểu"
                required={true}
                type="number"
                min={0.02}
                max={1}
                step={0.01}
                isParentLoading={isLoading}
                value={associationRuleData.min_confidence}
                error={error.min_confidence}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    min_confidence: Number(e.target.value),
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
          <span>{`Xác nhận sinh luật kết hợp `}</span>
        </div>
      </MyPopupConfirm>
    </>
  )
}

export default PopupGenerateAssociationRule
