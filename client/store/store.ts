import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/userSlice'
import toastMsgReducer from './reducers/toastMsgSlice'
import navbarReducer from './reducers/navbarSlice'
import cartReducer from './reducers/cartSlice'
import layoutReducer from './reducers/layoutSlice'
import viewHistoryReducer from './reducers/viewHistorySlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    toastMsg: toastMsgReducer,
    navbar: navbarReducer,
    cart: cartReducer,
    layout: layoutReducer,
    viewHistory: viewHistoryReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
