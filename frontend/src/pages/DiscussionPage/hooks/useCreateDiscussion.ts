import { useState, useCallback } from 'react'

// 创建讨论 Hook（Discussion页面专属）
// 单一职责：管理新讨论的创建、表单状态、验证等
export const useCreateDiscussion = () => {
  // 表单数据
  const [createDiscussionForm, setCreateDiscussionForm] = useState({
    title: '',
    description: '',
    tags: [],
    isPublic: true,
    category: 'general'
  })

  // 表单错误
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  })

  // 提交状态
  const [submitting, setIsSubmitting] = useState(false)

  // 错误状态
  const [error, setError] = useState(null)

  // 预设标签选项
  const tagOptions = [
    '#AI技术', '#行业趋势', '#未来发展', '#监管政策', 
    '#商业应用', '技术突破', '#投资分析', '#风险评估',
    '#教育应用', '#医疗应用', '#金融应用', '#制造业应用'
  ]

  // 分类选项
  const categoryOptions = [
    { value: 'general', label: '一般讨论' },
    { value: 'technology', label: '技术讨论' },
    { value: 'business', label: '商业讨论' },
    { value: 'policy', label: '政策讨论' },
    { value: 'investment', label: '投资讨论' }
  ]

  // 处理创建讨论
  const handleCreateDiscussion = useCallback(async (onSuccess, onError) => {
    // 验证表单
    const newErrors = {
      title: '',
      description: ''
    }

    if (!createDiscussionForm.title.trim()) {
      newErrors.title = '请输入讨论标题'
    } else if (createDiscussionForm.title.length < 5) {
      newErrors.title = '标题至少需要5个字符'
    } else if (createDiscussionForm.title.length > 100) {
      newErrors.title = '标题不能超过100个字符'
    }

    if (!createDiscussionForm.description.trim()) {
      newErrors.description = '请输入讨论描述'
    } else if (createDiscussionForm.description.length < 20) {
      newErrors.description = '描述至少需要20个字符'
    } else if (createDiscussionForm.description.length > 500) {
      newErrors.description = '描述不能超过500个字符'
    }

    setErrors(newErrors)
    
    if (!newErrors.title && !newErrors.description) {
      setIsSubmitting(true)
      setError(null)
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))

        const newDiscussion = {
          id: `topic-${Date.now()}`,
          title: createDiscussionForm.title,
          description: createDiscussionForm.description,
          tags: createDiscussionForm.tags,
          category: createDiscussionForm.category,
          creator: '当前用户',
          createdAt: new Date().toISOString(),
          isPublic: createDiscussionForm.isPublic,
          messageCount: 0,
          participantCount: 1
        }

        // 成功回调
        onSuccess(newDiscussion)
        
        // 重置表单
        resetForm()
        
      } catch (err) {
        const errorMessage = err.message || '创建讨论失败'
        setError(errorMessage)
        onError(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      onError('请检查表单信息')
    }
  }, [createDiscussionForm])

  // 处理表单变更
  const handleChange = useCallback((field, value) => {
    setCreateDiscussionForm(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  // 添加标签
  const handleAddTag = useCallback((tag) => {
    if (!createDiscussionForm.tags.includes(tag)) {
      setCreateDiscussionForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }, [createDiscussionForm.tags])

  // 移除标签
  const handleRemoveTag = useCallback((tag) => {
    setCreateDiscussionForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }, [])

  // 重置表单
  const resetForm = useCallback(() => {
    setCreateDiscussionForm({
      title: '',
      description: '',
      tags: [],
      isPublic: true,
      category: 'general'
    })
    setErrors({ title: '', description: '' })
    setError(null)
  }, [])

  // 获取推荐标签
  const getRecommendedTags = useCallback((text) => {
    if (!text) return []
    
    return tagOptions.filter(tag => 
      tag.toLowerCase().includes(text.toLowerCase()) && 
      !createDiscussionForm.tags.includes(tag)
    ).slice(0, 5)
  }, [createDiscussionForm.tags])

  return {
    createDiscussionForm,    // 表单数据
    errors,                  // 表单错误
    submitting,              // 提交状态
    error,                   // 错误状态
    tagOptions,              // 标签选项
    categoryOptions,         // 分类选项
    handleCreateDiscussion,  // 处理创建讨论
    handleChange,            // 处理表单变更
    handleAddTag,            // 添加标签
    handleRemoveTag,         // 移除标签
    resetForm,               // 重置表单
    getRecommendedTags      // 获取推荐标签
  }
}