import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import baseApi from '@/apis/baseApi'
import { ProductInCart } from '@/types/user'
import { RequestStatus } from '@/enum/requestStatus'
import { Product } from '@/types/product'
import { PagingResult } from '@/types/paging'
import { ViewHistory } from '@/types/viewHistory'

// Define a type for the slice state
interface ViewHistoryState {
  products: Product[]
  productIds: string[]
  status: RequestStatus
}

// Define the initial state using that type
const initialState: ViewHistoryState = {
  products: [],
  productIds: [],
  status: RequestStatus.Pending,
}

const getViewedProductsFunc = async (userId: string): Promise<Product[]> => {
  const res = await baseApi.get('viewHistory/paging', {
    userId,
  })
  const pagingResult: PagingResult = res.data
  const viewHistory: ViewHistory[] = pagingResult.data
  const products = viewHistory.map((v) => v.product)
  return products
}

const handleViewHistory = async (productId: string, userId: string | undefined) => {
  let viewedProductsRes: Product[] = []
  if (userId) {
    viewedProductsRes = await getViewedProductsFunc(userId)
  } else {
    const productsInLocal = localStorage.getItem('viewHistory')
    viewedProductsRes = productsInLocal ? JSON.parse(productsInLocal) : []
  }
  const productIds: string[] = viewedProductsRes.map((p) => p.id)
  if (!viewedProductsRes.find((p) => p.id === productId)) {
    if (userId)
      baseApi.post('viewHistory/user', {
        productId: productId,
      })

    productIds.push(productId)
    if (productIds.length > 4) {
      productIds.shift()
    }
  }
  return { products: viewedProductsRes, productIds }
}

export const getAndSetViewHistory = createAsyncThunk(
  'viewHistory/getAndSetViewHistory',
  async (data: { userId: string | undefined; productId: string }, { rejectWithValue }) => {
    try {
      const { products, productIds }: { products: Product[]; productIds: string[] } =
        await handleViewHistory(data.productId, data.userId)
      localStorage.setItem('viewHistory', JSON.stringify(products))
      return { products, productIds }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const viewHistorySlice = createSlice({
  name: 'viewHistory',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setViewHistory: (state, action) => {
      state.products = action.payload
    },
    initViewHistory: (state, action) => {
      const viewHistory: ViewHistory[] = action.payload ? action.payload : []
      let products = viewHistory.map((v) => v.product)
      const productsInLocal = localStorage.getItem('viewHistory')
      if (!products.length) {
        const productsInLocalJson = productsInLocal ? JSON.parse(productsInLocal) : []
        products = [...productsInLocalJson]
      }
      state.products = products
    },
  },
  extraReducers(builder) {
    builder.addCase(getAndSetViewHistory.fulfilled, (state, action) => {
      state.products = action.payload.products
      state.productIds = action.payload.productIds
    })
    builder.addCase(getAndSetViewHistory.rejected, (state) => {
      state.products = []
      state.productIds = []
    })
  },
})

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export const { setViewHistory, initViewHistory } = viewHistorySlice.actions

export default viewHistorySlice.reducer
