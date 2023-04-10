import { createSlice } from '@reduxjs/toolkit'
import baseApi from '@/apis/baseApi'
import { ProductInCart } from '@/types/user'
import { RequestStatus } from '@/enum/requestStatus'

// Define a type for the slice state
interface CartState {
  products: ProductInCart[]
  status: RequestStatus
}

// Define the initial state using that type
const initialState: CartState = {
  products: [],
  status: RequestStatus.Pending,
}

export const cartSlice = createSlice({
  name: 'cart',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addToCart: (state, context) => {
      const addedProduct: ProductInCart = context.payload
      const newProductsInCart: ProductInCart[] = [...state.products]
      const foundedInCart = newProductsInCart.find((product) => product.id === addedProduct.id)
      if (foundedInCart) {
        foundedInCart.amount += addedProduct.amount
      } else {
        newProductsInCart.push(addedProduct)
        const userId = localStorage.getItem('userId')
        if (userId) {
          try {
            baseApi.put(`users/${userId}`, {
              cart: newProductsInCart,
            })
          } catch (error) {
            console.log(error)
          }
        }
      }
      state.products = newProductsInCart
      localStorage.setItem('cart', JSON.stringify(state.products))
    },
    minusFromCart: (state, context) => {
      const addedProduct: ProductInCart = context.payload
      const newProductsInCart: ProductInCart[] = [...state.products]
      const foundedInCart = newProductsInCart.find((product) => product.id === addedProduct.id)
      if (foundedInCart) {
        foundedInCart.amount -= addedProduct.amount
      }
      state.products = newProductsInCart
      localStorage.setItem('cart', JSON.stringify(state.products))
    },
    removeFromCart: (state, context) => {
      const addedProduct: ProductInCart = context.payload
      const newProductsInCart: ProductInCart[] = state.products.filter(
        (product) => product.id !== addedProduct.id
      )
      state.products = newProductsInCart
      localStorage.setItem('cart', JSON.stringify(state.products))
      const userId = localStorage.getItem('userId')
      if (userId) {
        try {
          baseApi.put(`users/${userId}`, {
            cart: newProductsInCart,
          })
        } catch (error) {
          console.log(error)
        }
      }
    },
    initCart: (state, context) => {
      const products: ProductInCart[] = Array.isArray(context.payload) ? context.payload : []
      let productsLocal: ProductInCart[] = []
      try {
        const cartString = localStorage.getItem('cart')
        if (cartString) {
          productsLocal = JSON.parse(cartString)
        }
      } catch (error) {
        productsLocal = []
      }
      if (products.length === 0) {
        state.products = productsLocal
        state.status = RequestStatus.Success
        return
      }
      const newProducts = products.map((product) => {
        const productLocal = productsLocal.find((p) => p.id === product.id)
        let amount = 1
        if (productLocal) {
          amount = productLocal.amount
        }
        return {
          ...product,
          amount,
        }
      })
      state.products = newProducts
      state.status = RequestStatus.Success
    },
    removeCart: (state) => {
      state.products = []
      localStorage.removeItem('cart')
    },
  },
})

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export const { addToCart, minusFromCart, removeFromCart, initCart, removeCart } = cartSlice.actions

export default cartSlice.reducer
