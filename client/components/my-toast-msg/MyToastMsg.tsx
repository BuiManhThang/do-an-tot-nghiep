import React, { useEffect, useRef } from 'react'
import { ToastMsgType } from '@/enum/toastMsg'
import { useToastMsg } from '@/hooks/toastMsgHook'

const MyToastMsg = () => {
  const { isActive, msg, type, closeToast } = useToastMsg()
  const timeoutFunc = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timeoutFunc.current)
    if (isActive) {
      timeoutFunc.current = setTimeout(() => {
        closeToast()
      }, 5000)
    }

    return () => {
      clearTimeout(timeoutFunc.current)
    }
  }, [isActive, closeToast])

  let icon = <i className="fa-solid fa-circle-info"></i>
  let colorBorder = 'border-info'
  let colorText = 'text-info'
  if (type === ToastMsgType.Success) {
    icon = <i className="fa-solid fa-circle-check"></i>
    colorBorder = 'border-success'
    colorText = 'text-success'
  } else if (type === ToastMsgType.Danger) {
    icon = <i className="fa-solid fa-circle-xmark"></i>
    colorBorder = 'border-danger'
    colorText = 'text-danger'
  } else if (type === ToastMsgType.Warn) {
    icon = <i className="fa-solid fa-circle-exclamation"></i>
    colorBorder = 'border-warn'
    colorText = 'text-warn'
  }

  return (
    <div
      className={`fixed top-16 z-50 flex items-start bg-white max-w-[460px] pl-4 pr-4 py-4 shadow-custom rounded-md border-l-4 transition-all duration-300 ${
        isActive ? 'right-6 opacity-100' : '-right-[460px] opacity-0'
      } ${colorBorder}`}
    >
      <div
        className={`w-6 h-6 text-xl leading-none flex items-center justify-center mr-4 ${colorText}`}
      >
        {icon}
      </div>
      <div>{msg}</div>
      <div
        className={`w-6 h-6 ml-4 leading-none flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer text-gray-700`}
        onClick={closeToast}
      >
        <i className="fa-solid fa-xmark"></i>
      </div>
    </div>
  )
}

export default MyToastMsg
