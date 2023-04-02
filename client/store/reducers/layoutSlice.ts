import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface LayoutState {
  isTriggerScroll: boolean
}

// Define the initial state using that type
const initialState: LayoutState = {
  isTriggerScroll: false,
}

export const layoutSlice = createSlice({
  name: 'layout',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    triggerScroll: (state) => {
      state.isTriggerScroll = !state.isTriggerScroll
    },
  },
})

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export const { triggerScroll } = layoutSlice.actions

export default layoutSlice.reducer
