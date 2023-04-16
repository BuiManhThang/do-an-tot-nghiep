import React, { useEffect, useRef, useState } from 'react'
import MyPopup from '../my-popup/MyPopup'
import MyTextField from '../my-text-field/MyTextField'
import MySelect, { MySelectOption } from '../my-select/MySelect'
import MyUploadImages from '../my-upload-img/MyUploadImages'
import MyUploadThumbnail from '../my-upload-img/MyUploadThumbnail'
import MyButton, { MyButtonType } from '../my-button/MyButton'
import MyTextArea from '../my-textarea/MyTextarea'
import MyRadio from '../my-radio/MyRadio'
import MyLoadingSkeleton from '../my-loading-skeleton/MyLoadingSkeleton'
import MyPopupConfirm from '../my-popup/MyPopupConfirm'
import { CreateProduct } from '@/types/product'
import { Category } from '@/types/category'
import baseApi from '@/apis/baseApi'
import { useValidate, ValidateRule, Validator } from '@/hooks/validateHook'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import { PagingResult } from '@/types/paging'
import PopupWatchReview from '../popup-watch-review/PopupWatchReview'

const VALIDATORS: Validator[] = [
  {
    field: 'name',
    name: 'Tên sản phẩm',
    rules: [ValidateRule.Required],
  },
  {
    field: 'categoryId',
    name: 'Danh mục',
    rules: [ValidateRule.Required],
  },
  {
    field: 'unit',
    name: 'Đơn vị',
    rules: [ValidateRule.Required],
  },
  {
    field: 'price',
    name: 'Đơn giá',
    rules: [ValidateRule.Required],
  },
  {
    field: 'amount',
    name: 'Số lượng',
    rules: [ValidateRule.Required],
  },
  {
    field: 'image',
    name: 'Ảnh đại diện',
    rules: [ValidateRule.Required],
  },
]

type Props = {
  productId?: string
  isActive?: boolean
  onClose?: () => void
  onSave?: () => void
}

const formatCategoriesFunc = (input: Category[]) => {
  const result: MySelectOption[] = []
  input.forEach((category) => {
    result.push({
      text: category.name,
      value: category.id,
    })
  })
  return result
}

const getCategories = async () => {
  const res = await baseApi.get('/categories')
  const resCategories: Category[] = res.data
  return formatCategoriesFunc(resCategories)
}

const getNewCode = async () => {
  const res = await baseApi.get('/products/new-code')
  return res.data as string
}

const getProductById = async (productId: string): Promise<CreateProduct> => {
  const res = await baseApi.get(`/products/${productId}`)
  return res.data as CreateProduct
}

const PopupAddProduct = ({ isActive = false, productId, onClose, onSave }: Props) => {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { openToast } = useToastMsg()
  const { error, isValidated, validate, setIsValidated } = useValidate(VALIDATORS)
  const [isActiveConfigm, setIsActiveConfirm] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [categories, setCategories] = useState<MySelectOption[]>([])
  const [popupTitle, setPopupTitle] = useState('Thêm mới sản phẩm')
  const [reviewsCount, setReviewsCount] = useState(0)
  const [isActivePopupWatchReview, setIsActivePopupWatchReview] = useState(false)
  const [productData, setProductData] = useState<CreateProduct>({
    code: '',
    name: '',
    image: '',
    amount: '',
    price: '',
    unit: '',
    isActive: true,
    gallery: [],
    desc: '',
    categoryId: '',
  })

  useEffect(() => {
    const getReviewsCount = async () => {
      try {
        const res = await baseApi.get('reviews/paging', {
          productId: productId,
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
      if (productId) {
        setPopupTitle('Cập nhật sản phẩm')
        try {
          getReviewsCount()
          const [categoriesRes, productDataRes] = await Promise.all([
            getCategories(),
            getProductById(productId),
          ])
          setCategories(categoriesRes)
          setProductData({
            code: productDataRes.code,
            name: productDataRes.name,
            image: productDataRes.image,
            amount: productDataRes.amount,
            price: productDataRes.price,
            unit: productDataRes.unit,
            isActive: productDataRes.isActive,
            gallery: productDataRes.gallery,
            desc: productDataRes.desc,
            categoryId: productDataRes.categoryId,
          })
          setTimeout(() => {
            nameInputRef.current?.focus()
          }, 10)
        } catch (error) {
          setCategories([])
        } finally {
          setIsLoading(false)
        }
        return
      }

      setPopupTitle('Thêm mới sản phẩm')
      setReviewsCount(0)
      try {
        const [categoriesRes, newCodeRes] = await Promise.all([getCategories(), getNewCode()])
        setCategories(categoriesRes)
        setProductData((prev) => ({
          ...prev,
          code: newCodeRes,
        }))
        setTimeout(() => {
          nameInputRef.current?.focus()
        }, 10)
      } catch (error) {
        console.log(error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isActive) {
      initPopup()
      return
    }
    setProductData({
      code: '',
      name: '',
      image: '',
      amount: '',
      price: '',
      unit: '',
      isActive: true,
      gallery: [],
      desc: '',
      categoryId: '',
    })
    setIsValidated(false)
  }, [isActive, productId, setIsValidated])

  const handleChange = (func: (prev: CreateProduct) => CreateProduct) => {
    return setProductData((prev) => {
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
    const isValid = validate(productData)
    if (!isValid) {
      return
    }
    openPopupConfirm()
  }

  const handleSave = async () => {
    setIsLoadingSave(true)
    let isSuccess = false
    try {
      if (productId) {
        await baseApi.put(`/products/${productId}`, {
          ...productData,
        })
        openToast({
          msg: `Cập nhật sản phẩm có mã ${productData.code} thành công`,
          type: ToastMsgType.Success,
        })
      } else {
        await baseApi.post('/products', {
          ...productData,
        })
        openToast({
          msg: `Lưu sản phẩm có mã ${productData.code} thành công`,
          type: ToastMsgType.Success,
        })
      }
      isSuccess = true
    } catch (error) {
      console.log(error)
      if (productId) {
        openToast({
          msg: `Cập nhật sản phẩm thất bại`,
          type: ToastMsgType.Danger,
        })
      } else {
        openToast({
          msg: `Lưu sản phẩm thất bại`,
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
              text={productId ? 'Cập nhật' : 'Lưu'}
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
          <div className="w-[700px] grid grid-cols-2 grid-rows-[repeat(auto, 9)] gap-x-8 gap-y-4">
            <div>
              <MyTextField
                id="code"
                name="code"
                label="Mã sản phẩm"
                required={true}
                value={productData.code}
                disabled={true}
                isParentLoading={isLoading}
              />
            </div>

            <div>
              <MyTextField
                id="name"
                name="name"
                label="Tên sản phẩm"
                required={true}
                isParentLoading={isLoading}
                inputRef={nameInputRef}
                value={productData.name}
                error={error.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="row-start-3 row-end-[8]">
              <MyUploadThumbnail
                id="image"
                name="image"
                label="Ảnh đại diện sản phẩm"
                required={true}
                isParentLoading={isLoading}
                width={334}
                height={334}
                error={error.image}
                value={productData.image}
                onChange={(e: string) =>
                  handleChange((prev) => ({
                    ...prev,
                    image: e,
                  }))
                }
              />
            </div>

            <div>
              <MySelect
                id="categoryId"
                name="categoryId"
                label="Danh mục"
                value={productData.categoryId}
                isParentLoading={isLoading}
                required={true}
                options={categories}
                error={error.categoryId}
                onChange={(e: string | number | boolean | undefined | null) =>
                  handleChange((prev) => ({
                    ...prev,
                    categoryId: `${e}`,
                  }))
                }
              />
            </div>

            <div>
              <MyTextField
                id="unit"
                name="unit"
                label="Đơn vị"
                isParentLoading={isLoading}
                required={true}
                value={productData.unit}
                error={error.unit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    unit: e.target.value,
                  }))
                }
              />
            </div>

            <div className="row-start-3 row-end-4">
              <MyTextField
                id="price"
                name="price"
                label="Đơn giá"
                type="number"
                min={0}
                isParentLoading={isLoading}
                required={true}
                value={productData.price}
                error={error.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    price: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="row-start-4 row-end-5 col-start-2">
              <MyTextField
                id="amount"
                name="amount"
                label="Số lượng"
                type="number"
                min={0}
                isParentLoading={isLoading}
                required={true}
                error={error.amount}
                value={productData.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    amount: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              {isLoading ? (
                <div className="flex flex-col w-full">
                  <MyLoadingSkeleton className="w-28 h-6 mb-1 rounded-md" />
                  <MyLoadingSkeleton className="w-full h-9 rounded-md" />
                </div>
              ) : (
                <>
                  <div className="w-max mb-1 cursor-default">Trạng thái</div>
                  <div className="flex items-center gap-x-4 h-9">
                    <MyRadio
                      id="isActiveTrue"
                      name="isActive"
                      label="Đang bán"
                      value="true"
                      checked={productData.isActive === true ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          isActive: e.target.value === 'true' ? true : false,
                        }))
                      }
                    />
                    <MyRadio
                      id="isActiveFalse"
                      name="isActive"
                      label="Ngừng bán"
                      value="false"
                      checked={productData.isActive === false ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange((prev) => ({
                          ...prev,
                          isActive: e.target.value === 'true' ? true : false,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="row-start-6 row-end-[8]">
              <MyTextArea
                id="desc"
                name="desc"
                label="Mô tả"
                isParentLoading={isLoading}
                value={productData.desc}
                height={95}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange((prev) => ({
                    ...prev,
                    desc: e.target.value,
                  }))
                }
              />
            </div>

            <div className="w-full row-start-[8] row-end-[9] col-start-1 col-end-3">
              <MyUploadImages
                id="gallery"
                name="gallery"
                isParentLoading={isLoading}
                label="Hình ảnh sản phẩm"
                value={productData.gallery}
                onChange={(e: string[]) =>
                  handleChange((prev) => ({
                    ...prev,
                    gallery: e,
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
          <span>{`Xác nhận ${productId ? 'cập nhật' : 'lưu'} sản phẩm với mã `}</span>
          <span className="font-medium">{productData.code}</span>
        </div>
      </MyPopupConfirm>

      <PopupWatchReview
        isActive={isActivePopupWatchReview}
        productId={productId}
        onClose={() => setIsActivePopupWatchReview(false)}
      />
    </>
  )
}

export default PopupAddProduct
