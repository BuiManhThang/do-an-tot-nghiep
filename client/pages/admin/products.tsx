import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import MyTable, { Column, TableDataType, TableAlign } from '@/components/my-table/MyTable'
import MyPaging from '@/components/my-paging/MyPaging'
import MyButton, { MyButtonType } from '@/components/my-button/MyButton'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTextField from '@/components/my-text-field/MyTextField'
import PopupAddProduct from '@/components/popup/PopupAddProduct'
import { useCategory } from '@/hooks/categoryHook'
import { Category } from '@/types/category'
import { Product } from '@/types/product'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import MyPopupConfirm from '@/components/my-popup/MyPopupConfirm'
import MyPopover from '@/components/my-popover/MyPopover'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'

const IS_ACTIVE_OPTIONS: MySelectOption[] = [
  {
    text: 'Tất cả',
    value: null,
  },
  {
    text: 'Đang bán',
    value: true,
  },
  {
    text: 'Ngừng bán',
    value: false,
  },
]

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
    text: 'Giá',
    value: 'price',
  },
  {
    text: 'Số lượng',
    value: 'amount',
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
    title: 'Mã sản phẩm',
    width: 125,
    minWidth: 125,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'name',
    title: 'Tên sản phẩm',
    minWidth: 200,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'image',
    title: 'Hình ảnh',
    width: 120,
    minWidth: 120,
    template: (rowData) => {
      const product: Product = rowData as Product
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
    align: TableAlign.Right,
    fieldName: 'amount',
    title: 'Hiện có',
    width: 150,
    minWidth: 150,
  },
  {
    dataType: TableDataType.Money,
    align: TableAlign.Right,
    fieldName: 'price',
    title: 'Giá',
    width: 150,
    minWidth: 150,
  },
  {
    dataType: TableDataType.Text,
    fieldName: 'unit',
    title: 'Đơn vị',
    width: 150,
    minWidth: 150,
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Center,
    fieldName: 'isActive',
    title: 'Trạng thái',
    width: 150,
    minWidth: 150,
    template: (rowData) => {
      const product: Product = rowData as Product
      return (
        <div
          className={`flex items-center justify-center border-2 h-8 rounded-md font-medium ${
            product.isActive ? 'border-success text-success' : 'border-warn text-warn'
          }`}
        >
          {product.isActive ? 'Đang bán' : 'Ngừng bán'}
        </div>
      )
    },
  },
  {
    dataType: TableDataType.Custom,
    fieldName: 'category',
    title: 'Danh mục',
    width: 240,
    minWidth: 240,
    template: (rowData) => {
      const product: Product = rowData as Product
      return (
        <div
          title={product.category.name}
          className="w-[216px] overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {product.category.name}
        </div>
      )
    },
  },
]

type SearchParams = {
  searchText: string
  categoryId: string
  isActive: boolean | null
  sort: string
  direction: string
  pageIndex: number
  pageSize: number
}

const formatCategoriesFunc = (input: Category[]) => {
  const result: MySelectOption[] = []
  result.push({
    text: 'Tất cả',
    value: '',
  })
  input.forEach((category) => {
    result.push({
      text: category.name,
      value: category.id,
    })
  })
  return result
}

const getPagingFunc = async (searchParams: SearchParams): Promise<PagingResult> => {
  const res = await baseApi.get('products/paging', {
    searchText: searchParams.searchText ? searchParams.searchText : undefined,
    categoryId: searchParams.categoryId ? searchParams.categoryId : undefined,
    isActive: searchParams.isActive !== null ? searchParams.isActive : undefined,
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const deleteFunc = async (id: string): Promise<boolean> => {
  const res = await baseApi.delete(`products/${id}`)
  return res.status === 204 ? true : false
}

const AdminProductsPage = () => {
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const { openToast } = useToastMsg()
  const [isActiveConfigm, setIsActiveConfirm] = useState<boolean>(false)
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false)
  const [editProductId, setEditProductId] = useState<string>('')
  const [isActivePopupAddProduct, setIsActivePopupAddProduct] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const [deleteProducts, setDeleteProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [products, setProducts] = useState<Product[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    categoryId: '',
    isActive: null,
    sort: 'code',
    direction: 'asc',
    pageIndex: 1,
    pageSize: 20,
  })

  const { formatCategories } = useCategory<MySelectOption>(formatCategoriesFunc)

  useEffect(() => {
    const getPagingEntities = async () => {
      setIsLoading(true)
      try {
        const pagingResult = await getPagingFunc({
          searchText: '',
          categoryId: '',
          isActive: null,
          sort: 'code',
          direction: 'asc',
          pageIndex: 1,
          pageSize: 20,
        })
        setProducts(pagingResult.data)
        setTotalRecords(pagingResult.total)
      } catch (error) {
        setProducts([])
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
      setProducts(pagingResult.data)
      setTotalRecords(pagingResult.total)
    } catch (error) {
      setProducts([])
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

  const handleChangeCategory = (categoryId: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      categoryId: categoryId as string,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangeStatus = (status: string | number | boolean | null | undefined) => {
    const formattedStatus: boolean | null =
      status === null || typeof status === 'boolean' ? status : null
    const newSearchParams: SearchParams = {
      ...searchParams,
      isActive: formattedStatus,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangeSort = (sort: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParams,
      sort: sort as string,
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
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleSelectRows = (selectedProducts: Product[]) => {
    setSelectedRows(selectedProducts)
  }

  const openPopupAddProduct = (productId?: string) => {
    if (productId) {
      setEditProductId(productId)
    } else {
      setEditProductId('')
    }
    setIsActivePopupAddProduct(true)
  }

  const handleSaveProduct = () => {
    closePopupAddProduct()
    getPaging(searchParams)
  }

  const closePopupAddProduct = () => {
    setIsActivePopupAddProduct(false)
  }

  const handleClickEdit = (e: Product) => {
    openPopupAddProduct(e.id)
  }

  const openPopupConfirm = () => {
    setIsActiveConfirm(true)
  }

  const closePopupConfirm = () => {
    setIsActiveConfirm(false)
  }

  const handleClickDelete = (deleteProduct: Product) => {
    setDeleteProducts([deleteProduct])
    openPopupConfirm()
  }

  const handleClickDeleteMultiple = (closePopover: () => void) => {
    if (selectedRows.length === 0) {
      openToast({
        msg: 'Chưa chọn sản phẩm để xóa',
        type: ToastMsgType.Warn,
      })
      return
    }
    closePopover()
    setDeleteProducts(selectedRows)
    openPopupConfirm()
  }

  const handleDelete = async () => {
    setIsLoadingDelete(true)
    try {
      const deleteFuncs = deleteProducts.map((deleteProduct) => {
        return deleteFunc(deleteProduct.id)
      })

      await Promise.all(deleteFuncs)
      let successMsg = ''
      if (deleteProducts.length === 1) {
        successMsg = `Xóa thành công sản phẩm có mã ${deleteProducts[0].code}`
      } else {
        successMsg = `Xóa thành công ${deleteProducts.length} sản phẩm`
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
        <title>Quản lý sản phẩm</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý sản phẩm</h2>

      <div className="flex items-start justify-between mb-6">
        <div className="w-80">
          <MyTextField
            id="searchText"
            name="searchText"
            placeholder="Nhập tên, mã sản phẩm"
            startIcon={<i className="fa-solid fa-magnifying-glass text-gray-500"></i>}
            value={searchParams.searchText}
            onChange={handleChangeSearchText}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <div className="w-80">
            <MySelect
              id="categoryId"
              name="categoryId"
              label="Danh mục"
              isHorizontal={true}
              value={searchParams.categoryId}
              options={formatCategories}
              onChange={handleChangeCategory}
            />
          </div>
          <div className="w-60">
            <MySelect
              id="isActive"
              name="isActive"
              label="Trạng thái"
              isHorizontal={true}
              value={searchParams.isActive}
              options={IS_ACTIVE_OPTIONS}
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
          <div>
            <MyButton
              text="Thêm mới"
              startIcon={<i className="fa-solid fa-plus"></i>}
              onClick={() => openPopupAddProduct()}
            />
          </div>
          <div className="relative z-[3]">
            <MyPopover
              popoverClassName="w-full h-full"
              targetClassName="w-full h-full outline-none"
              contentClassName="absolute z-10 right-0 top-full"
              target={() => (
                <div className="relative outline-none border focus:ring-2 bg-white ring-secondary-ring transition-colors inline-flex items-center h-9 px-3 font-medium text-base rounded-md leading-none min-w-fit text-secondary border-secondary hover:bg-secondary-hover focus:bg-secondary-hover">
                  <i className="fa-solid fa-ellipsis"></i>
                </div>
              )}
              content={(_: boolean, close: () => void) => (
                <div className="bg-white shadow-custom w-max rounded-md">
                  <ul className="text-base py-2">
                    <li>
                      <div
                        className="cursor-pointer px-6 h-12 flex items-center gap-x-2 text-black hover:text-danger transition-colors leading-none"
                        onClick={() => handleClickDeleteMultiple(close)}
                      >
                        <i className="fa-solid fa-trash ext-lg"></i>
                        <span>Xóa</span>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="h-[calc(100%_-_160px)] w-[calc(100vw_-_248px)]">
        <MyTable
          containerRef={tabelContainerRef}
          columns={COLUMNS}
          data={products}
          checkable={true}
          isLoading={isLoading}
          rowIdField="id"
          haveRowIndex={true}
          selectedRows={selectedRows}
          stickyFirstColumn={true}
          editIcon={
            <i className="fa-solid fa-pen-to-square text-lg leading-none text-gray-700 cursor-pointer transition-colors hover:text-primary"></i>
          }
          deleteIcon={
            <i className="fa-solid fa-trash ext-lg text-gray-700 leading-none cursor-pointer transition-colors hover:text-red-600"></i>
          }
          onSelectRows={handleSelectRows}
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

      <PopupAddProduct
        isActive={isActivePopupAddProduct}
        productId={editProductId}
        onClose={closePopupAddProduct}
        onSave={handleSaveProduct}
      />

      <MyPopupConfirm
        isActive={isActiveConfigm}
        isLoading={isLoadingDelete}
        onClose={closePopupConfirm}
        onAgree={handleDelete}
      >
        {deleteProducts.length > 1 ? (
          <div>
            <span>{`Xác nhận xóa ${deleteProducts.length} sản phẩm`}</span>
          </div>
        ) : deleteProducts.length > 0 ? (
          <div>
            <span>{`Xác nhận xóa sản phẩm với mã `}</span>
            <span className="font-medium">{deleteProducts[0].code}</span>
          </div>
        ) : (
          <div></div>
        )}
      </MyPopupConfirm>
    </div>
  )
}

export default AdminProductsPage
