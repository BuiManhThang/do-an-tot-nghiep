import baseApi from '@/apis/baseApi'

export const useFetch = () => {
  const get = async (url: string, params: any) => {
    const token = localStorage.getItem('token')
    return baseApi.httpClient.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    })
  }

  const post = async (url: string, data: any) => {
    const token = localStorage.getItem('token')
    return baseApi.httpClient.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const put = async (url: string, data: any) => {
    const token = localStorage.getItem('token')
    return baseApi.httpClient.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const remove = async (url: string, data: any) => {
    const token = localStorage.getItem('token')
    return baseApi.httpClient.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  return {
    get,
  }
}
