import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Category } from '@/types/category'
import baseApi from '@/apis/baseApi'
import { PagingResult } from '@/types/paging'

// Define a type for the slice state
interface NavbarState {
  categories: Category[]
}

// Define the initial state using that type
const initialState: NavbarState = {
  categories: [],
}

export const getCategories = createAsyncThunk('navbar/getCategories', async () => {
  const res = await baseApi.get('categories/paging', {
    sort: 'products',
    direction: 'desc',
  })
  const pagingResult: PagingResult = res.data
  const categories: Category[] = pagingResult.data
  return categories
})

export const navbarSlice = createSlice({
  name: 'toastMsg',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.categories = action.payload
    })
    builder.addCase(getCategories.rejected, (state) => {
      state.categories = []
    })
  },
})

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export default navbarSlice.reducer
