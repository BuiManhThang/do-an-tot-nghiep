import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

type SideBarLink = {
  icon: React.ReactNode
  text: string
  url: string
}

const SIDE_BAR_LINKS: SideBarLink[] = [
  {
    text: 'Tổng quan',
    icon: <i className="fa-solid fa-house-chimney"></i>,
    url: '/admin',
  },
  {
    text: 'Sản phẩm',
    icon: <i className="fa-solid fa-bag-shopping"></i>,
    url: '/admin/products',
  },
  {
    text: 'Danh mục',
    icon: <i className="fa-solid fa-tag"></i>,
    url: '/admin/categories',
  },
  {
    text: 'Đơn hàng',
    icon: <i className="fa-solid fa-receipt"></i>,
    url: '/admin/orders',
  },
  {
    text: 'Người dùng',
    icon: <i className="fa-solid fa-users"></i>,
    url: '/admin/users',
  },
  {
    text: 'Đánh giá',
    icon: <i className="fa-solid fa-comments"></i>,
    url: '/admin/reviews',
  },
  {
    text: 'Hệ thống gợi ý',
    icon: <i className="fa-solid fa-database"></i>,
    url: '/admin/recommend-system',
  },
]

const TheSideBar = () => {
  const router = useRouter()

  return (
    <div className="w-[200px] h-full bg-white shadow-custom">
      <ul className="py-6 px-3">
        {SIDE_BAR_LINKS.map((link) => (
          <li key={link.url} className="w-full h-12">
            <Link
              href={link.url}
              className={`w-full h-full px-3 grid grid-cols-[42px_auto] items-center rounded-md transition-colors hover:text-primary ${
                router.pathname === link.url
                  ? 'bg-primary text-white hover:text-white hover:bg-primary-hover'
                  : ''
              }`}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="font-medium">{link.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TheSideBar
