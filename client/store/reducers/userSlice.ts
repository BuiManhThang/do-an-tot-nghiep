import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DataSignIn, User, UserWithToken, DataRegister } from '@/types/user'
import baseApi from '@/apis/baseApi'
import { RequestStatus } from '@/enum/requestStatus'

// Define a type for the slice state
interface UserState {
  userInfo?: User
  status: RequestStatus
}

// Define the initial state using that type
const initialState: UserState = {
  userInfo: undefined,
  status: RequestStatus.Success,
}

export const register = createAsyncThunk(
  'user/register',
  async (data: DataRegister, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('users/register', data)
      const userData: UserWithToken = response.data
      localStorage.setItem('token', userData.token)
      return userData.user
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const signIn = createAsyncThunk(
  'user/signIn',
  async (data: DataSignIn, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('users/sign-in', data)
      const userData: UserWithToken = response.data
      localStorage.setItem('token', userData.token)
      return userData.user
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async () => {
  const response = await baseApi.get('users/current-user')
  const userData: User = response.data
  return userData
})

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    signOut: (state) => {
      state.userInfo = undefined
      localStorage.removeItem('token')
    },
  },
  extraReducers(builder) {
    builder.addCase(signIn.pending, (state) => {
      state.status = RequestStatus.Pending
    })
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.status = RequestStatus.Success
      state.userInfo = action.payload
    })
    builder.addCase(signIn.rejected, (state) => {
      state.status = RequestStatus.Failed
    })
    builder.addCase(register.pending, (state) => {
      state.status = RequestStatus.Pending
    })
    builder.addCase(register.fulfilled, (state, action) => {
      state.status = RequestStatus.Success
      state.userInfo = action.payload
    })
    builder.addCase(register.rejected, (state) => {
      state.status = RequestStatus.Failed
    })
    builder.addCase(getCurrentUser.pending, (state) => {
      state.status = RequestStatus.Pending
    })
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.status = RequestStatus.Success
      state.userInfo = action.payload
    })
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.status = RequestStatus.Failed
    })
  },
})

export const { signOut } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export default userSlice.reducer
