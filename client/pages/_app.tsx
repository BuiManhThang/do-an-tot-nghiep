import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import TheLayout from '@/components/layout/TheLayout'
import { Provider } from 'react-redux'
import store from '../store/store'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <TheLayout>
        <Component {...pageProps} />
      </TheLayout>
    </Provider>
  )
}
