import { createSlice } from '@reduxjs/toolkit'
import { ToastMsgType } from '@/enum/toastMsg'

// Define a type for the slice state
interface ToastMsgState {
  isActive: boolean
  type: ToastMsgType
  msg: string
}

// Define the initial state using that type
const initialState: ToastMsgState = {
  isActive: false,
  type: ToastMsgType.Info,
  msg: 'hehe',
}

export const toastMsgSlice = createSlice({
  name: 'toastMsg',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    openToastMsg: (state, { payload }) => {
      const data: { msg: string; type: ToastMsgType } = payload
      state.isActive = true
      state.msg = data.msg
      state.type = data.type
    },
    closeToastMsg: (state) => {
      state.isActive = false
    },
  },
})

export const { openToastMsg, closeToastMsg } = toastMsgSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export default toastMsgSlice.reducer
