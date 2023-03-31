import React, { useEffect, useState } from 'react'
import MySelect, { MySelectOption } from '../my-select/MySelect'

const PAGE_SIZE_OPTIONS: MySelectOption[] = [
  {
    value: 1,
    text: '1 bản ghi',
  },
  {
    value: 2,
    text: '2 bản ghi',
  },
  {
    value: 20,
    text: '20 bản ghi',
  },
  {
    value: 50,
    text: '50 bản ghi',
  },
  {
    value: 100,
    text: '100 bản ghi',
  },
]

type Props = {
  total: number
  pageSize: number
  pageIndex: number
  onChangePageSize?: (pageSize: number) => void
  onChangePageIndex?: (pageSize: number) => void
}

const MyPaging = ({
  total,
  pageSize = 20,
  pageIndex = 1,
  onChangePageSize,
  onChangePageIndex,
}: Props) => {
  const [totalPageArr, setTotalPageArr] = useState<number[]>([])
  const [renderedPages, setRenderedPages] = useState<number[]>([])
  const [totalPage, setTotalPage] = useState(0)

  useEffect(() => {
    const pageSizeNumber = typeof pageSize === 'string' ? parseInt(pageSize) : pageSize
    const totalPage = Math.ceil(total / pageSizeNumber)
    setTotalPage(totalPage)
    const arr = []
    for (let index = 1; index <= totalPage; index++) {
      arr.push(index)
    }
    setTotalPageArr(arr)

    const resultArr = [pageIndex]
    for (let index = 1; index < 3; index++) {
      const nextPageIdx = pageIndex + index
      if (nextPageIdx <= totalPage) {
        resultArr.push(nextPageIdx)
      }
      const prevPageIdx = pageIndex - index
      if (prevPageIdx >= 1) {
        resultArr.unshift(prevPageIdx)
      }

      setRenderedPages(resultArr)
    }
  }, [pageSize, total, pageIndex])

  const handleChangePageSize = (newPageSize: string | number | boolean | null | undefined) => {
    if (typeof onChangePageSize !== 'function') return
    if (typeof newPageSize !== 'number') return
    onChangePageSize(newPageSize)
  }

  const handleChangePageIndex = (newPageIndex: number) => {
    if (typeof onChangePageIndex !== 'function') return
    onChangePageIndex(newPageIndex)
  }

  const moveToNextPage = () => {
    const nextPageIdx = pageIndex + 1
    if (nextPageIdx > totalPage) {
      return
    }
    handleChangePageIndex(nextPageIdx)
  }

  const moveToPrevPage = () => {
    const prevPageIdx = pageIndex - 1
    if (prevPageIdx < 1) {
      return
    }
    handleChangePageIndex(prevPageIdx)
  }

  const moveToPageIndex = (pageIdx: number) => {
    if (pageIdx === pageIndex) {
      return
    }
    handleChangePageIndex(pageIdx)
  }

  return (
    <div className="flex items-center justify-between h-14">
      <div>
        Tổng: <span className="font-medium">{total}</span> bản ghi
      </div>
      <div className="flex items-center gap-x-5">
        <div className="w-80">
          <MySelect
            id="page-size"
            name="page-size"
            options={PAGE_SIZE_OPTIONS}
            label="Số lượng bản ghi 1 trang"
            isHorizontal={true}
            isOptionsTop={true}
            value={pageSize}
            onChange={handleChangePageSize}
          />
        </div>
        <div className="flex items-center">
          <div
            className={`w-10 h-10 text-sm rounded-md ${
              pageIndex === 1 ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:text-primary'
            } transition-all flex items-center justify-center`}
            onClick={moveToPrevPage}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </div>
          {pageIndex >= 4 && (
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-md cursor-pointer hover:text-primary transition-all flex items-center justify-center`}
                onClick={() => handleChangePageIndex(1)}
              >
                1
              </div>
              {pageIndex >= 5 && (
                <div className="w-10 h-10 flex items-center justify-center">...</div>
              )}
            </div>
          )}
          {renderedPages.map((pageIdx) => {
            return (
              <div
                key={pageIdx}
                className={`w-10 h-10 rounded-md ${
                  pageIdx === pageIndex
                    ? 'font-medium text-primary cursor-default'
                    : 'cursor-pointer'
                }  hover:text-primary transition-all flex items-center justify-center`}
                onClick={() => moveToPageIndex(pageIdx)}
              >
                {pageIdx}
              </div>
            )
          })}
          {pageIndex <= totalPageArr[totalPageArr.length - 4] && (
            <div className="flex items-center">
              {pageIndex <= totalPageArr[totalPageArr.length - 5] && (
                <div className="w-10 h-10 flex items-center justify-center">...</div>
              )}
              <div
                className={`w-10 h-10 rounded-md cursor-pointer hover:text-primary transition-all flex items-center justify-center`}
                onClick={() => handleChangePageIndex(totalPage)}
              >
                {totalPage}
              </div>
            </div>
          )}
          <div
            className={`w-10 h-10 text-sm rounded-md ${
              pageIndex === totalPageArr[totalPageArr.length - 1]
                ? 'text-gray-300 cursor-default'
                : 'cursor-pointer hover:text-primary'
            } transition-all flex items-center justify-center`}
            onClick={moveToNextPage}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPaging
