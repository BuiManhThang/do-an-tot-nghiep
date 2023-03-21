import React, { useEffect, useState } from 'react'
import MyButton from '@/components/my-button/MyButton'
import MyTextField from '@/components/my-text-field/MyTextField'
import MyPasswordField from '@/components/my-password-field/MyPasswordField'
import Link from 'next/link'
import Head from 'next/head'
import { useValidate, Validator, ValidateRule } from '@/hooks/validateHook'
import { DataSignIn } from '@/types/user'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { signIn } from '@/store/reducers/userSlice'
import { useRouter } from 'next/router'
import { RequestStatus } from '@/enum/requestStatus'
import { AxiosError, isAxiosError } from 'axios'
import { ClientError, RequestError } from '@/types/apiResult'
import { handleClientError } from '@/common/errorHandler'

const VALIDATORS: Validator[] = [
  {
    field: 'email',
    name: 'Địa chỉ email',
    rules: [ValidateRule.Required, ValidateRule.Email],
  },
  {
    field: 'password',
    name: 'Mật khẩu',
    rules: [ValidateRule.Required, ValidateRule.Password],
  },
]

const SignInPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const requestStatus = useAppSelector((state) => state.user.status)
  const { error, isValidated, validate, setError } = useValidate(VALIDATORS)

  const [data, setData] = useState<DataSignIn>({
    email: '',
    password: '',
  })

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setData((prev: DataSignIn) => {
      let newData = {
        ...prev,
        [field]: e.target.value,
      }
      if (isValidated) {
        validate(newData)
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (requestStatus === RequestStatus.Pending) {
      return
    }
    if (!validate(data)) {
      return
    }
    try {
      const signInResult = await dispatch(signIn(data)).unwrap()
      if (signInResult?.isAdmin) {
        router.push('/admin')
        return
      }
      router.push('/')
    } catch (err: AxiosError | any) {
      if (isAxiosError(err)) {
        setError(handleClientError(err))
      }
    }
  }

  return (
    <>
      <Head>
        <title>Đăng nhập</title>
      </Head>
      <div className="w-4/5 flex lg:w-3/5 xl:w-1/2 rounded-xl shadow-custom overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="hidden lg:flex flex-col justify-center w-2/5 py-10 px-6 bg-[rgba(255,255,255,0.2)] backdrop-blur-sm text-black">
          <div className="text-2xl font-bold">Chào mừng đến với tạp hóa Hòa Phát</div>
          <div className="h-2 bg-primary rounded-md w-24  mt-5 mb-4"></div>
          <div className="pb-10">Đăng nhập để nâng cao trải nghiệm của bạn.</div>
        </div>
        <div className="flex flex-col items-center py-10 px-6 w-full lg:w-3/5 bg-white">
          <div className="lg:hidden text-2xl font-bold mb-10 text-black">
            Chào mừng đến với tạp hóa Hòa Phát
          </div>
          <div className="hidden lg:block text-2xl font-bold mb-10 text-black">
            Thông tin đăng nhập
          </div>
          <form className="flex flex-col items-center w-full" noValidate onSubmit={handleSubmit}>
            <div className="w-full">
              <MyTextField
                id="email"
                name="email"
                label="Địa chỉ email"
                inputStyle={{
                  height: '48px',
                }}
                type="email"
                error={error.email}
                value={data.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeInput(e, 'email')}
              />
            </div>
            <div className="w-full mt-6">
              <MyPasswordField
                id="password"
                name="password"
                label="Mật khẩu"
                inputStyle={{
                  height: '48px',
                }}
                error={error.password}
                value={data.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChangeInput(e, 'password')
                }
              />
            </div>
            <div className="mt-10 w-full">
              <MyButton
                text="Đăng nhập"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '18px',
                }}
                isLoading={requestStatus === RequestStatus.Pending}
              />
            </div>
          </form>

          <div className="w-full mt-10">
            <div className="w-full text-center">
              <span>Bạn chưa có tài khoản? </span>
              <Link href={'/register'} className="font-medium text-primary hover:underline">
                Đăng ký.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignInPage
