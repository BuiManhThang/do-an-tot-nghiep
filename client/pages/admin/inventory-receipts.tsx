import baseApi from '@/apis/baseApi'
import MyButton from '@/components/my-button/MyButton'
import MyPaging from '@/components/my-paging/MyPaging'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTable, { Column, TableAlign, TableDataType } from '@/components/my-table/MyTable'
import MyTextField from '@/components/my-text-field/MyTextField'
import PopupOrderDetail from '@/components/popup-oder-detail/PopupOrderDetail'
import { OrderStatus } from '@/enum/orderStatus'
import { Order } from '@/types/order'
import { PagingResult } from '@/types/paging'
import Head from 'next/head'
import PopupInventoryReceiptDetail from '@/components/popup-inventory-receipt-detail/PopupInventoryReceiptDetail'
import React, { useEffect, useRef, useState } from 'react'
import { InventoryReceipt } from '@/types/inventoryReceipt'

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Mã',
    value: 'code',
  },
  {
    text: 'Tổng tiền nhập',
    value: 'totalMoney',
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
    title: 'Mã đơn nhập',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'code',
    title: 'Mã người nhập',
    width: 135,
    minWidth: 135,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'name',
    title: 'Họ tên người nhập',
    minWidth: 200,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'phoneNumber',
    title: 'SĐT người nhập',
    minWidth: 150,
    width: 150,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'email',
    title: 'Email người nhập',
    minWidth: 200,
    width: 200,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Right,
    fieldName: 'products',
    title: 'Số lượng sản phẩm',
    width: 170,
    minWidth: 170,
    template: (rowData: InventoryReceipt) => {
      return (
        <>
          <div className="text-right">{rowData.inventoryReceiptDetails.length}</div>
        </>
      )
    },
  },
  {
    dataType: TableDataType.Money,
    align: TableAlign.Right,
    fieldName: 'totalMoney',
    title: 'Tổng tiền nhập',
    minWidth: 200,
    width: 200,
  },
  {
    dataType: TableDataType.Date,
    align: TableAlign.Center,
    fieldName: 'createdAt',
    title: 'Ngày lập',
    minWidth: 140,
    width: 140,
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
  const res = await baseApi.get('inventoryReceipts/paging', {
    searchText: searchParams.searchText ? searchParams.searchText : undefined,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const AdminInventoryReceiptsPage = () => {
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const [editEntityId, setEditEntityId] = useState<string>('')
  const [isActivePopupDetail, setIsActivePopupDetail] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [entities, setEntities] = useState<Order[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    sort: 'code',
    direction: 'desc',
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
          direction: 'desc',
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

  const openPopupDetail = (entityId?: string) => {
    if (entityId) {
      setEditEntityId(entityId)
    } else {
      setEditEntityId('')
    }
    setIsActivePopupDetail(true)
  }

  const closePopupDetail = (isReload: boolean = false) => {
    setIsActivePopupDetail(false)
    if (isReload) {
      getPaging(searchParams)
    }
  }

  const handleClickWatch = (e: Order) => {
    openPopupDetail(e.id)
  }

  const handleClickAdd = () => {
    openPopupDetail()
  }

  return (
    <div className="h-full">
      <Head>
        <title>Quản lý đơn nhập</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý đơn nhập</h2>

      <div className="flex items-start justify-between mb-6">
        <div className="w-80">
          <MyTextField
            id="searchText"
            name="searchText"
            placeholder="Nhập mã đơn nhập, tên người nhập, ..."
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
              text="Nhập hàng"
              startIcon={<i className="fa-solid fa-plus"></i>}
              onClick={() => handleClickAdd()}
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
          stickyFirstColumn={true}
          editIcon={
            <i className="fa-solid fa-eye text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
          }
          onEdit={handleClickWatch}
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

      <PopupInventoryReceiptDetail
        isActive={isActivePopupDetail}
        entityId={editEntityId}
        onClose={closePopupDetail}
        onSave={() => closePopupDetail(true)}
      />
    </div>
  )
}

export default AdminInventoryReceiptsPage
