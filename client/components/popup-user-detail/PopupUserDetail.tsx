import baseApi from '@/apis/baseApi'
import { ValidateRule, Validator, useValidate } from '@/hooks/validateHook'
import { User } from '@/types/user'
import React, { useEffect, useRef, useState } from 'react'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import MyPopup from '../my-popup/MyPopup'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyTextField from '../my-text-field/MyTextField'
import MyUploadThumbnail from '../my-upload-img/MyUploadThumbnail'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import MyRadio from '../my-radio/MyRadio'
import { PagingResult } from '@/types/paging'
import PopupWatchReview from '../popup-watch-review/PopupWatchReview'

const VALIDATORS: Validator[] = [
  {
    field: 'name',
    name: 'Họ tên',
    rules: [ValidateRule.Required],
  },
  {
    field: 'email',
    name: 'Email',
    rules: [ValidateRule.Required, ValidateRule.Email],
  },
  {
    field: 'phoneNumber',
    name: 'Số điện thoại',
    rules: [ValidateRule.PhoneNumber],
  },
]

type Props = {
  entityId?: string
  isActive?: boolean
  onClose?: () => void
  onSave?: () => void
}

const getNewCode = async () => {
  const res = await baseApi.get('/users/new-code')
  return res.data as string
}

const getEntityById = async (entityId: string): Promise<User> => {
  const res = await baseApi.get(`/users/${entityId}`)
  return res.data as User
}

const PopupUserDetail = ({ isActive = false, entityId, onClose, onSave }: Props) => {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate, setIsValidated } = useValidate(VALIDATORS)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [isActivePopupWatchReview, setIsActivePopupWatchReview] = useState(false)
  const [isActiveConfigm, setIsActiveConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [popupTitle, setPopupTitle] = useState('Thêm mới người dùng')
  const [entityData, setEntityData] = useState<User>({
    id: '',
    code: '',
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    avatar:
      'https://firebasestorage.googleapis.com/v0/b/do-an-tot-nghiep-16a34.appspot.com/o/images%2Fsystem%2Fdefault-avatar.jpg?alt=media&token=aa3b94e4-84ce-49c5-9631-f5e60db102fa',
    isAdmin: false,
    address: {
      city: '',
      district: '',
      detail: '',
    },
    cart: [],
    orders: [],
    viewHistorys: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  useEffect(() => {
    const getReviewsCount = async () => {
      try {
        const res = await baseApi.get('reviews/paging', {
          userId: entityId,
          pageSize: 1,
          pageIndex: 1,
        })
        const pagingResult: PagingResult = res.data
        setReviewsCount(pagingResult.total)
      } catch (error) {
        console.log(error)
        setReviewsCount(0)
      }
    }

    const initPopup = async () => {
      setIsLoading(true)
      if (entityId) {
        setPopupTitle('Cập nhật người dùng')
        try {
          getReviewsCount()
          const entityDataRes = await getEntityById(entityId)
          setEntityData({
            id: entityDataRes.id,
            code: entityDataRes.code,
            email: entityDataRes.email,
            password: '',
            name: entityDataRes.name,
            phoneNumber: entityDataRes.phoneNumber,
            avatar: entityDataRes.avatar,
            isAdmin: entityDataRes.isAdmin,
            address: entityDataRes.address
              ? {
                  city: entityDataRes.address.city ? entityDataRes.address.city : '',
                  district: entityDataRes.address.district ? entityDataRes.address.district : '',
                  detail: entityDataRes.address.detail ? entityDataRes.address.detail : '',
                }
              : {
                  city: '',
                  district: '',
                  detail: '',
                },
            cart: [],
            orders: [],
            viewHistorys: [],
            createdAt: new Date(),
            updatedAt: new Date(),
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

      setPopupTitle('Thêm mới người dùng')
      setReviewsCount(0)
      try {
        const newCodeRes = await getNewCode()
        setEntityData({
          id: '',
          code: newCodeRes,
          email: '',
          password: '',
          name: '',
          phoneNumber: '',
          avatar:
            'https://firebasestorage.googleapis.com/v0/b/do-an-tot-nghiep-16a34.appspot.com/o/images%2Fsystem%2Fdefault-avatar.jpg?alt=media&token=aa3b94e4-84ce-49c5-9631-f5e60db102fa',
          isAdmin: false,
          address: {
            city: '',
            district: '',
            detail: '',
          },
          cart: [],
          orders: [],
          viewHistorys: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        setTimeout(() => {
          emailInputRef.current?.focus()
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
      id: '',
      code: '',
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/do-an-tot-nghiep-16a34.appspot.com/o/images%2Fsystem%2Fdefault-avatar.jpg?alt=media&token=aa3b94e4-84ce-49c5-9631-f5e60db102fa',
      isAdmin: false,
      address: {
        city: '',
        district: '',
        detail: '',
      },
      cart: [],
      orders: [],
      viewHistorys: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setIsValidated(false)
  }, [isActive, entityId, setIsValidated])

  const handleChange = (func: (prev: User) => User) => {
    return setEntityData((prev) => {
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
    const isValid = validate(entityData)
    if (!isValid) {
      return
    }
    openPopupConfirm()
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    let isSuccess = false
    try {
      if (entityId) {
        await baseApi.put(`/users/${entityId}`, {
          code: entityData.code,
          email: entityData.email,
          name: entityData.name,
          phoneNumber: entityData.phoneNumber,
          avatar: entityData.avatar,
          address: entityData.address,
        })
        openToast({
          msg: `Cập nhật người dùng có mã ${entityData.code} thành công`,
          type: ToastMsgType.Success,
        })
      } else {
        await baseApi.post('/users', {
          code: entityData.code,
          email: entityData.email,
          name: entityData.name,
          phoneNumber: entityData.phoneNumber,
          avatar: entityData.avatar,
          address: entityData.address,
        })
        openToast({
          msg: `Lưu người dùng có mã ${entityData.code} thành công`,
          type: ToastMsgType.Success,
        })
      }
      isSuccess = true
    } catch (error) {
      console.log(error)
      if (entityId) {
        openToast({
          msg: `Cập nhật người dùng thất bại`,
          type: ToastMsgType.Danger,
        })
      } else {
        openToast({
          msg: `Lưu người dùng thất bại`,
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
        title={
          <div className="flex items-baseline gap-x-6">
            <div>{popupTitle}</div>
            {reviewsCount > 0 && (
              <div
                className="text-base text-primary cursor-pointer hover:underline"
                onClick={() => setIsActivePopupWatchReview(true)}
              >
                {reviewsCount} đánh giá
              </div>
            )}
          </div>
        }
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
              text={entityId ? 'Cập nhật' : 'Lưu'}
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
          <div className="w-[700px] grid grid-cols-2 grid-rows-[repeat(auto, 8)] gap-x-8 gap-y-4">
            <div className="row-start-1 row-end-7 col-start-1 col-end-2">
              <MyUploadThumbnail
                id="avatar"
                name="avatar"
                label="Ảnh đại diện"
                isParentLoading={isLoading}
                width={334}
                height={334}
                value={entityData.avatar}
                isShowChangeBtn={true}
                isShowRemoveBtn={false}
                onChange={(e: string) =>
                  handleChange((prev) => ({
                    ...prev,
                    avatar: e,
                  }))
                }
              />
            </div>

            <div className="row-start-1 row-end-2 col-start-2 col-end-3">
              <MyTextField
                id="code"
                name="code"
                label="Mã người dùng"
                required={true}
                value={entityData.code}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>

            <div className="row-start-2 row-end-3 col-start-2 col-end-3">
              <MyTextField
                inputRef={emailInputRef}
                id="email"
                name="email"
                label="Email"
                required={true}
                disabled={entityId ? true : false}
                isParentLoading={isLoading}
                value={entityData.email}
                error={error.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div className="row-start-3 row-end-4 col-start-2 col-end-3">
              <MyTextField
                inputRef={nameInputRef}
                id="name"
                name="name"
                label="Họ tên"
                required={true}
                isParentLoading={isLoading}
                value={entityData.name}
                error={error.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="row-start-4 row-end-5 col-start-2 col-end-3">
              <MyTextField
                id="phoneNumber"
                name="phoneNumber"
                label="Số điện thoại"
                isParentLoading={isLoading}
                value={entityData.phoneNumber}
                error={error.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="row-start-5 row-end-6 col-start-2 col-end-3">
              {isLoading ? (
                <div className="flex flex-col w-full">
                  <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />
                  <MyLoadingSkeleton className="w-full h-6 rounded-md" />
                </div>
              ) : (
                <>
                  <div className="w-max mb-1 cursor-default">Vai trò</div>
                  <div className="flex items-center gap-x-4 h-6">
                    <MyRadio
                      id="isAdminTrue"
                      name="isAdmin"
                      label="Quản trị"
                      value="true"
                      checked={entityData.isAdmin === true ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          isAdmin: e.target.value === 'true' ? true : false,
                        }))
                      }
                    />
                    <MyRadio
                      id="isAdminFalse"
                      name="isAdmin"
                      label="Khách hàng"
                      value="false"
                      checked={entityData.isAdmin === false ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          isAdmin: e.target.value === 'true' ? true : false,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="row-start-6 row-end-7 col-start-1 col-end-2">
              <MyTextField
                id="city"
                name="city"
                label="Tỉnh/Thành phố"
                isParentLoading={isLoading}
                value={entityData?.address?.city || ''}
                error={error.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      city: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="row-start-6 row-end-7 col-start-2 col-end-3">
              <MyTextField
                id="district"
                name="district"
                label="Quận/Huyện"
                isParentLoading={isLoading}
                value={entityData?.address?.district || ''}
                error={error.district}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      district: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="row-start-7 row-end-8 col-start-1 col-end-3">
              <MyTextField
                id="detail"
                name="detail"
                label="Địa chỉ chi tiết"
                isParentLoading={isLoading}
                value={entityData?.address?.detail || ''}
                error={error.detail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      detail: e.target.value,
                    },
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
          <span>{`Xác nhận ${entityId ? 'cập nhật' : 'lưu'} người dùng với mã `}</span>
          <span className="font-medium">{entityData.code}</span>
        </div>
      </MyPopupConfirm>

      <PopupWatchReview
        isActive={isActivePopupWatchReview}
        userId={entityId}
        onClose={() => setIsActivePopupWatchReview(false)}
      />
    </>
  )
}

export default PopupUserDetail
