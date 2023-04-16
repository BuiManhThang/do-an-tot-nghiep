import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import MySelect, { MySelectOption } from '@/components/my-select/MySelect'
import { formatMoney, numberWithCommas } from '@/common/format'
import Head from 'next/head'
import baseApi from '@/apis/baseApi'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'
import { TotalResult, StatisticalRevenueResult } from '@/types/report'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

const INITIAL_DATA_MONTH = [0, 0, 0, 0, 0, 0, 50, 0, 1, 0, 0, 0]
const INITIAL_DATA_YEAR = [0, 0, 0, 0, 0]
const INITIAL_BACKGROUND_COLORS = ['#f87171', '#fb923c', '#60a5fa', '#a78bfa', '#a3e635']
const INITIAL_BORDER_COLORS = ['#ef4444', '#f97316', '#1d4ed8', '#8b5cf6', '#84cc16']

const AdminPage = () => {
  const { openToast } = useToastMsg()
  const [selectedTerm, setSelectedTerm] = useState(1)
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
        const [totalResultRes, statisticalRevenueRes] = await Promise.all([
          baseApi.get('/report/total'),
          baseApi.get('/report/statistical-revenue?month=true'),
        ])
        const totalResult: TotalResult = totalResultRes.data
        const statisticalRevenueResult: StatisticalRevenueResult[] = statisticalRevenueRes.data
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
        console.log(backgroundColors)
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

  return (
    <div className="w-full h-full">
      <Head>
        <title>Trang chủ</title>
      </Head>
      <h2 className="font-bold text-xl mb-6 leading-none">Tổng quan</h2>

      <div className="mb-6 h-[calc(100%_-_44px)] flex flex-col gap-y-6">
        <div className="grid grid-cols-4 gap-x-6">
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
        <div className="mt-6 grid grid-cols-3 grid-rows-2 gap-x-6 gap-y-6 h-[calc(100%_-_170px)] overflow-hidden pb-6">
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
      </div>
    </div>
  )
}

export default AdminPage
