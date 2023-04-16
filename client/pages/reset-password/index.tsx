import React, { useEffect, useState } from 'react'
import MyButton from '@/components/my-button/MyButton'
import MyPasswordField from '@/components/my-password-field/MyPasswordField'
import Head from 'next/head'
import { useValidate, Validator, ValidateRule } from '@/hooks/validateHook'
import { useRouter } from 'next/router'
import baseApi from '@/apis/baseApi'
import { useToastMsg } from '@/hooks/toastMsgHook'
import { ToastMsgType } from '@/enum/toastMsg'

type ResetPasswordInput = {
  password: ''
  confirmPassword: ''
}

const ForgotPasswordPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { openToast } = useToastMsg()
  const [token, setToken] = useState('')
  const [data, setData] = useState<ResetPasswordInput>({
    password: '',
    confirmPassword: '',
  })

  const validators: Validator[] = [
    {
      field: 'password',
      name: 'Mật khẩu',
      rules: [ValidateRule.Required, ValidateRule.Password],
    },
    {
      field: 'confirmPassword',
      name: 'Xác nhận mật khẩu',
      rules: [ValidateRule.Required, ValidateRule.Custom],
      custom: (value: any, _: string, name: string) => {
        if (value !== data.password) {
          return `${name} phải trùng với mật khẩu`
        }
        return ''
      },
    },
  ]
  const { error, isValidated, validate } = useValidate(validators)

  useEffect(() => {
    if (typeof router.query.token === 'string') setToken(router.query.token)
  }, [router.query.token])

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
      await baseApi.post(
        'users/reset-password',
        {
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        token
      )
      router.push('/sign-in')
    } catch (err) {
      console.log(err)
      openToast({
        msg: 'Đặt lại mật khẩu thất bại',
        type: ToastMsgType.Danger,
      })
      setData({
        password: '',
        confirmPassword: '',
      })
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
          <div className="hidden lg:block text-2xl font-bold text-black">Đặt lại mật khẩu</div>
          <form className="flex flex-col items-center w-full" noValidate onSubmit={handleSubmit}>
            <div className="w-full mt-6">
              <MyPasswordField
                id="password"
                name="password"
                label="Mật khẩu"
                inputStyle={{
                  height: '48px',
                  fontSize: '18px',
                }}
                error={error.password}
                value={data.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChangeInput(e, 'password')
                }
              />
            </div>
            <div className="w-full mt-6">
              <MyPasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                inputStyle={{
                  height: '48px',
                  fontSize: '18px',
                }}
                error={error.confirmPassword}
                value={data.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChangeInput(e, 'confirmPassword')
                }
              />
            </div>
            <div className="mt-10 w-full">
              <MyButton
                text="Xác nhận"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '18px',
                }}
                isLoading={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
