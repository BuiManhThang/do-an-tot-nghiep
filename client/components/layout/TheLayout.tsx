import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Background from '../../assets/images/sign-in/pexels-moose-photos-1037995.jpg'
import TheNavBar from './TheNavBar'
import { getCurrentUser } from '@/store/reducers/userSlice'
import TheFooter from './TheFooter'
import TheSideBar from './TheSideBar'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import MyToastMsg from '../my-toast-msg/MyToastMsg'
import { initCart } from '@/store/reducers/cartSlice'

type Props = {
  children?: React.ReactNode | React.ReactNode[]
}

const TheLayout = ({ children }: Props) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)

  useEffect(() => {
    dispatch(getCurrentUser(''))
      .unwrap()
      .then((res) => {
        dispatch(initCart(res?.cart))
      })
  }, [dispatch])

  if (router.pathname === '/sign-in' || router.pathname === '/register') {
    return (
      <div className="w-full h-screen bg-blue-100 flex items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src={Background}
            alt="background"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {children}
      </div>
    )
  }

  let isAdminPage = false
  if (userInfo?.isAdmin && router.pathname.includes('admin')) {
    isAdminPage = true
  }

  return (
    <div>
      <TheNavBar />
      <div
        className={`h-[calc(100vh_-_64px)] overflow-auto bg-page-bg ${
          isAdminPage ? 'grid grid-cols-[200px_auto]' : ''
        }`}
      >
        <div
          className={`w-full ${isAdminPage ? 'h-[calc(100vh_-_64px)]' : ''} ${
            isAdminPage ? 'col-start-2 row-start-1 px-6 pt-6' : ''
          }`}
        >
          {children}
        </div>
        {isAdminPage ? <TheSideBar /> : <TheFooter />}
      </div>
      <MyToastMsg />
    </div>
  )
}

export default TheLayout
