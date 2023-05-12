import baseApi from '@/apis/baseApi'
import MyPaging from '@/components/my-paging/MyPaging'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTable, { Column, TableAlign, TableDataType } from '@/components/my-table/MyTable'
import MyTextField from '@/components/my-text-field/MyTextField'
import PopupOrderDetail from '@/components/popup-oder-detail/PopupOrderDetail'
import { OrderStatus } from '@/enum/orderStatus'
import { Order } from '@/types/order'
import { PagingResult } from '@/types/paging'
import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Mã',
    value: 'code',
  },
  {
    text: 'Số lượng sản phẩm',
    value: 'products',
  },
  {
    text: 'Tổng tiền thanh toán',
    value: 'totalMoney',
  },
  {
    text: 'Trạng thái',
    value: 'status',
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

const STATUS_OPTIONS: MySelectOption[] = [
  {
    text: 'Tất cả',
    value: null,
  },
  {
    text: 'Chờ xác nhận',
    value: OrderStatus.Pending,
  },
  {
    text: 'Đã xác nhận',
    value: OrderStatus.Confirmed,
  },
  {
    text: 'Đã giao dịch',
    value: OrderStatus.Success,
  },
]

const COLUMNS: Column[] = [
  {
    dataType: TableDataType.Text,
    fieldName: 'code',
    title: 'Mã đơn hàng',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'user',
    childFieldName: 'code',
    title: 'Mã người đặt',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'userName',
    title: 'Họ tên người đặt',
    minWidth: 200,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'userPhoneNumber',
    title: 'SĐT người đặt',
    minWidth: 150,
    width: 150,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'userEmail',
    title: 'Email người đặt',
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
    template: (rowData: Order) => {
      return (
        <>
          <div className="text-right">
            {rowData.products.reduce((prev, curr) => prev + curr.amount, 0)}
          </div>
        </>
      )
    },
  },
  {
    dataType: TableDataType.Money,
    align: TableAlign.Right,
    fieldName: 'totalMoney',
    title: 'Tổng tiền thanh toán',
    minWidth: 200,
    width: 200,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'status',
    title: 'Trạng thái',
    minWidth: 170,
    width: 170,
    template: (rowData: any) => {
      const order: Order = rowData
      return (
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center justify-center font-medium border-2 rounded-md cursor-default w-36 ${
              order.status === OrderStatus.Pending
                ? 'border-orange-500 text-orange-500'
                : order.status === OrderStatus.Confirmed
                ? 'border-primary text-primary'
                : 'border-green-500 text-green-500'
            }`}
          >
            {order.status === OrderStatus.Pending ? (
              <div>Chờ xác nhận</div>
            ) : order.status === OrderStatus.Confirmed ? (
              <div>Đã xác nhận</div>
            ) : (
              <div>Đã giao dịch</div>
            )}
          </div>
        </div>
      )
    },
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
  status: OrderStatus | null
  sort: string
  direction: string
  pageIndex: number
  pageSize: number
}

const getPagingFunc = async (searchParams: SearchParams): Promise<PagingResult> => {
  const res = await baseApi.get('orders/paging', {
    searchText: searchParams.searchText ? searchParams.searchText : undefined,
    status: searchParams.status ? searchParams.status : undefined,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const AdminOrdersPage = () => {
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const [editEntityId, setEditEntityId] = useState<string>('')
  const [isActivePopupDetail, setIsActivePopupDetail] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [entities, setEntities] = useState<Order[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    status: null,
    sort: 'status',
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
          status: null,
          sort: 'status',
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

  const handleChangeStatus = (status: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      status: status ? (status as OrderStatus) : null,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
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
    setIsActivePopupDetail(true)
  }

  const closePopupDetail = (isReload: boolean = false) => {
    setIsActivePopupDetail(false)
    if (isReload) {
      getPaging(searchParams)
    }
  }

  const handleClickEdit = (e: Order) => {
    openPopupAdd(e.id)
  }

  return (
    <div className="h-full">
      <Head>
        <title>Quản lý đơn hàng</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý đơn hàng</h2>

      <div className="flex items-start justify-between mb-6">
        <div className="w-80">
          <MyTextField
            id="searchText"
            name="searchText"
            placeholder="Nhập mã đơn hàng, tên người đặt"
            startIcon={<i className="fa-solid fa-magnifying-glass text-gray-500"></i>}
            value={searchParams.searchText}
            onChange={handleChangeSearchText}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <div className="w-60">
            <MySelect
              id="status"
              name="status"
              label="Trạng thái"
              isHorizontal={true}
              value={searchParams.status}
              options={STATUS_OPTIONS}
              onChange={handleChangeStatus}
            />
          </div>
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
          stickyFirstColumn={true}
          editIcon={
            <i className="fa-solid fa-eye text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
          }
          onEdit={handleClickEdit}
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

      <PopupOrderDetail
        isActive={isActivePopupDetail}
        isAdminView={true}
        orderId={editEntityId}
        onClose={closePopupDetail}
      />
    </div>
  )
}

export default AdminOrdersPage
