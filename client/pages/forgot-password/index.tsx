import React, { useState } from 'react'
import MyButton from '@/components/my-button/MyButton'
import MyTextField from '@/components/my-text-field/MyTextField'
import Link from 'next/link'
import Head from 'next/head'
import { useValidate, Validator, ValidateRule } from '@/hooks/validateHook'
import baseApi from '@/apis/baseApi'
import { AxiosError, isAxiosError } from 'axios'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'

const VALIDATORS: Validator[] = [
  {
    field: 'email',
    name: 'Địa chỉ email',
    rules: [ValidateRule.Required, ValidateRule.Email],
  },
]

type ResetPasswordInput = {
  email: string
}

const ForgotPasswordPage = () => {
  const { openToast } = useToastMsg()
  const { error, isValidated, validate } = useValidate(VALIDATORS)
  const [isSend, setIsSend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<ResetPasswordInput>({
    email: '',
  })

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setData((prev: ResetPasswordInput) => {
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
    if (!validate(data)) {
      return
    }
    setIsLoading(true)
    try {
      await baseApi.post('users/mail-reset-password', {
        email: data.email,
      })
      setIsSend(true)
    } catch (err: AxiosError | any) {
      if (isAxiosError(err)) {
        if (err.response?.status === 404) {
          openToast({
            msg: 'Email không tồn tại trong hệ thống',
            type: ToastMsgType.Danger,
          })
        }
      }
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Đặt lại mật khẩu</title>
      </Head>
      <div className="w-4/5 flex lg:w-3/5 xl:w-1/2 rounded-xl shadow-custom overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="hidden lg:flex flex-col justify-center w-2/5 py-10 px-6 bg-[rgba(255,255,255,0.2)] backdrop-blur-sm text-black">
          <div className="text-2xl font-bold">Chào mừng đến với tạp hóa Hòa Phát</div>
          <div className="h-2 bg-primary rounded-md w-24  mt-5 mb-4"></div>
          <div className="pb-10">Đặt lại mật khẩu tài khoản của bạn.</div>
        </div>
        <div className="flex flex-col items-center py-10 px-6 w-full lg:w-3/5 bg-white">
          <div className="lg:hidden text-2xl font-bold mb-10 text-black">
            Chào mừng đến với tạp hóa Hòa Phát
          </div>
          <div className="hidden lg:block text-2xl font-bold mb-10 text-black">
            Đặt lại mật khẩu
          </div>
          {isSend ? (
            <>
              <div>Chúng tôi đã gửi email đặt lại mật khẩu đến địa chỉ email của bạn</div>
              <Link href={'/sign-in'} className="font-medium text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </>
          ) : (
            <>
              <form
                className="flex flex-col items-center w-full"
                noValidate
                onSubmit={handleSubmit}
              >
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChangeInput(e, 'email')
                    }
                  />
                </div>
                <div className="mt-10 w-full">
                  <MyButton
                    text="Gửi email"
                    style={{
                      width: '100%',
                      height: '48px',
                      fontSize: '18px',
                    }}
                    isLoading={isLoading}
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
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
