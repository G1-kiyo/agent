import { useState, useCallback } from 'react'

export const usePagination = ({ fetchDataCallback, totalPages, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)


  // 获取当前页数据
  const fetchCurrentPage = useCallback(async (pageNum = currentPage) => {
    if (!fetchDataCallback) return

    setIsLoading(true)
    try {
      await fetchDataCallback(pageNum)
    } finally {
      setIsLoading(false)
    }
  }, [fetchDataCallback, currentPage])

  // 更新页码
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  // 下一页
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }, [currentPage, totalPages])

  // 上一页
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }, [currentPage])

  // 重置到第一页
  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    isLoading,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    fetchCurrentPage
  }
}

