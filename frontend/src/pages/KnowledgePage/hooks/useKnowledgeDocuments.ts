import { useState, useCallback, useEffect } from 'react'
import { knowledgeApi } from '@api/index'
// 知识库文档列表管理 hook（知识库页面专属）
// 单一职责：管理文档列表的筛选（话题、统计、删除、入库）
// 文档数据由 DocumentList 组件通过后端 API 获取
export const useKnowledgeDocuments = () => {
  const [topics, setTopics] = useState([]) // 模拟话题列表
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalTopics: 0,
    weeklyNew: 0
  }) // 模拟统计信息
  const [documentInfo, setDocumentInfo] = useState({
    documents: [],
    totalPages: 0,
    totalCount: 0,
  })
  const [selectedTopic, setSelectedTopic] = useState(null)
  const pageSize = 10

  // 获取文档数据的回调函数
  const fetchDataCallback = useCallback(async (pageNum) => {
    try {
      const response = await knowledgeApi.docs({
        topic: selectedTopic,
        pageNum,
        pageSize
      })

      setDocumentInfo({
        documents: response.knowledge_list,
        totalCount: response.total,
        totalPages: Math.ceil(response.total / pageSize) || 0,
      })
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      setDocumentInfo({
        documents: [],
        totalPages: 0,
        totalCount: 0,
      })
    }
  }, [selectedTopic, pageSize])

  // 获取统计信息
  const fetchDocStats = async () => {
    try {
      const response = await knowledgeApi.stats()

      setStats({
        totalDocs: response.knowledge_total,
        totalTopics: response.tag_total,
        weeklyNew: response.weekly_knowledge_total
      })
    } catch (error) {
      console.error('Failed to fetch document stats:', error)
      setStats({
        totalDocs: 0,
        totalTopics: 0,
        weeklyNew: 0
      })
    }
  }
  // 获取统计信息
  const fetchHotTopics = async () => {
    try {
      const response = await knowledgeApi.hotTopics()

      setTopics(response)
    } catch (error) {
      console.error('Failed to fetch document stats:', error)
      setTopics([])
    }
  }

  useEffect(() => {
    Promise.all([fetchDocStats(), fetchHotTopics()]).catch((error)=>console.log("Failed to load knowledge: ",error))
  }, [])

  // 删除文档
  const deleteDocument = async (id) => {
    try {
      const response = await fetch(`/api/v1/knowledge/docs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        return true
      }
      throw new Error('删除失败')
    } catch (error) {
      console.error('Failed to delete document:', error)
      throw error
    }
  }

  // 按话题筛选（再次点击同话题取消）
  const filterByTopic = (topic) => {
    setSelectedTopic((prev) => (prev === topic ? null : topic))
  }


  return {
    topics,
    stats,
    selectedTopic,
    documentInfo,
    fetchDataCallback,
    deleteDocument,
    filterByTopic,

  }
}
