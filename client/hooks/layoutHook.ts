import { triggerScroll } from '@/store/reducers/layoutSlice'
import { useAppDispatch, useAppSelector } from './reduxHook'

export const useLayout = () => {
  const dispatch = useAppDispatch()
  const isTriggerScroll = useAppSelector((state) => state.layout.isTriggerScroll)

  const scrollToTop = () => {
    dispatch(triggerScroll())
  }

  return {
    isTriggerScroll,
    scrollToTop,
  }
}
