import baseApi from '@/apis/baseApi'
import { Category } from '@/types/category'
import { useEffect, useState } from 'react'

export function useCategory<T>(formatFunc?: (input: Category[]) => T[]) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formatCategories, setFormatCategories] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await baseApi.get('/categories')
        const resCategories: Category[] = res.data
        setCategories(resCategories)
        if (typeof formatFunc === 'function') {
          setFormatCategories(formatFunc(resCategories))
        }
      } catch (error) {
        console.log(error)
        setCategories([])
        setFormatCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    getCategories()
  }, [formatFunc])

  return {
    categories,
    isLoading,
    formatCategories,
  }
}
