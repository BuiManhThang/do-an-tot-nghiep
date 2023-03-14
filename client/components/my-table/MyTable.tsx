import React, { useEffect, useState } from 'react'
import MyCheckbox from '../my-checkbox/MyCheckbox'
import MyTr from './MyTr'

export enum TableDataType {
  Text = 1,
  Money = 2,
  Date = 3,
  Custom = 4,
}

export enum TableAlign {
  Left = 1,
  Center = 2,
  Right = 3,
}

export type Column = {
  dataType: TableDataType
  fieldName: string
  title: string
  align?: TableAlign
  width?: number
  minWidth?: number
  maxWidth?: number
  template?: (rowData: any) => React.ReactNode | null | undefined
}

type Props = {
  columns: Column[]
  rowHeight?: number
  tableHeight?: number
  data: any[]
  checkable?: boolean
  rowIdField: string
  selectedRows: any[]
  haveRowIndex?: boolean
  editIcon?: React.ReactNode
  deleteIcon?: React.ReactNode
  stickyFirstColumn?: boolean
  onSelectRows?: (selectedRows: any[]) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

const MyTable = ({
  columns,
  rowHeight,
  tableHeight,
  data,
  rowIdField,
  selectedRows,
  checkable = false,
  haveRowIndex = false,
  stickyFirstColumn = false,
  editIcon,
  deleteIcon,
  onSelectRows,
  onEdit,
  onDelete,
}: Props) => {
  const [isCheckAll, setIsCheckAll] = useState(false)

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

  let leftFirstColumn: string | undefined = undefined
  if (stickyFirstColumn) {
    let leftFirstColumnNumber = 0
    if (checkable) {
      leftFirstColumnNumber += 40
    }
    if (checkable) {
      leftFirstColumnNumber += 56
    }
    leftFirstColumn = `${leftFirstColumnNumber}px`
  }

  useEffect(() => {
    if (selectedRows.length === data.length) {
      setIsCheckAll(true)
    } else {
      setIsCheckAll(false)
    }
  }, [selectedRows, data])

  const handleSelectRow = (selectedRow: any, isSelect: boolean) => {
    if (!(typeof onSelectRows === 'function')) {
      return
    }
    let newSelectedRows: any[] = []
    if (isSelect) {
      newSelectedRows = [...selectedRows, selectedRow]
    } else {
      newSelectedRows = selectedRows.filter((row) => row[rowIdField] !== selectedRow[rowIdField])
    }
    onSelectRows(newSelectedRows)
  }

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!(typeof onSelectRows === 'function')) {
      return
    }
    let newSelectedRows: any[] = []
    if (e.target.checked) {
      newSelectedRows = [...data]
    }
    onSelectRows(newSelectedRows)
  }

  const handleEdit = (selectedRow: any) => {
    if (typeof onEdit === 'function') {
      onEdit(selectedRow)
    }
  }

  const handleDelete = (selectedRow: any) => {
    if (typeof onDelete === 'function') {
      onDelete(selectedRow)
    }
  }

  return (
    <div
      className="w-full h-full border rounded-md border-gray-200 overflow-auto"
      style={{
        height: `${tableHeight}px`,
      }}
    >
      <table className="w-full border-spacing-0">
        <thead>
          <tr>
            {/* Checkbox */}
            {checkable && (
              <th
                className={`sticky top-0 z-[2] h-10 w-10 min-w-[40px] border-b border-gray-200 bg-slate-200 ${
                  stickyFirstColumn ? 'left-0' : ''
                }`}
              >
                <div className="w-full flex justify-center">
                  <MyCheckbox id="check-all" checked={isCheckAll} onChange={handleCheckAll} />
                </div>
              </th>
            )}

            {/* RowIndex */}
            {haveRowIndex && (
              <th
                className={`sticky top-0 z-[2] h-10 w-14 min-w-[56px] px-3 border-b border-gray-200 bg-slate-200 ${
                  stickyFirstColumn ? 'left-10' : ''
                }`}
              >
                <div className="w-full text-center">STT</div>
              </th>
            )}

            {/* Columns */}
            {columns.map((column, columnIndex) => {
              let align = 'text-left'
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

              return (
                <th
                  key={columnIndex}
                  style={{
                    width: width,
                    minWidth: minWidth,
                    maxWidth: maxWidth,
                    left: leftFirstColumn,
                  }}
                  className={`sticky top-0 px-3 h-10 font-medium border-b border-gray-200 bg-slate-200 ${
                    stickyFirstColumn && columnIndex === 0 ? 'sticky z-[3]' : 'z-[2]'
                  }`}
                >
                  <div className={`${align}`}>{column.title}</div>
                </th>
              )
            })}

            {/* Action */}
            {(editIcon || deleteIcon) && (
              <th
                className="sticky top-0 right-0 z-[2] border-b border-gray-200 bg-slate-200"
                style={{
                  width: `${actionWidth}px`,
                  minWidth: `${actionWidth}px`,
                }}
              ></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            return (
              <MyTr
                key={rowIndex}
                columns={columns}
                rowHeight={rowHeight}
                data={row}
                checkable={checkable}
                rowIdField={rowIdField}
                selectedRows={selectedRows}
                rowIndex={rowIndex}
                haveRowIndex={haveRowIndex}
                stickyFirstColumn={stickyFirstColumn}
                leftFirstColumn={leftFirstColumn}
                editIcon={editIcon}
                deleteIcon={deleteIcon}
                onSelect={handleSelectRow}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default MyTable
