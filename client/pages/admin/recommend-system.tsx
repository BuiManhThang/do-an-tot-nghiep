import baseApi from '@/apis/baseApi'
import { formatMoney } from '@/common/format'
import MyButton from '@/components/my-button/MyButton'
import MyPaging from '@/components/my-paging/MyPaging'
import PopupAssociationRuleDetail from '@/components/popup-association-rule-detail/PopupAssociationRuleDetail'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyTable, { Column, TableAlign, TableDataType } from '@/components/my-table/MyTable'
import { AssociationRule } from '@/types/associationRule'
import { PagingResult } from '@/types/paging'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import PopupGenerateAssociationRule from '@/components/popup-generate-association-rule/PopupGenerateAssociationRule'

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Điểm hỗ trợ',
    value: 'support',
  },
  {
    text: 'Điểm tin cậy',
    value: 'confidence',
  },
  {
    text: 'Điểm hỗ trợ tập đầu vào',
    value: 'antecedentSupport',
  },
  {
    text: 'Điểm hỗ trợ tập đầu ra',
    value: 'consequentSupport',
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
    dataType: TableDataType.Custom,
    fieldName: 'productAntecedents',
    title: 'Tập đầu vào',
    minWidth: 200,
    template: (rowData: any) => {
      const associationRule: AssociationRule = rowData
      return (
        <div className="flex items-center gap-x-2 py-1">
          {associationRule.productAntecedents.map((product) => (
            <div key={product.id} className="relative group/item">
              <Image
                src={product.image}
                alt={product.name}
                width={64}
                height={64}
                className="w-16 h-16 border border-gray-300 rounded-md object-contain object-center"
              />
              <div className="absolute top-0 left-full p-2 rounded-md shadow-custom bg-white max-w-sm w-max opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-opacity duration-300">
                <div className="font-medium mb-1">
                  <span>Mã: </span>
                  <span>{product.code}</span>
                </div>
                <div className="font-medium mb-1">
                  <span>Tên: </span>
                  <span>{product.name}</span>
                </div>
                <div className="text-primary">
                  <span>Giá: </span>
                  <span>{formatMoney(product.price)}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    dataType: TableDataType.Custom,
    fieldName: 'productConsequents',
    title: 'Tập đầu ra',
    minWidth: 200,
    template: (rowData: any) => {
      const associationRule: AssociationRule = rowData
      return (
        <div className="flex items-center gap-x-2 py-1">
          {associationRule.productConsequents.map((product) => (
            <div key={product.id} className="relative group/item">
              <Image
                src={product.image}
                alt={product.name}
                width={64}
                height={64}
                className="w-16 h-16 border border-gray-300 rounded-md object-contain object-center"
              />
              <div className="absolute top-0 left-full p-2 rounded-md shadow-custom bg-white max-w-sm w-max opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-opacity duration-300">
                <div className="font-medium mb-1">
                  <span>Mã: </span>
                  <span>{product.code}</span>
                </div>
                <div className="font-medium mb-1">
                  <span>Tên: </span>
                  <span>{product.name}</span>
                </div>
                <div className="text-primary">
                  <span>Giá: </span>
                  <span>{formatMoney(product.price)}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Right,
    fieldName: 'support',
    title: 'Điểm hỗ trợ (%)',
    width: 200,
    template: (rowData) => {
      return <div className="text-right">{Number(rowData.support * 100).toFixed(2)}</div>
    },
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Right,
    fieldName: 'confidence',
    title: 'Điểm tin cậy (%)',
    width: 200,
    template: (rowData) => {
      return <div className="text-right">{Number(rowData.confidence * 100).toFixed(2)}</div>
    },
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Right,
    fieldName: 'antecedentSupport',
    title: 'Điểm hỗ trợ đầu vào (%)',
    width: 200,
    template: (rowData) => {
      return <div className="text-right">{Number(rowData.antecedentSupport * 100).toFixed(2)}</div>
    },
  },
  {
    dataType: TableDataType.Custom,
    align: TableAlign.Right,
    fieldName: 'consequentSupport',
    title: 'Điểm hỗ trợ đầu ra (%)',
    width: 200,
    template: (rowData) => {
      return <div className="text-right">{Number(rowData.consequentSupport * 100).toFixed(2)}</div>
    },
  },
]

type SearchParams = {
  sort: string
  direction: string
  pageIndex: number
  pageSize: number
}

const getPagingFunc = async (searchParams: SearchParams): Promise<PagingResult> => {
  const res = await baseApi.get('associationRules/paging', {
    pageIndex: searchParams.pageIndex,
    pageSize: searchParams.pageSize,
    sort: searchParams.sort,
    direction: searchParams.direction,
  })
  return res.data as PagingResult
}

const AdminRecommendSystemPage = () => {
  const tabelContainerRef = useRef<HTMLDivElement>(null)
  const [editEntity, setEditEntity] = useState<AssociationRule | undefined>(undefined)
  const [isActivePopupDetail, setIsActivePopupDetail] = useState(false)
  const [isActivePopupGenerate, setIsActivePopupGenerate] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [entities, setEntities] = useState<AssociationRule[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    sort: 'confidence',
    direction: 'desc',
    pageIndex: 1,
    pageSize: 20,
  })

  useEffect(() => {
    const getPagingEntities = async () => {
      setIsLoading(true)
      try {
        const pagingResult = await getPagingFunc({
          sort: 'confidence',
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
    const selectedEntity = entities.find((entity) => entity.id === entityId)
    setEditEntity(selectedEntity)
    setIsActivePopupDetail(true)
  }

  const closePopupDetail = () => {
    setIsActivePopupDetail(false)
  }

  const openPopupGenerate = () => {
    setIsActivePopupGenerate(true)
  }

  const closePopupGenerate = () => {
    setIsActivePopupGenerate(false)
  }

  const handleSaveEntity = () => {
    closePopupGenerate()
    const newSearchParams: SearchParams = {
      ...searchParams,
      pageIndex: 1,
    }
    setSearchParams(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleClickEdit = (e: AssociationRule) => {
    openPopupDetail(e.id)
  }

  return (
    <div className="h-full">
      <Head>
        <title>Quản lý hệ thống gợi ý</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Quản lý hệ thống gợi ý</h2>

      <div className="flex items-start justify-end mb-6">
        <div className="flex items-center gap-x-4">
          <div className="w-96">
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
          <div className="w-64">
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
              text="Sinh luật kết hợp"
              startIcon={<i className="fa-solid fa-plus"></i>}
              onClick={() => openPopupGenerate()}
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

      <PopupAssociationRuleDetail
        isActive={isActivePopupDetail}
        associationRule={editEntity}
        onClose={closePopupDetail}
      />

      <PopupGenerateAssociationRule
        isActive={isActivePopupGenerate}
        onClose={closePopupGenerate}
        onSave={handleSaveEntity}
      />
    </div>
  )
}

export default AdminRecommendSystemPage
