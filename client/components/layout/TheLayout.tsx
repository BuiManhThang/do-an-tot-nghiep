import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Background from '../../assets/images/sign-in/pexels-moose-photos-1037995.jpg'
import TheNavBar from './TheNavBar'
import { getCurrentUser } from '@/store/reducers/userSlice'
import { useAppDispatch } from '@/hooks/reduxHook'

type Props = {
  children?: React.ReactNode | React.ReactNode[]
}

const TheLayout = ({ children }: Props) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getCurrentUser())
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

  return (
    <div>
      <TheNavBar />
      {children}
    </div>
  )
}

export default TheLayout
