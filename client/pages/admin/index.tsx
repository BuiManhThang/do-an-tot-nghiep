import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import { convertDate, formatMoney, numberWithCommas } from '@/common/format'
import Head from 'next/head'
import baseApi from '@/apis/baseApi'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import {
  TotalResult,
  StatisticalRevenueResult,
  StatisticalRevenueProductResult,
} from '@/types/report'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import MyTextField from '@/components/my-text-field/MyTextField'
import { writeFile, utils } from 'xlsx'
import MyButton from '@/components/my-button/MyButton'
import { PagingResult } from '@/types/paging'
import { Product } from '@/types/product'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartDataLabels,
  Legend,
  Title,
  Tooltip
)

const labels = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

const yearLabels = ['2020', '2021', '2022', '2023', '2024']

const TERM_OPTIONS: MySelectOption[] = [
  {
    value: 1,
    text: 'Tháng',
  },
  {
    value: 2,
    text: 'Năm',
  },
]

const SORT_OPTIONS: MySelectOption[] = [
  {
    value: 'amount',
    text: 'Số lượng bán',
  },
  {
    value: 'total',
    text: 'Doanh thu',
  },
]

const SORT_DIRECTION_OPTIONS: MySelectOption[] = [
  {
    value: 'asc',
    text: 'Tăng dần',
  },
  {
    value: 'desc',
    text: 'Giảm dần',
  },
]

const INITIAL_DATA_MONTH = [0, 0, 0, 0, 0, 0, 50, 0, 1, 0, 0, 0]
const INITIAL_DATA_YEAR = [0, 0, 0, 0, 0]
const INITIAL_BACKGROUND_COLORS = ['#f87171', '#fb923c', '#60a5fa', '#a78bfa', '#a3e635']
const INITIAL_BORDER_COLORS = ['#ef4444', '#f97316', '#1d4ed8', '#8b5cf6', '#84cc16']

const PRODUCT_LABELS = ['January', 'February']
const PRODUCT_COLORS = [
  '#ef4444',
  '#f97316',
  '#1d4ed8',
  '#8b5cf6',
  '#84cc16',
  '#f87171',
  '#fb923c',
  '#60a5fa',
  '#a78bfa',
  '#a3e635',
]

const getFirstAndLastDayInMonth = () => {
  const currentDate = new Date(),
    y = currentDate.getFullYear(),
    m = currentDate.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)
  return { firstDay, lastDay }
}

const AdminPage = () => {
  const { firstDay: firstDayInMonth, lastDay: lastDayInMonth } = getFirstAndLastDayInMonth()
  const { openToast } = useToastMsg()
  const [selectedTerm, setSelectedTerm] = useState(1)
  const [selectedStartDate, setSelectedStartDate] = useState(
    convertDate(firstDayInMonth, 'yyyy-MM-dd')
  )
  const [error, setError] = useState({
    startDate: '',
    endDate: '',
  })
  const [selectedEndDate, setSelectedEndDate] = useState(convertDate(lastDayInMonth, 'yyyy-MM-dd'))
  const [selectedSortDirection, setSelectedSortDirection] = useState('desc')
  const [selectedSortDirectionInventory, setSelectedSortDirectionInventory] = useState('desc')
  const [selectedSort, setSelectedSort] = useState('amount')
  const [options, setOptions] = useState({
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: 'Danh thu theo tháng',
        font: {
          size: 24,
        },
        color: '#000',
        padding: {
          bottom: 30,
        },
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      maintainAspectRatio: false,
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ''

            if (label) {
              label += ': '
            }

            if (context.parsed.y) {
              label += `${formatMoney(context.parsed.y)}đ`
            }

            return label
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string | null | undefined) {
            if (value) {
              return `${formatMoney(value)}đ`
            }
            return ''
          },
        },
      },
    },
    layout: {
      padding: {
        left: 10,
      },
    },
  })
  const [data, setData] = useState({
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: INITIAL_DATA_MONTH,
        borderColor: 'rgba(37, 99, 235, 0.5)',
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
      },
    ],
  })
  const [dataOrder, setDataOrder] = useState({
    labels: ['Chờ xác nhận', 'Đã xác nhận'],
    datasets: [
      {
        label: 'Đơn hàng',
        data: [0, 0],
        backgroundColor: ['#fb923c', '#60a5fa'],
        borderColor: ['#f97316', '#1d4ed8'],
        borderWidth: 1,
      },
    ],
  })
  const [dataCategory, setDataCategory] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sản phẩm',
        data: [],
        backgroundColor: INITIAL_BACKGROUND_COLORS,
        borderColor: INITIAL_BORDER_COLORS,
        borderWidth: 1,
      },
    ],
  })
  const [dataProduct, setDataProduct] = useState({
    labels: PRODUCT_LABELS,
    datasets: [
      {
        label: 'Số lượng đã bán',
        data: [0],
        backgroundColor: PRODUCT_COLORS,
      },
    ],
  })
  const [dataProductInventory, setDataProductInventory] = useState({
    labels: PRODUCT_LABELS,
    datasets: [
      {
        label: 'Số lượng trong kho',
        data: [0],
        backgroundColor: PRODUCT_COLORS,
      },
    ],
  })
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState({
    money: '',
    mark: 'VNĐ',
  })

  useEffect(() => {
    const getInitData = async () => {
      try {
        const [
          totalResultRes,
          statisticalRevenueRes,
          statisticalRevenueProductsRes,
          productInventoryRes,
        ] = await Promise.all([
          baseApi.get('/report/total'),
          baseApi.get('/report/statistical-revenue?month=true'),
          baseApi.get('/report/statistical-revenue-products', {
            pageIndex: 1,
            pageSize: 10,
            startDate: '2023-05-01',
            endDate: '2023-05-31',
            sort: 'amount',
            direction: 'desc',
          }),
          baseApi.get('/products/paging', {
            pageIndex: 1,
            pageSize: 10,
            sort: 'amount',
            direction: 'desc',
          }),
        ])

        const totalResult: TotalResult = totalResultRes.data
        const statisticalRevenueResult: StatisticalRevenueResult[] = statisticalRevenueRes.data
        const statisticalRevenueProductsResult: StatisticalRevenueProductResult[] =
          statisticalRevenueProductsRes.data
        const productInventoryPaging: PagingResult = productInventoryRes.data
        const productInventory: Product[] = productInventoryPaging.data
        setTotalProducts(totalResult.productsCount)
        setTotalUsers(totalResult.usersCount)
        setTotalOrders(totalResult.ordersCount)
        let totalRevenue = totalResult.totalMoney
        let mark = 'VNĐ'
        let totalRevenueString = `${totalRevenue}`
        if (totalRevenue >= 1000000000) {
          totalRevenueString = (totalRevenue / 1000000000).toFixed(1)
          mark = 'Tỉ VNĐ'
        }
        setTotalRevenue({
          money: totalRevenueString,
          mark,
        })
        setDataOrder((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [totalResult.pendingOrdersCount, totalResult.confirmedOrdersCount],
            },
          ],
        }))

        setDataProduct((prev) => ({
          ...prev,
          labels: statisticalRevenueProductsResult.map((s) => {
            const name = `${s.code} - ${s.name}`
            if (name.length > 23) {
              return `${name.slice(0, 23)}...`
            }
            return name
          }),
          datasets: [
            {
              ...prev.datasets[0],
              data: statisticalRevenueProductsResult.map((s) => s.sellAmount),
            },
          ],
        }))
        setDataProductInventory((prev) => ({
          ...prev,
          labels: productInventory.map((s) => {
            const name = `${s.code} - ${s.name}`
            if (name.length > 23) {
              return `${name.slice(0, 23)}...`
            }
            return name
          }),
          datasets: [
            {
              ...prev.datasets[0],
              data: productInventory.map((s) => s.amount),
            },
          ],
        }))
        const categoryNames: never[] = []
        const backgroundColors: never[] = []
        const borderColors: never[] = []
        const productsOfCategories: never[] = []
        totalResult.categories.forEach((category, idx) => {
          categoryNames.push(category.name as never)
          backgroundColors.push(INITIAL_BACKGROUND_COLORS[idx] as never)
          borderColors.push(INITIAL_BORDER_COLORS[idx] as never)
          productsOfCategories.push(category.productsCount as never)
        })
        setDataCategory((prev) => ({
          ...prev,
          labels: categoryNames,
          datasets: [
            {
              ...prev.datasets[0],
              // backgroundColors: backgroundColors,
              // borderColors: borderColors,
              data: productsOfCategories,
            },
          ],
        }))
        const formattedData = [...INITIAL_DATA_MONTH]
        statisticalRevenueResult.forEach((r) => {
          formattedData[`${r.time - 1}`] = r.totalRevenue
        })
        for (let index = formattedData.length - 1; index >= 0; index--) {
          const r = formattedData[index]
          if (r !== 0) {
            formattedData.splice(index + 1)
            break
          }
        }
        setData({
          labels: labels,
          datasets: [
            {
              label: 'Doanh thu',
              data: formattedData,
              borderColor: 'rgba(37, 99, 235, 0.5)',
              backgroundColor: 'rgba(37, 99, 235, 0.9)',
            },
          ],
        })
      } catch (error) {
        openToast({
          msg: 'Có lỗi xảy ra',
          type: ToastMsgType.Danger,
        })
      }
    }

    getInitData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangeTerm = async (e: number | string | undefined | null | boolean) => {
    if (!e) return
    setSelectedTerm(Number(e))
    if (e === 1) {
      const res = await baseApi.get('/report/statistical-revenue?month=true')
      const formattedData = [...INITIAL_DATA_MONTH]
      const statisticalRevenue: StatisticalRevenueResult[] = res.data
      statisticalRevenue.forEach((r) => {
        formattedData[`${r.time - 1}`] = r.totalRevenue
      })

      for (let index = formattedData.length - 1; index >= 0; index--) {
        const r = formattedData[index]
        if (r !== 0) {
          formattedData.splice(index + 1)
          break
        }
      }

      setData({
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: formattedData,
            borderColor: 'rgba(37, 99, 235, 0.5)',
            backgroundColor: 'rgba(37, 99, 235, 0.9)',
          },
        ],
      })
      setOptions((prev) => ({
        ...prev,
        plugins: {
          ...prev.plugins,
          title: {
            ...prev.plugins.title,
            text: 'Doanh thu theo tháng',
          },
        },
      }))
    } else if (e === 2) {
      const res = await baseApi.get('/report/statistical-revenue?year=true')
      const statisticalRevenue: StatisticalRevenueResult[] = res.data
      const date = new Date()
      const currentYear = date.getFullYear()
      const yearArr: string[] = []
      for (let index = 0; index < 5; index++) {
        yearArr.unshift(`${currentYear - index}`)
      }
      const formattedData = [...INITIAL_DATA_YEAR]
      statisticalRevenue.forEach((r) => {
        formattedData[yearArr.findIndex((y) => y === `${r.time}`)] = r.totalRevenue
      })

      for (let index = formattedData.length - 1; index >= 0; index--) {
        const r = formattedData[index]
        if (r !== 0) {
          formattedData.splice(index + 1)
          break
        }
      }
      setData({
        labels: yearArr,
        datasets: [
          {
            label: 'Doanh thu',
            data: formattedData,
            borderColor: 'rgba(37, 99, 235, 0.5)',
            backgroundColor: 'rgba(37, 99, 235, 0.9)',
          },
        ],
      })
      setOptions((prev) => ({
        ...prev,
        plugins: {
          ...prev.plugins,
          title: {
            ...prev.plugins.title,
            text: 'Doanh thu theo năm',
          },
        },
      }))
    }
  }

  const handleGetStatisticalRevenueProducts = async (
    startDate: string,
    endDate: string,
    sort: string,
    sortDirection: string
  ) => {
    const statisticalRevenueProductsRes = await baseApi.get(
      '/report/statistical-revenue-products',
      {
        pageIndex: 1,
        pageSize: 10,
        startDate: startDate,
        endDate: endDate,
        sort: sort,
        direction: sortDirection,
      }
    )
    const statisticalRevenueProductsResult: StatisticalRevenueProductResult[] =
      statisticalRevenueProductsRes.data
    setDataProduct((prev) => ({
      ...prev,
      labels: statisticalRevenueProductsResult.map((s) => {
        const name = `${s.code} - ${s.name}`
        if (name.length > 23) {
          return `${name.slice(0, 23)}...`
        }
        return name
      }),
      datasets: [
        {
          ...prev.datasets[0],
          label: sort === 'amount' ? 'Số lượng đã bán' : 'Số tiền thu về',
          data: statisticalRevenueProductsResult.map((s) =>
            sort === 'amount' ? s.sellAmount : s.sellMoney
          ),
        },
      ],
    }))
  }

  const handleChangeSortDirectionProductInventory = async (
    e: number | string | undefined | null | boolean
  ) => {
    if (!e) return
    const newVal = e?.toString() || ''
    setSelectedSortDirectionInventory(newVal)
    const productInventoryRes = await baseApi.get('/products/paging', {
      pageIndex: 1,
      pageSize: 10,
      sort: 'amount',
      direction: newVal,
    })
    const productInventoryPaging: PagingResult = productInventoryRes.data
    const productInventory: Product[] = productInventoryPaging.data
    setDataProductInventory((prev) => ({
      ...prev,
      labels: productInventory.map((s) => {
        const name = `${s.code} - ${s.name}`
        if (name.length > 23) {
          return `${name.slice(0, 23)}...`
        }
        return name
      }),
      datasets: [
        {
          ...prev.datasets[0],
          data: productInventory.map((s) => s.amount),
        },
      ],
    }))
  }

  const handleChangeSortDirection = (e: number | string | undefined | null | boolean) => {
    if (!e) return
    const newVal = e?.toString() || ''
    setSelectedSortDirection(newVal)
    handleGetStatisticalRevenueProducts(selectedStartDate, selectedEndDate, selectedSort, newVal)
  }

  const handleChangeSort = (e: number | string | undefined | null | boolean) => {
    if (!e) return
    const newVal = e?.toString() || ''
    setSelectedSort(newVal)
    handleGetStatisticalRevenueProducts(
      selectedStartDate,
      selectedEndDate,
      newVal,
      selectedSortDirection
    )
  }

  const handleChangeStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    const endDate = new Date(selectedEndDate)
    if (date > endDate) {
      setError({
        startDate: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
        endDate: 'Ngày kết thúc phải nhỏ hơn hoặc bằng ngày bắt đầu',
      })
      return
    }
    setError({
      startDate: '',
      endDate: '',
    })
    const newVal = convertDate(e.target.value, 'yyyy-MM-dd')
    setSelectedStartDate(newVal)
    handleGetStatisticalRevenueProducts(
      newVal,
      selectedEndDate,
      selectedSort,
      selectedSortDirection
    )
  }

  const handleChangeEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    const startDate = new Date(selectedStartDate)
    if (date < startDate) {
      setError({
        startDate: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
        endDate: 'Ngày kết thúc phải nhỏ hơn hoặc bằng ngày bắt đầu',
      })
      return
    }
    setError({
      startDate: '',
      endDate: '',
    })
    const newVal = convertDate(e.target.value, 'yyyy-MM-dd')
    setSelectedEndDate(newVal)
    handleGetStatisticalRevenueProducts(
      selectedStartDate,
      newVal,
      selectedSort,
      selectedSortDirection
    )
  }

  const handleExport = async () => {
    const statisticalRevenueProductsRes = await baseApi.get(
      '/report/statistical-revenue-products',
      {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        sort: selectedSort,
        direction: selectedSortDirection,
      }
    )
    const statisticalRevenueProductsResult: StatisticalRevenueProductResult[] =
      statisticalRevenueProductsRes.data
    const headers = [
      [
        'STT',
        'Mã sản phẩm',
        'Tên sản phẩm',
        'SL trong kho',
        'Đơn vị',
        'Giá bán',
        'SL đã bán',
        'Tổng tiền thu được',
      ],
    ]
    const wb = utils.book_new()
    const data = statisticalRevenueProductsResult.map((r, idx) => ({
      rowNumber: idx + 1,
      code: r.code,
      name: r.name,
      amount: r.amount,
      unit: r.unit,
      price: r.price,
      sellAmount: r.sellAmount,
      sellMoney: r.sellMoney,
    }))
    const wscols = [
      { wpx: 40 },
      { wpx: 100 },
      { wpx: 250 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
    ]
    const merge = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 3, c: 3 }, e: { r: 3, c: 7 } },
    ]
    const ws = utils.json_to_sheet([])
    ws['!cols'] = wscols
    ws['!merges'] = merge
    utils.sheet_add_aoa(ws, [['Thống kê sản phẩm bán ra']], { origin: 'A2' })

    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedEndDate)
    const formatedStartDate = convertDate(startDate, 'dd/MM/yyyy')
    const formatedEndDate = convertDate(endDate, 'dd/MM/yyyy')
    const sort = selectedSort === 'amount' ? 'Số lượng bán' : 'Tiền thu được'
    const sortDirection = selectedSortDirection === 'desc' ? 'Giảm dần' : 'Tăng dần'

    utils.sheet_add_aoa(ws, [[`Từ ${formatedStartDate} đến ${formatedEndDate}`]], { origin: 'A4' })
    utils.sheet_add_aoa(ws, [[`Sắp xếp theo: ${sort} - ${sortDirection}`]], { origin: 'D4' })
    utils.sheet_add_aoa(ws, headers, { origin: 'A6' })
    utils.sheet_add_json(ws, data, { skipHeader: true, origin: 'A7' })
    utils.book_append_sheet(wb, ws, 'Thong_ke_theo_san_pham')
    writeFile(wb, 'Thong_ke_theo_san_pham.xlsx')
  }

  const handleExportProductInventory = async () => {
    const productInventoryRes = await baseApi.get('/products/paging', {
      sort: 'amount',
      direction: selectedSortDirectionInventory,
    })
    const productInventoryPaging: PagingResult = productInventoryRes.data
    const productInventory: Product[] = productInventoryPaging.data
    const headers = [['STT', 'Mã sản phẩm', 'Tên sản phẩm', 'SL trong kho', 'Đơn vị', 'Giá bán']]
    const wb = utils.book_new()
    const data = productInventory.map((r, idx) => ({
      rowNumber: idx + 1,
      code: r.code,
      name: r.name,
      amount: r.amount,
      unit: r.unit,
      price: r.price,
    }))
    const wscols = [
      { wpx: 40 },
      { wpx: 100 },
      { wpx: 250 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
    ]
    const merge = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 3, c: 3 }, e: { r: 3, c: 7 } },
    ]
    const ws = utils.json_to_sheet([])
    ws['!cols'] = wscols
    ws['!merges'] = merge
    utils.sheet_add_aoa(ws, [['Thống kê số lượng hàng trong kho']], { origin: 'A2' })

    const sortDirection = selectedSortDirectionInventory === 'desc' ? 'Giảm dần' : 'Tăng dần'

    utils.sheet_add_aoa(ws, [[`Sắp xếp theo: Số lượng trong kho - ${sortDirection}`]], {
      origin: 'A4',
    })
    utils.sheet_add_aoa(ws, headers, { origin: 'A6' })
    utils.sheet_add_json(ws, data, { skipHeader: true, origin: 'A7' })
    utils.book_append_sheet(wb, ws, 'Thong_ke_so_luong_trong_kho')
    writeFile(wb, 'Thong_ke_so_luong_trong_kho.xlsx')
  }

  return (
    <div className="w-full h-full">
      <Head>
        <title>Trang chủ</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Tổng quan</h2>

      <div className="mb-6 h-[calc(100%_-_44px)] flex flex-col gap-y-6 overflow-auto">
        <div className="shrink-0 grid grid-cols-4 gap-x-6">
          <div className="rounded-md border border-green-600 bg-green-100 py-6 px-6">
            <div className="font-medium mb-2">Số lượng sản phẩm</div>
            <div className="flex items-center">
              <div className="text-xl flex items-center px-3 h-10 mr-2 bg-green-300 text-green-600 rounded-md">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <div className="leading-none">
                <span className="text-2xl font-medium">{numberWithCommas(totalProducts)} </span>
                <span className="text-base font-normal">Sản phẩm</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-yellow-600 bg-yellow-100 py-6 px-6">
            <div className="font-medium mb-2">Số lượng người dùng</div>
            <div className="flex items-center">
              <div className="text-xl flex items-center px-3 h-10 mr-2 bg-yellow-300 text-yellow-600 rounded-md">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="leading-none">
                <span className="text-2xl font-medium">{numberWithCommas(totalUsers)} </span>
                <span className="text-base font-normal">Người dùng</span>{' '}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-red-600 bg-red-100 py-6 px-6">
            <div className="font-medium mb-2">Số lượng đơn hàng</div>
            <div className="flex items-center">
              <div className="text-xl flex items-center px-3 h-10 mr-2 bg-red-300 text-red-600 rounded-md">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="leading-none">
                <span className="text-2xl font-medium">{numberWithCommas(totalOrders)} </span>
                <span className="text-base font-normal">đơn hàng</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-blue-600 bg-blue-100 py-6 px-6">
            <div className="font-medium mb-2">Tổng doanh thu</div>
            <div className="flex items-center">
              <div className="text-xl flex items-center px-3 h-10 mr-2 bg-blue-300 text-blue-600 rounded-md">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div className="leading-none">
                <span className="text-2xl font-medium">
                  {numberWithCommas(totalRevenue.money)}{' '}
                </span>
                <span className="text-base font-normal">{totalRevenue.mark}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 mt-6 grid grid-cols-3 grid-rows-2 gap-x-6 gap-y-6 h-[calc(100%_-_170px)] overflow-hidden pb-6">
          <div className="col-start-1 col-end-3 row-span-2 bg-white rounded-md p-4 h-full flex flex-col">
            <div className="relative h-9 flex items-center justify-center">
              <div className="text-2xl font-medium leading-none text-center">
                {selectedTerm === 1 ? 'Doanh thu theo tháng' : 'Doanh thu theo năm'}
              </div>
              <div className="absolute top-0 right-6">
                <MySelect
                  id="sort-option"
                  name="sort-option"
                  options={TERM_OPTIONS}
                  value={selectedTerm}
                  label="Thống kê theo"
                  isHorizontal={true}
                  onChange={handleChangeTerm}
                />
              </div>
            </div>
            <div className="flex-grow flex items-center">
              <Line options={options} data={data} />
            </div>
          </div>
          <div className="col-start-3 col-end-4 bg-white rounded-md p-4">
            <Doughnut
              data={dataOrder}
              width="100%"
              options={{
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Đơn hàng cần xử lý',
                    font: {
                      size: 18,
                      weight: '500',
                    },
                    color: '#000',
                    padding: {
                      bottom: 8,
                    },
                  },
                  legend: {
                    position: 'right',
                  },
                  datalabels: {
                    color: '#000',
                    font: {
                      size: 14,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="col-start-3 col-end-4 bg-white rounded-md p-4">
            <Doughnut
              data={dataCategory}
              width="100%"
              options={{
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Danh mục sản phẩm',
                    font: {
                      size: 18,
                      weight: '500',
                    },
                    color: '#000',
                    padding: {
                      bottom: 8,
                    },
                  },
                  legend: {
                    position: 'right',
                  },
                  datalabels: {
                    color: '#000',
                    font: {
                      size: 14,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="shrink-0 h-[700px] w-full bg-white rounded-md p-4 flex flex-col items-center mb-4">
          <div className="relative h-9 flex items-center justify-between w-full mb-4">
            <div className="text-2xl font-medium leading-none text-left">
              Thống kê sản phẩm bán ra
            </div>
            <div className="flex items-center gap-x-3">
              <div className="w-52">
                <MyTextField
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={selectedStartDate}
                  error={error.startDate}
                  isHorizontal={true}
                  label="Từ"
                  onChange={handleChangeStartDate}
                />
              </div>
              <div className="w-52">
                <MyTextField
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={selectedEndDate}
                  error={error.endDate}
                  isHorizontal={true}
                  label="Đến"
                  onChange={handleChangeEndDate}
                />
              </div>
              <div className="w-64">
                <MySelect
                  id="sort-option-2"
                  name="sort-option-2"
                  options={SORT_OPTIONS}
                  value={selectedSort}
                  label="Sắp xếp theo"
                  isHorizontal={true}
                  onChange={handleChangeSort}
                />
              </div>
              <div className="w-64">
                <MySelect
                  id="sort-direction-option"
                  name="sort-direction-option"
                  options={SORT_DIRECTION_OPTIONS}
                  value={selectedSortDirection}
                  label="Hướng sắp xếp"
                  isHorizontal={true}
                  onChange={handleChangeSortDirection}
                />
              </div>
              <MyButton text="Xuất khẩu" onClick={() => handleExport()} />
            </div>
          </div>
          <div className="h-[600px] w-full">
            <Bar
              height={100}
              width={100}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                  datalabels: {
                    color: '#000',
                    font: {
                      size: 14,
                    },
                    formatter(value) {
                      if (selectedSort === 'amount') return value
                      const newVal = `${formatMoney(value)}đ`
                      if (newVal.length > 10) return `${newVal.slice(0, 10)}...`
                      return newVal
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        let label = context.dataset.label || ''

                        if (label) {
                          label += ': '
                        }

                        if (context.parsed.y) {
                          label +=
                            selectedSort === 'amount'
                              ? `${context.parsed.y}`
                              : `${formatMoney(context.parsed.y)}đ`
                        }

                        return label
                      },
                    },
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: {
                      callback: function (value: number | string | null | undefined) {
                        if (value) {
                          if (selectedSort === 'amount') return value
                          return `${formatMoney(value)}đ`
                        }
                        return ''
                      },
                    },
                  },
                },
              }}
              data={dataProduct}
            />
          </div>
        </div>
        <div className="shrink-0 h-[700px] w-full bg-white rounded-md p-4 flex flex-col items-center mb-4">
          <div className="relative h-9 flex items-center justify-between w-full mb-4">
            <div className="text-2xl font-medium leading-none text-left">
              Thống kê số lượng hàng trong kho
            </div>
            <div className="flex items-center gap-x-3">
              <div className="w-64">
                <MySelect
                  id="sort-direction-product-inventory"
                  name="sort-direction-product-inventory"
                  options={SORT_DIRECTION_OPTIONS}
                  value={selectedSortDirectionInventory}
                  label="Hướng sắp xếp"
                  isHorizontal={true}
                  onChange={handleChangeSortDirectionProductInventory}
                />
              </div>
              <MyButton text="Xuất khẩu" onClick={() => handleExportProductInventory()} />
            </div>
          </div>
          <div className="h-[600px] w-full">
            <Bar
              height={100}
              width={100}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                  datalabels: {
                    color: '#000',
                    font: {
                      size: 14,
                    },
                  },
                },
                maintainAspectRatio: false,
              }}
              data={dataProductInventory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
