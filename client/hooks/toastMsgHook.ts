import { useAppDispatch, useAppSelector } from './reduxHook'
import { openToastMsg, closeToastMsg } from '@/store/reducers/toastMsgSlice'
import { ToastMsgType } from '@/enum/toastMsg'

export const useToastMsg = () => {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((state) => state.toastMsg.isActive)
  const msg = useAppSelector((state) => state.toastMsg.msg)
  const type = useAppSelector((state) => state.toastMsg.type)

  const openToast = ({ msg, type }: { msg: string; type: ToastMsgType }) => {
    dispatch(openToastMsg({ msg, type }))
  }

  const closeToast = () => {
    dispatch(closeToastMsg())
  }

  return { isActive, msg, type, openToast, closeToast }
}
