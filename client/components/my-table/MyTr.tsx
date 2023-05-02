import React from 'react'
import MyCheckbox from '../my-checkbox/MyCheckbox'
import { Column, TableAlign, TableDataType } from './MyTable'
import { convertDate, numberWithCommas } from '@/common/format'

type Props = {
  columns: Column[]
  rowHeight?: number
  data: any
  checkable?: boolean
  rowIdField: string
  selectedRows: any[]
  haveRowIndex?: boolean
  stickyFirstColumn?: boolean
  leftFirstColumn?: string
  rowIndex: number
  editIcon?: React.ReactNode
  deleteIcon?: React.ReactNode
  onSelect?: (row: any, isSelect: boolean) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

const MyTr = ({
  columns,
  rowHeight,
  data,
  rowIdField,
  selectedRows,
  checkable = false,
  haveRowIndex = false,
  stickyFirstColumn = false,
  leftFirstColumn,
  rowIndex,
  editIcon,
  deleteIcon,
  onSelect,
  onEdit,
  onDelete,
}: Props) => {
  let isChecked = false
  if (selectedRows.findIndex((selectedRow) => selectedRow[rowIdField] === data[rowIdField]) >= 0) {
    isChecked = true
  }

  let height = '40px'
  if (rowHeight) {
    height = `${rowHeight}px`
  }

  let actionWidth = 0
  if (editIcon || deleteIcon) {
    actionWidth += 24
    if (editIcon) {
      actionWidth += 24
    }
    if (deleteIcon) {
      actionWidth += 24
    }
  }

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!(typeof onSelect === 'function')) {
      return 'alo'
    }
    let isSelect = false
    if (e.target.checked) {
      isSelect = true
    }
    onSelect(data, isSelect)
  }

  const handleClickEdit = () => {
    if (typeof onEdit === 'function') {
      onEdit(data)
    }
  }

  const handleClickDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(data)
    }
  }

  return (
    <tr className="group">
      {/* Checkbox */}
      {checkable && (
        <td
          className={`w-10 min-w-[40px] bg-white border-b border-gray-200 transition-colors group-hover:bg-sky-100 ${
            stickyFirstColumn ? 'sticky left-0 z-[1]' : ''
          }`}
          style={{
            height: height,
          }}
        >
          <div className="w-full flex justify-center">
            <MyCheckbox
              id={data[rowIdField]}
              name={data[rowIdField]}
              checked={isChecked}
              size="small"
              onChange={handleCheck}
            />
          </div>
        </td>
      )}

      {/* RowIndex */}
      {haveRowIndex && (
        <td
          className={`w-14 min-w-[56px] bg-white px-3 border-b border-gray-200 transition-colors group-hover:bg-sky-100 ${
            stickyFirstColumn ? (checkable ? 'sticky left-10 z-[1]' : 'sticky left-0 z-[1]') : ''
          }`}
          style={{
            height: height,
          }}
        >
          <div className="w-full text-center">{rowIndex + 1}</div>
        </td>
      )}

      {/* Columns */}
      {columns.map((column, columnIndex) => {
        let width: string | undefined = undefined
        let minWidth: string | undefined = undefined
        let maxWidth: string | undefined = undefined
        if (column.width) {
          width = `${column.width}px`
        }
        if (column.minWidth) {
          minWidth = `${column.minWidth}px`
        }
        if (column.maxWidth) {
          maxWidth = `${column.maxWidth}px`
        }

        if (column.dataType === TableDataType.Custom && typeof column.template === 'function') {
          return (
            <td
              key={columnIndex}
              style={{
                width: width,
                minWidth: minWidth,
                maxWidth: maxWidth,
                height: height,
                left: leftFirstColumn,
              }}
              className={`px-3 border-b bg-white border-gray-200 transition-colors group-hover:bg-sky-100 ${
                stickyFirstColumn && columnIndex === 0
                  ? checkable
                    ? 'sticky left-24 z-[1]'
                    : 'sticky left-14 z-[1]'
                  : ''
              }`}
            >
              {column.template(data)}
            </td>
          )
        }

        let rowValue = data[column.fieldName]
        if (column.childFieldName) {
          rowValue = rowValue[column.childFieldName]
        }
        let align = 'text-left'
        switch (column.dataType) {
          case TableDataType.Date:
            rowValue = convertDate(rowValue)
            break
          case TableDataType.Money:
            rowValue = `${numberWithCommas(rowValue)}đ`
            break
        }

        switch (column.align) {
          case TableAlign.Right:
            align = 'text-right'
            break
          case TableAlign.Center:
            align = 'text-center'
            break

          default:
            break
        }

        return (
          <td
            key={columnIndex}
            style={{
              width: width,
              minWidth: minWidth,
              maxWidth: maxWidth,
              height: height,
              left: leftFirstColumn,
            }}
            className={`px-3 border-b bg-white border-gray-200 transition-colors group-hover:bg-sky-100 ${
              stickyFirstColumn && columnIndex === 0
                ? checkable
                  ? 'sticky left-24 z-[1]'
                  : 'sticky left-14 z-[1]'
                : ''
            }`}
          >
            <div className={`${align}`}>{rowValue}</div>
          </td>
        )
      })}

      {/* Action */}
      {(editIcon || deleteIcon) && (
        <td
          className="sticky right-0 bg-white px-3 border-b border-gray-200 transition-colors group-hover:bg-sky-100"
          style={{
            height: height,
            width: `${actionWidth}px`,
            minWidth: `${actionWidth}px`,
          }}
        >
          <div className="flex items-center justify-between">
            {editIcon && (
              <div onClick={handleClickEdit} title="Sửa">
                {editIcon}
              </div>
            )}
            {deleteIcon && (
              <div onClick={handleClickDelete} title="Xóa">
                {deleteIcon}
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

export default MyTr
