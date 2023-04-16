import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ProductCardList from '@/components/product-card-list/ProductCardList'
import ProductCard from '@/components/product-card/ProductCard'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'
import { Product } from '@/types/product'
import MyTextField from '@/components/my-text-field/MyTextField'
import { Category } from '@/types/category'
import MyCheckbox from '@/components/my-checkbox/MyCheckbox'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import MyPaging from '@/components/my-paging/MyPaging'
import { useLayout } from '@/hooks/layoutHook'
import LoadingProductCart from '@/components/loading-product-card/LoadingProductCart'
import MyLoadingSkeleton from '@/components/my-loading-skeleton/MyLoadingSkeleton'

type SearchParams = {
  searchText: string
  categoryId: string
  sort: string
  direction: string | 'desc' | 'asc'
  priceGte?: number
  priceLte?: number
  pageIndex: number
  pageSize: number
}

const ORDER_BY_OPTIONS: MySelectOption[] = [
  {
    text: 'Ngày bán',
    value: 'createdAt',
  },
  {
    text: 'Tên',
    value: 'name',
  },
  {
    text: 'Giá',
    value: 'price',
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

const getPagingFunc = async (param: SearchParams): Promise<PagingResult> => {
  const formattedSearchParam = {
    ...param,
    categoryId:
      param.categoryId && !param.categoryId.includes('all') ? param.categoryId : undefined,
    searchText: param.searchText ? param.searchText : undefined,
    isActive: true,
  }
  const res = await baseApi.get('products/paging', formattedSearchParam)
  const pagingResult: PagingResult = res.data
  return pagingResult
}

const getCategoriesFunc = async (): Promise<Category[]> => {
  const res = await baseApi.get('categories/paging', {
    sort: 'code',
    direction: 'asc',
  })
  const pagingResult: PagingResult = res.data
  const categories = pagingResult.data
  return categories
}

const ProductsPage = () => {
  const router = useRouter()
  const { scrollToTop } = useLayout()
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchParam, setSearchParam] = useState<SearchParams>({
    searchText: '',
    categoryId: 'all',
    sort: 'createdAt',
    direction: 'desc',
    pageIndex: 1,
    pageSize: 9,
  })

  useEffect(() => {
    const getPagingInit = async () => {
      setIsLoadingProducts(true)
      setIsLoadingCategories(true)
      const selectedCategoryId: string = router.query.categoryId?.toString() || 'all'
      const searchText: string = router.query.searchText?.toString() || ''
      try {
        setSearchParam({
          searchText: searchText,
          categoryId: selectedCategoryId,
          sort: 'createdAt',
          direction: 'desc',
          pageIndex: 1,
          pageSize: 9,
        })
        const [pagingProductResult, categoriesResult] = await Promise.all([
          getPagingFunc({
            searchText: searchText,
            categoryId: selectedCategoryId,
            sort: 'createdAt',
            direction: 'desc',
            pageIndex: 1,
            pageSize: 9,
          }),
          getCategoriesFunc(),
        ])
        setProducts(pagingProductResult.data)
        setTotalRecords(pagingProductResult.total)
        setCategories([
          {
            id: 'all',
            code: 'all',
            name: 'Tất cả',
            image: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...categoriesResult,
        ])
      } catch (error) {
        console.log(error)
        setProducts([])
        setTotalRecords(0)
        setCategories([])
      } finally {
        setIsLoadingProducts(false)
        setIsLoadingCategories(false)
      }
    }

    getPagingInit()
  }, [router.query.categoryId, router.query.searchText])

  const getPaging = async (param: SearchParams) => {
    setIsLoadingProducts(true)
    try {
      const pagingProductResult = await getPagingFunc(param)
      setProducts(pagingProductResult.data)
      setTotalRecords(pagingProductResult.total)
    } catch (error) {
      console.log(error)
      setProducts([])
      setTotalRecords(0)
    } finally {
      setIsLoadingProducts(false)
      scrollToTop()
    }
  }

  const handleChangeSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParam: SearchParams = {
      ...searchParam,
      searchText: e.target.value,
      pageIndex: 1,
    }
    setSearchParam(newSearchParam)
    clearTimeout(timeoutFunc.current)
    timeoutFunc.current = setTimeout(() => {
      getPaging(newSearchParam)
    }, 500)
  }

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    let categoryIds = searchParam.categoryId.split(';')
    if (e.target.value === 'all') {
      categoryIds = ['all']
    } else if (searchParam.categoryId.includes(e.target.value)) {
      categoryIds = categoryIds.filter(
        (categoryId) => categoryId !== e.target.value && categoryId !== 'all'
      )
    } else {
      categoryIds = [...categoryIds.filter((categoryId) => categoryId !== 'all'), e.target.value]
    }
    const newSearchParams: SearchParams = {
      ...searchParam,
      categoryId: categoryIds.join(';'),
    }
    setSearchParam(newSearchParams)
    getPaging(newSearchParams)
  }

  const handleChangeSort = (sort: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParam,
      sort: sort?.toString() || 'createdAt',
      pageIndex: 1,
    }
    setSearchParam(newSearchParams)
    getPaging(newSearchParams)
  }
  const handleChangeSortDirection = (direction: string | number | boolean | null | undefined) => {
    const newSearchParams: SearchParams = {
      ...searchParam,
      direction: direction?.toString() || 'desc',
      pageIndex: 1,
    }
    setSearchParam(newSearchParams)
    getPaging(newSearchParams)
  }
  const handleChangePageIndex = (pageIndex: number) => {
    const newSearchParams: SearchParams = {
      ...searchParam,
      pageIndex: pageIndex,
    }
    setSearchParam(newSearchParams)
    getPaging(newSearchParams)
  }

  return (
    <>
      <Head>
        <title>Sản phẩm</title>
      </Head>

      <main className="pt-4 w-full px-6 lg:w-[1200px] lg:px-0 lg:mx-auto">
        <div className="grid grid-cols-[280px_auto] gap-x-5">
          <div className="col-start-2 col-end-4">
            <MyPaging
              pageIndex={searchParam.pageIndex}
              pageSize={9}
              isShowPageSize={false}
              total={totalRecords}
              onChangePageIndex={handleChangePageIndex}
            />
          </div>
        </div>
        <div className="grid grid-cols-[280px_auto] gap-x-5 relative">
          <div className="bg-white p-4 rounded-md shadow-custom h-min sticky top-9">
            <div className="text-lg font-bold mb-3">Tìm kiếm sản phẩm</div>
            <div className="w-full mb-4">
              <MyTextField
                id="searchText"
                name="searchText"
                placeholder="Nhập tên sản phẩm"
                disabled={isLoadingCategories}
                startIcon={<i className="fa-solid fa-magnifying-glass text-gray-500"></i>}
                value={searchParam.searchText}
                onChange={handleChangeSearchText}
              />
            </div>
            <div className="w-full mb-4">
              <div className="font-medium mb-3">Danh mục</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {isLoadingCategories
                  ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                      <MyLoadingSkeleton key={item} className="w-full h-[21px] rounded-md" />
                    ))
                  : categories.map((category) => (
                      <div key={category.id}>
                        <MyCheckbox
                          id={`category-${category.id}`}
                          name="category"
                          label={category.name}
                          size="small"
                          style={{
                            alignItems: 'baseline',
                          }}
                          labelStyle={{
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          value={category.id}
                          checked={searchParam.categoryId.includes(category.id)}
                          onChange={handleChangeCategory}
                        />
                      </div>
                    ))}
              </div>
            </div>
            <div className="w-full mb-4">
              <label htmlFor="sort" className="font-medium inline-block mb-1">
                Sắp xếp theo
              </label>
              <MySelect
                id="sort"
                name="sort"
                disabled={isLoadingCategories}
                value={searchParam.sort}
                options={ORDER_BY_OPTIONS}
                onChange={handleChangeSort}
              />
            </div>
            <div className="w-full mb-4">
              <label htmlFor="direction" className="font-medium inline-block mb-1">
                Hướng sắp xếp
              </label>
              <MySelect
                id="direction"
                name="direction"
                disabled={isLoadingCategories}
                value={searchParam.direction}
                options={ORDER_DIRECTION}
                onChange={handleChangeSortDirection}
              />
            </div>
          </div>
          <div>
            {isLoadingProducts ? (
              <ProductCardList isInProductsView={true}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                  <LoadingProductCart key={item} />
                ))}
              </ProductCardList>
            ) : (
              <ProductCardList isInProductsView={true}>
                {products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </ProductCardList>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductsPage
