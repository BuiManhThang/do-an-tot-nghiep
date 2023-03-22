import React, { useState } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import Image from 'next/image'
import { signOut } from '@/store/reducers/userSlice'
import { useRouter } from 'next/router'
import { Popover, Transition } from '@headlessui/react'
import MyPopover from '../my-popover/MyPopover'

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
    text: 'Giới thiệu',
    url: '/1',
  },
  {
    text: 'Hoa quả',
    url: '/2',
  },
  {
    text: 'Đồ uống',
    url: '/3',
  },
  {
    text: 'Thức ăn nhanh',
    url: '/4',
  },
]

const TheNavBar = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)
  const [isActive, setIsActive] = useState(false)

  const isInAdminPage = userInfo?.isAdmin && router.pathname.includes('admin') ? true : false

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
        <div className="justify-self-center lg:justify-self-start font-bold text-2xl text-primary cursor-pointer">
          Logo
        </div>
        {!isInAdminPage && (
          <ul className="hidden lg:flex h-full justify-self-center">
            {NAVBAR_LINKS.map((link, index) => {
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
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer text-xl hover:text-primary transition-colors">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer text-xl hover:text-primary transition-colors">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
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
                          <div
                            className="cursor-pointer px-6 h-12 flex items-center text-black hover:text-primary transition-colors"
                            onClick={close}
                          >
                            <i className="fa-solid fa-info pr-3 pb-1"></i>
                            <span>Thông tin tài khoản</span>
                          </div>
                        </li>
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
            {NAVBAR_LINKS.map((link, index) => {
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
    </div>
  )
}

export default TheNavBar
