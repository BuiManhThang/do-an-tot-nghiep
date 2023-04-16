import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import Image from 'next/image'
import { signOut } from '@/store/reducers/userSlice'
import { useRouter } from 'next/router'
import MyPopover from '../my-popover/MyPopover'
import { getCategories } from '@/store/reducers/navbarSlice'
import PopupSearch from '../popup-search/PopupSearch'

type NavBarLink = {
  text: string
  url: string
}

export const NAVBAR_LINKS: NavBarLink[] = [
  {
    text: 'Trang chủ',
    url: '/',
  },
  {
    text: 'Sản phẩm',
    url: '/products',
  },
]

const TheNavBar = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const productsInCart = useAppSelector((state) => state.cart.products)
  const categories = useAppSelector((state) => state.navbar.categories)
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const [isActive, setIsActive] = useState(false)
  const [isActivePopupSearch, setIsActivePopupSearch] = useState(false)
  const [totalProductsInCart, setTotalProductsInCart] = useState(0)
  const [navbarLinks, setNavbarLinks] = useState<NavBarLink[]>([
    {
      text: 'Trang chủ',
      url: '/',
    },
    {
      text: 'Sản phẩm',
      url: '/products',
    },
  ])

  const isInAdminPage = userInfo?.isAdmin && router.pathname.includes('admin') ? true : false

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch, isInAdminPage])

  useEffect(() => {
    const newNavbarLinks: NavBarLink[] = [
      {
        text: 'Trang chủ',
        url: '/',
      },
      {
        text: 'Sản phẩm',
        url: '/products',
      },
    ]

    for (let index = 0; index < categories.length; index++) {
      if (index === 4) {
        break
      }
      const category = categories[index]
      newNavbarLinks.push({
        text: category.name,
        url: `/products?categoryId=${category.id}`,
      })
    }

    setNavbarLinks(newNavbarLinks)
  }, [categories])

  useEffect(() => {
    setTotalProductsInCart(
      productsInCart.reduce((prev, cur) => {
        return prev + cur.amount
      }, 0)
    )
  }, [productsInCart])

  const toggleMenuLink = () => {
    setIsActive((prev: boolean) => !prev)
  }

  const handleClickSignOut = () => {
    dispatch(signOut())
    router.push('/sign-in')
  }

  const handleClickSignIn = () => {
    router.push('/sign-in')
  }

  const handleClickRegister = () => {
    router.push('/register')
  }

  return (
    <div className="h-16 w-full relative">
      <nav
        className={`${
          isInAdminPage ? 'flex justify-between' : 'grid grid-cols-[132px_auto_132px]'
        } items-center bg-white shadow-md px-6 absolute top-0 left-0 w-full h-full z-10`}
      >
        {!isInAdminPage && (
          <div
            className="w-8 h-8 flex justify-self-start items-center justify-center cursor-pointer text-xl hover:text-primary transition-colors lg:hidden"
            onClick={toggleMenuLink}
          >
            {isActive ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </div>
        )}
        <Link
          href={'/'}
          className="justify-self-center lg:justify-self-start font-bold text-2xl text-primary cursor-pointer"
        >
          Logo
        </Link>
        {!isInAdminPage && (
          <ul className="hidden lg:flex h-full justify-self-center">
            {navbarLinks.map((link, index) => {
              return (
                <li key={index} className="h-full">
                  <Link
                    href={link.url}
                    className={`h-full w-max bg-white flex items-center px-6 hover:text-primary-hover relative ${
                      router.pathname === link.url ? 'text-primary' : ''
                    } transition-colors`}
                  >
                    {link.text}
                    <span
                      className={`${
                        router.pathname === link.url ? 'opacity-100' : 'opacity-0'
                      } absolute bottom-0 left-0 right-0 h-1 bg-primary transition-opacity`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex items-center gap-x-4 justify-self-end">
          {!isInAdminPage && (
            <>
              <div
                className="w-8 h-8 flex items-center justify-center cursor-pointer text-xl hover:text-primary transition-colors"
                onClick={() => setIsActivePopupSearch(true)}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <Link
                href={'/cart'}
                className="w-8 h-8 flex items-center justify-center cursor-pointer text-2xl hover:text-primary transition-colors relative"
              >
                <i className="fa-solid fa-bag-shopping"></i>
                {totalProductsInCart > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 text-xs rounded-full bg-primary text-white flex items-center justify-center">
                    {totalProductsInCart}
                  </div>
                )}
              </Link>
            </>
          )}
          <div className="w-8 h-8">
            <div className="w-full h-full relative">
              <MyPopover
                popoverClassName="w-full h-full"
                targetClassName="w-full h-full outline-none"
                contentClassName="absolute z-10 right-0 top-full"
                target={(open: boolean) => (
                  <>
                    {userInfo ? (
                      <Image
                        src={userInfo.avatar}
                        alt={userInfo.email}
                        width={32}
                        height={32}
                        className={`rounded-full object-cover ring-1 ${
                          open ? 'ring-primary' : 'ring-black'
                        } hover:ring-primary transition-colors`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center cursor-pointer text-xl hover:text-primary transition-colors">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    )}
                  </>
                )}
                content={(_: boolean, close: () => void) => (
                  <div className="bg-white shadow-custom w-max rounded-md">
                    {userInfo ? (
                      <ul className="text-base py-2">
                        <li>
                          <Link
                            href={'/info'}
                            className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                            onClick={close}
                          >
                            <i className="fa-solid fa-info pr-3 pb-1"></i>
                            <span>Thông tin tài khoản</span>
                          </Link>
                        </li>
                        {userInfo.isAdmin && (
                          <li>
                            <Link
                              href={isInAdminPage ? '/' : '/admin'}
                              className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                              onClick={close}
                            >
                              {isInAdminPage ? (
                                <>
                                  <i className="fa-solid fa-house pr-3 pb-1"></i>
                                  <span>Trang chủ</span>
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-house pr-3 pb-1"></i>
                                  <span>Quản lý</span>
                                </>
                              )}
                            </Link>
                          </li>
                        )}
                        <li>
                          <div
                            className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                            onClick={handleClickSignOut}
                          >
                            <i className="fa-solid fa-right-from-bracket pr-3"></i>
                            <span>Đăng xuất</span>
                          </div>
                        </li>
                      </ul>
                    ) : (
                      <ul className="text-base py-2">
                        <li>
                          <div
                            className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                            onClick={handleClickSignIn}
                          >
                            <i className="fa-solid fa-right-to-bracket pr-3"></i>
                            <span>Đăng nhập</span>
                          </div>
                        </li>
                        <li>
                          <div
                            className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                            onClick={handleClickRegister}
                          >
                            <i className="fa-solid fa-key pr-3"></i>
                            <span>Đăng ký</span>
                          </div>
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        <div
          className={`absolute z-20 top-full left-0 bg-white shadow-md w-full border-gray-200 overflow-hidden transition-all duration-300 ${
            isActive ? 'h-[280px] border-t' : 'h-0 border-t-0'
          }`}
        >
          <ul>
            {navbarLinks.map((link, index) => {
              return (
                <li key={index} className="h-14 w-full border-b border-gray-300 last:border-b-0">
                  <Link
                    href={link.url}
                    className="h-full w-full bg-white flex items-center px-6 hover:text-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <PopupSearch isActive={isActivePopupSearch} onClose={() => setIsActivePopupSearch(false)} />
    </div>
  )
}

export default TheNavBar
