import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import MyTable, { Column, TableDataType, TableAlign } from '@/components/my-table/MyTable'
import MyPaging from '@/components/my-paging/MyPaging'
import MyButton from '@/components/my-button/MyButton'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTextField from '@/components/my-text-field/MyTextField'
import { Category } from '@/types/category'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import MyPopupConfirm from '@/components/my-popup/MyPopupConfirm'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import PopupAddCategory from '@/components/popup/PopupAddCategory'
import { handleClientError } from '@/common/errorHandler'

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Mã',
    value: 'code',
  },
  {
    text: 'Tên',
    value: 'name',
  },
  {
    text: 'Số lượng sản phẩm',
    value: 'products',
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
    fieldName: 'code',
    title: 'Mã danh mục',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'name',
    title: 'Tên danh mục',
    minWidth: 200,
  },
  {
    dataType: TableDataType.Text,
    align: TableAlign.Right,
    fieldName: '_count',
    childFieldName: 'products',
    title: 'Số lượng sản phẩm',
    minWidth: 200,
    width: 200,
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
  const res = await baseApi.get('categories/paging', {
    searchText: searchParams.searchText ? searchParams.searchText : undefined,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const deleteFunc = async (id: string): Promise<boolean> => {
  const res = await baseApi.delete(`categories/${id}`)
  return res.status === 204 ? true : false
}

const AdminCategoriesPage = () => {
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const { openToast } = useToastMsg()
  const [isActiveConfigm, setIsActiveConfirm] = useState<boolean>(false)
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false)
  const [editEntityId, setEditEntityId] = useState<string>('')
  const [isActivePopupAdd, setIsActivePopupAdd] = useState(false)
  const [deleteEntities, setDeleteEntities] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [entities, setEntities] = useState<Category[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    sort: 'code',
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
          sort: 'code',
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

  const openPopupAdd = (entityId?: string) => {
    if (entityId) {
      setEditEntityId(entityId)
    } else {
      setEditEntityId('')
    }
    setIsActivePopupAdd(true)
  }

  const closePopupAdd = () => {
    setIsActivePopupAdd(false)
  }

  const handleSaveEntity = () => {
    closePopupAdd()
    getPaging(searchParams)
  }

  const handleClickEdit = (e: Category) => {
    openPopupAdd(e.id)
  }

  const openPopupConfirm = () => {
    setIsActiveConfirm(true)
  }

  const closePopupConfirm = () => {
    setIsActiveConfirm(false)
  }

  const handleClickDelete = (deleteEntity: Category) => {
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
        successMsg = `Xóa thành công danh mục có mã ${deleteEntities[0].code}`
      } else {
        successMsg = `Xóa thành công ${deleteEntities.length} danh mục`
      }
      openToast({
        msg: successMsg,
        type: ToastMsgType.Success,
      })
    } catch (error) {
      let msg = 'Xóa thất bại'
      const errorResult = handleClientError(error)
      if (errorResult.product) {
        msg = errorResult.product
      }
      openToast({
        msg,
        type: ToastMsgType.Danger,
      })
      console.log(error)
    } finally {
      setIsLoadingDelete(false)
      closePopupConfirm()
      getPaging(searchParams)
    }
  }

  return (
    <div className="h-full">
      <Head>
        <title>Quản lý danh mục</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý danh mục</h2>

      <div className="flex items-start justify-between mb-6">
        <div className="w-80">
          <MyTextField
            id="searchText"
            name="searchText"
            placeholder="Nhập tên, mã danh mục"
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
          <div>
            <MyButton
              text="Thêm mới"
              startIcon={<i className="fa-solid fa-plus"></i>}
              onClick={() => openPopupAdd()}
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
            <i className="fa-solid fa-pen-to-square text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
          }
          deleteIcon={
            <i className="fa-solid fa-trash ext-lg text-gray-700 leading-none cursor-pointer transition-colors hover:text-red-600"></i>
          }
          onEdit={handleClickEdit}
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

      <PopupAddCategory
        isActive={isActivePopupAdd}
        categoryId={editEntityId}
        onClose={closePopupAdd}
        onSave={handleSaveEntity}
      />

      <MyPopupConfirm
        isActive={isActiveConfigm}
        isLoading={isLoadingDelete}
        onClose={closePopupConfirm}
        onAgree={handleDelete}
      >
        {deleteEntities.length > 1 ? (
          <div>
            <span>{`Xác nhận xóa ${deleteEntities.length} danh mục`}</span>
          </div>
        ) : deleteEntities.length > 0 ? (
          <div>
            <span>{`Xác nhận xóa danh mục với mã `}</span>
            <span className="font-medium">{deleteEntities[0].code}</span>
          </div>
        ) : (
          <div></div>
        )}
      </MyPopupConfirm>
    </div>
  )
}

export default AdminCategoriesPage
