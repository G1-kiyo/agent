import { useState } from 'react'
import { knowledgeApi } from '@api/index'

// 文档上传 hook（知识库页面专属）
// 单一职责：管理上传 Modal 状态、进度轮询、AI 元信息提取与批量提交
// 与文档列表解耦：上传成功后通过 onUploaded 回调把新文档交还列表 hook 管理
export const useDocumentUpload = ({ onUploaded }: { onUploaded?: (docs: any[]) => void } = {}) => {
  // 上传 Modal 开关
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  // 上传进度（后端 /progress 轮询返回）
  const [uploadProgress, setUploadProgress] = useState({
    exec_name: '待开始',
    doc_index: '-',
    progress: 0
  })
  const [isUploading, setIsUploading] = useState(false)
  // AI 提取中（hook 级标记，DocumentUploader 内部另有逐项状态）
  const [isExtracting, setIsExtracting] = useState(false)

  // AI 提取文档元信息（mock）
  // TXT/MD：FileReader 读取真实内容 → 首行作标题、首段作摘要、关键词命中话题库
  // PDF：前端无法解析，返回 mockExtractResult.pdf 模板
  const extractDocumentMeta = async (file) => {
    setIsExtracting(true)
    // mock：模拟 AI 解析延迟
    // 构造formdata，添加file，调用后端接口,拿到提取的json内容，赋值
    /*
    const formData = new FormData()
    formData.append("file", file)
    const extracted_text = await knowledgeApi.ai_extract_text(formData)
    setIsExtracting(false)
    return extracted_text
    */
     
    // 使用mock数据替代真实API调用
    setIsExtracting(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟AI解析延迟
    
    // 返回mock数据
    const mockData = {
      title: "Vite + Docker 开发环境配置问题总结",
      summary: "本文总结了 Vite 在 Docker 开发环境中的配置问题，分析了端口监听错误和入口文件缺失的原因，并提供了详细的配置修复方案与调试步骤。",
      tags: ["Vite", "Docker", "开发环境", "前端配置", "容器化"],
      content_type: file.type || "text/plain",
      file_size: file.size,
      file_name: file.name
    }
    
    setIsExtracting(false)
    return mockData

  }

  // 创建定时轮询任务（轮询后端 /progress）
  const trackProgress = (batchId) => {
    let timer = setInterval(async () => {
      try {
        const progressInfo = await knowledgeApi.progress(batchId)
        setUploadProgress(progressInfo)
        // 到达 100% 清除定时器
        if (progressInfo?.is_last && progressInfo?.progress >= 100) {
          clearInterval(timer)
          timer = null
          setIsUploading(false)
          setIsUploaderOpen(false)
        }
      } catch (error) {
        clearInterval(timer)
        timer = null
        setIsUploading(false)
        throw new Error(error.message || "Track progress error")
      }

    }, 3000)
  }

  // 重置进度
  const resetProgress = () => {
    setUploadProgress({ exec_name: '待开始', doc_index: '-', progress: 0 })
  }

  // 提交上传任务到后端
  const submitUploadFiles = async (fileItems) => {
    const formData = new FormData()
    for (const fileItem of fileItems) {
      const copyItem = { ...fileItem }
      formData.append('file_list', fileItem.file)
      delete copyItem.file
      delete copyItem.id
      formData.append('metadata_list', JSON.stringify(copyItem))
    }

    const data = await knowledgeApi.save_to_knowledge_base(formData)
    trackProgress(data.batch_id)
  }

  // 批量上传文档
  // fileItems: [{ file, title, summary, tags }]（来自 DocumentUploader 提取结果）
  const uploadDocuments = async (fileItems) => {
    console.log("fileItems>>", fileItems)
    if (!fileItems?.length) return false

    try {
      setIsUploading(true)
      resetProgress()

      await submitUploadFiles(fileItems)

      // 逐个入库，通过 onUploaded 回调交还列表 hook
      const newDocs = []
      for (let i = 0; i < fileItems.length; i++) {
        const item = fileItems[i]
        const tags = typeof item.tags === 'string'
          ? item.tags.split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean)
          : (item.tags || [])
        newDocs.push({
          id: `doc-${Date.now()}-${i}`,
          title: item.title?.trim() || item.file.name.replace(/\.[^.]+$/, ''),
          summary: item.summary || '',
          source: '文档上传',
          sourceUrl: '',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          tags: tags.length ? tags : ['未分类']
        })
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      onUploaded?.(newDocs)
    } catch (error) {
      console.log("Failed to upload documents: ", error)
      setIsUploading(false)
    } 



    return true 
  }

  // 单条上传兼容入口（内部转调批量上传）
  const uploadDocument = async (file, tags = []) => {
    return uploadDocuments([{ file, title: '', summary: '', tags }])
  }

  return {
    isUploaderOpen,
    setIsUploaderOpen,
    uploadProgress,
    isUploading,
    isExtracting,
    extractDocumentMeta,
    uploadDocuments,
    uploadDocument
  }
}
