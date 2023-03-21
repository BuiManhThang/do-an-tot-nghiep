import axios, { AxiosInstance } from 'axios'

class BaseApi {
  httpClient: AxiosInstance
  baseURL?: string
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_ROOT_URL
    this.httpClient = axios.create({
      baseURL: this.baseURL,
    })
  }

  get = async (url: string, params?: any) => {
    const token = localStorage.getItem('token')
    return this.httpClient.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      params,
    })
  }

  post = async (url: string, data: any) => {
    const token = localStorage.getItem('token')
    return this.httpClient.post(url, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
  }

  put = async (url: string, data: any) => {
    const token = localStorage.getItem('token')
    return this.httpClient.put(url, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
  }

  delete = async (url: string, params?: any) => {
    const token = localStorage.getItem('token')
    return this.httpClient.delete(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      params,
    })
  }
}

const baseApi = new BaseApi()
export default baseApi
