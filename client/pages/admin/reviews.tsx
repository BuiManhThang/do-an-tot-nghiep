import baseApi from '@/apis/baseApi'
import MyPaging from '@/components/my-paging/MyPaging'
import MyPopupConfirm from '@/components/my-popup/MyPopupConfirm'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTable, { Column, TableAlign, TableDataType } from '@/components/my-table/MyTable'
import MyTextField from '@/components/my-text-field/MyTextField'
import PopupWatchReview from '@/components/popup-watch-review/PopupWatchReview'
import { ToastMsgType } from '@/enum/toastMsg'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { PagingResult } from '@/types/paging'
import { Product } from '@/types/product'
import { Review } from '@/types/review'
import { User } from '@/types/user'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Ngày tạo',
    value: 'createdAt',
  },
  {
    text: 'Điểm đánh giá',
    value: 'score',
  },
]

const ORDER_DIRECTION: MySelectOption[] = [
  {
    text: 'Tăng dần',
    value: 'asc',
  },
  {
    text: 'Giảm dần',
    value: 'desc',
  },
]

const COLUMNS: Column[] = [
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'code',
    title: 'Mã người dùng',
    width: 140,
    minWidth: 140,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'image',
    title: 'Ảnh đại diện',
    width: 120,
    minWidth: 120,
    template: (rowData) => {
      const review: Review = rowData
      const user: User = review.user
      return (
        <div className="flex items-center justify-center py-1">
          <Image
            src={user.avatar}
            alt={user.name}
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
    fieldName: 'user',
    childFieldName: 'name',
    title: 'Họ tên người dùng',
    minWidth: 200,
    width: 200,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'email',
    title: 'Email người dùng',
    width: 200,
    minWidth: 200,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'phoneNumber',
    title: 'SĐT người dùng',
    width: 140,
    minWidth: 140,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'productImage',
    title: 'Hình ảnh sản phẩm',
    width: 170,
    minWidth: 170,
    template: (rowData) => {
      const review: Review = rowData
      const product: Product = review.product
      return (
        <div className="flex items-center justify-center py-1">
          <Image
            src={product.image}
            alt={product.name}
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
    fieldName: 'product',
    childFieldName: 'code',
    title: 'Mã sản phẩm',
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'product',
    childFieldName: 'name',
    title: 'Tên sản phẩm',
    minWidth: 250,
  },
  {
    dataType: TableDataType.Text,
    align: TableAlign.Right,
    fieldName: 'score',
    title: 'Số điểm',
    width: 130,
    minWidth: 130,
  },
  {
    dataType: TableDataType.Date,
    align: TableAlign.Center,
    fieldName: 'createdAt',
    title: 'Ngày tạo',
    width: 150,
    minWidth: 150,
  },
]

type SearchParams = {
  searchText: string
  sort: string
  direction: string
  pageIndex: number
  pageSize: number
}

const getPagingFunc = async (searchParams: SearchParams): Promise<PagingResult> => {
  const res = await baseApi.get('reviews/paging', {
    searchText: searchParams.searchText ? searchParams.searchText : undefined,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const deleteFunc = async (id: string): Promise<boolean> => {
  const res = await baseApi.delete(`reviews/${id}`)
  return res.status === 204 ? true : false
}

const AdminReviewsPage = () => {
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const { openToast } = useToastMsg()
  const [isActiveConfigm, setIsActiveConfirm] = useState<boolean>(false)
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false)
  const [deleteEntities, setDeleteEntities] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [entities, setEntities] = useState<Review[]>([])
  const [isActivePopupWatchReview, setIsActivePopupWatchReview] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review>()
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    sort: 'createdAt',
    direction: 'asc',
    pageIndex: 1,
    pageSize: 20,
  })

  useEffect(() => {
    const getPagingEntities = async () => {
      setIsLoading(true)
      try {
        const pagingResult = await getPagingFunc({
          searchText: '',
          sort: 'createdAt',
          direction: 'asc',
          pageIndex: 1,
          pageSize: 20,
        })
        setEntities(pagingResult.data)
        setTotalRecords(pagingResult.total)
      } catch (error) {
        setEntities([])
        setTotalRecords(0)
      } finally {
        setIsLoading(false)
      }
    }

    getPagingEntities()
  }, [])

  const getPaging = async (param: SearchParams) => {
    setIsLoading(true)
    try {
      const pagingResult = await getPagingFunc(param)
      setEntities(pagingResult.data)
      setTotalRecords(pagingResult.total)
    } catch (error) {
      setEntities([])
      setTotalRecords(0)
    } finally {
      setIsLoading(false)
      tabelContainerRef.current?.scrollTo(0, 0)
    }
  }

  const handleChangeSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      searchText: e.target.value,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    clearTimeout(timeoutFunc.current)
    timeoutFunc.current = setTimeout(() => {
      getPaging(newSearchParams)
    }, 500)
  }

  const handleChangeSort = (sort: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      sort: sort as string,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangeSortDirection = (
    sortDirection: string | number | boolean | null | undefined
  ) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      direction: sortDirection as string,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangePageIndex = (newPageIndex: number) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      pageIndex: newPageIndex,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangePageSize = (newPageSize: number) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      pageSize: newPageSize,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const openPopupConfirm = () => {
    setIsActiveConfirm(true)
  }

  const closePopupConfirm = () => {
    setIsActiveConfirm(false)
  }

  const handleClickWatch = (selectedEntity: Review) => {
    setSelectedReview(selectedEntity)
    setIsActivePopupWatchReview(true)
  }

  const handleClickDelete = (deleteEntity: Review) => {
    setDeleteEntities([deleteEntity])
    openPopupConfirm()
  }

  const handleDelete = async () => {
    setIsLoadingDelete(true)
    try {
      const deleteFuncs = deleteEntities.map((deleteEntity) => {
        return deleteFunc(deleteEntity.id)
      })

      await Promise.all(deleteFuncs)
      let successMsg = ''
      if (deleteEntities.length === 1) {
        successMsg = `Xóa thành công đánh giá của người dùng có mã ${deleteEntities[0].user.code}`
      } else {
        successMsg = `Xóa thành công ${deleteEntities.length} đánh giá`
      }
      openToast({
        msg: successMsg,
        type: ToastMsgType.Success,
      })
    } catch (error) {
      console.log(error)
      openToast({
        msg: 'Xóa thất bại',
        type: ToastMsgType.Danger,
      })
    } finally {
      setIsLoadingDelete(false)
      closePopupConfirm()
      getPaging(searchParams)
    }
  }

  return (
    <div className="h-full">
      <Head>
        <title>Quản lý đánh giá</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý đánh giá</h2>

      <div className="flex items-start justify-between mb-6">
        <div className="w-80">
          <MyTextField
            id="searchText"
            name="searchText"
            placeholder="Nhập tên, mã khách hàng, sản phẩm"
            startIcon={<i className="fa-solid fa-magnifying-glass text-gray-500"></i>}
            value={searchParams.searchText}
            onChange={handleChangeSearchText}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <div className="w-60">
            <MySelect
              id="sort"
              name="sort"
              label="Sắp xếp theo"
              isHorizontal={true}
              value={searchParams.sort}
              options={ORDER_BY_OPTIONS}
              onChange={handleChangeSort}
            />
          </div>
          <div className="w-60">
            <MySelect
              id="direction"
              name="direction"
              label="Hướng sắp xếp"
              isHorizontal={true}
              value={searchParams.direction}
              options={ORDER_DIRECTION}
              onChange={handleChangeSortDirection}
            />
          </div>
        </div>
      </div>

      <div className="h-[calc(100%_-_160px)] w-[calc(100vw_-_248px)]">
        <MyTable
          containerRef={tabelContainerRef}
          columns={COLUMNS}
          data={entities}
          checkable={false}
          isLoading={isLoading}
          rowIdField="id"
          haveRowIndex={true}
          selectedRows={[]}
          editIcon={
            <i className="fa-solid fa-eye text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
          }
          deleteIcon={
            <i className="fa-solid fa-trash ext-lg text-gray-700 leading-none cursor-pointer transition-colors hover:text-red-600"></i>
          }
          onEdit={handleClickWatch}
          onDelete={handleClickDelete}
        />
      </div>

      <div>
        <MyPaging
          pageIndex={searchParams.pageIndex}
          pageSize={searchParams.pageSize}
          total={totalRecords}
          onChangePageIndex={handleChangePageIndex}
          onChangePageSize={handleChangePageSize}
        />
      </div>

      <MyPopupConfirm
        isActive={isActiveConfigm}
        isLoading={isLoadingDelete}
        onClose={closePopupConfirm}
        onAgree={handleDelete}
      >
        {deleteEntities.length > 1 ? (
          <div>
            <span>{`Xác nhận xóa ${deleteEntities.length} đánh giá`}</span>
          </div>
        ) : deleteEntities.length > 0 ? (
          <div>
            <span>{`Xác nhận xóa đánh giá của người dùng với mã `}</span>
            <span className="font-medium">{deleteEntities[0].user.code}</span>
          </div>
        ) : (
          <div></div>
        )}
      </MyPopupConfirm>

      <PopupWatchReview
        isActive={isActivePopupWatchReview}
        reviewDetail={selectedReview}
        onClose={() => setIsActivePopupWatchReview(false)}
      />
    </div>
  )
}

export default AdminReviewsPage
