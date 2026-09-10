import React, { useState, useRef } from 'react'
import './DocumentUploader.css'

// 职责：文档上传 Modal（受控弹窗，与列表解耦）
// mode: 'upload'（上传文件，支持批量，上限 MAX_UPLOAD_COUNT） | 'save'（保存检索结果，无文件选择）
export const MAX_UPLOAD_COUNT = 10

export const DocumentUploader = ({
  isOpen,
  mode = 'upload',
  uploadProgress,
  savedFiles,
  isUploading,
  onUpload,          // mode='upload' 批量上传：(fileItems) => Promise
  onExtract,         // mode='upload' AI 提取：(file) => Promise<{title, summary, tags}>
  onSave,
  onClose
}) => {
  const fileInputRef = useRef(null)

  // 批量上传：文件项列表 [{id, file, status, title, summary, tags, error}]
  const [fileItems, setFileItems] = useState([])
  const [dragOver, setDragOver] = useState(false)
  // mode='save' 表单

  // 生成文件项 id
  const genId = (file) => `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  // 重置内部状态当弹窗重新打开（必须在提前返回之前调用，保证 hooks 顺序一致）
  React.useEffect(() => {
    const initData = async () => {
      if (isOpen) {
        setFileItems([])
        console.log("save",mode,savedFiles)
        if (mode === "save" && savedFiles?.length > 0) {
          
          await handleFiles(savedFiles)
        }
      }
    }
    initData()

  }, [isOpen, savedFiles?.length])

  if (!isOpen) return null

  // 触发单项 AI 提取
  const triggerExtract = async (itemId, file) => {
    setFileItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status: 'extracting', error: '' } : it))
    )
    try {
      const result = await onExtract(file)
      setFileItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
              ...it,
              status: 'done',
              title: result.title || it.file.name.replace(/\.[^.]+$/, ''),
              summary: result.summary || '',
              tags: result.tags || []
            }
            : it
        )
      )
    } catch (err) {
      console.log(err)
      setFileItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, status: 'error', error: 'AI 提取失败，可重试或手动填写' } : it
        )
      )
    }
  }

  // 合并新文件到列表（截断至 MAX_UPLOAD_COUNT）并逐项触发 AI 提取
  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList)
    if (!incoming.length) return

    const newItems = incoming.map((file) => ({
      id: genId(file),
      file,
      status: 'extracting',
      title: '',
      summary: '',
      tags: '',
      error: '',
      source: mode === "upload" ? "文档上传" : "查询录入",
      source_url: ""
    }))

    setFileItems((prev) => [...prev, ...newItems].slice(0, MAX_UPLOAD_COUNT))

    // 对每个新项触发 AI 提取（并发，互不阻塞）
    newItems.forEach((item) => {
      triggerExtract(item.id, item.file)
    })
  }

  const handleFileChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  // 删除单个文件项
  const removeFileItem = (id) => {
    setFileItems((prev) => prev.filter((it) => it.id !== id))
  }

  // 重新提取
  const retryExtract = (id) => {
    const item = fileItems.find((it) => it.id === id)
    if (item) triggerExtract(id, item.file)
  }

  // 更新文件项字段
  const updateFileItem = (id, field, value) => {
    setFileItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }


  const handleSubmit = async () => {
    const validItems = fileItems.filter((it) => it.title.trim() || it.file.name)
    if (!validItems.length) return
    await onUpload(validItems)
  }

  const remainingSlots = MAX_UPLOAD_COUNT - fileItems.length
  const allExtracting = fileItems.some((it) => it.status === 'extracting')

  return (
    <div className="uploader-overlay" onClick={onClose}>
      <div className="uploader-modal" onClick={(e) => e.stopPropagation()}>
        <div className="uploader-header">
          <h3>{mode === 'upload' ? '上传文档到知识库' : '保存到知识库'}</h3>
          <button className="uploader-close" onClick={onClose}>✕</button>
        </div>

        <div className="uploader-body">
          {mode === 'upload' && (
            <>
              <div
                className={`uploader-dropzone ${dragOver ? 'drag-over' : ''} ${remainingSlots <= 0 ? 'disabled' : ''}`}
                onClick={() => remainingSlots > 0 && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.md,.txt"
                  multiple
                  onChange={handleFileChange}
                  hidden
                />
                <div className="uploader-drop-hint">
                  <div className="uploader-drop-icon">⬆️</div>
                  <p>
                    {remainingSlots > 0
                      ? `拖拽文件到此处，或点击选择（还可添加 ${remainingSlots} 个）`
                      : '已达上传上限（10 个）'}
                  </p>
                  <p className="uploader-drop-formats">支持 PDF / Markdown / TXT · 最多 {MAX_UPLOAD_COUNT} 个</p>
                </div>
              </div>
            </>
          )}
          {fileItems.length > 0 && (
            <div className="uploader-file-list">
              {fileItems.map((item) => (
                <div key={item.id} className="uploader-file-item">
                  <div className="uploader-file-item-header">
                    <div className="uploader-file-info">
                      <span className="uploader-file-icon">📄</span>
                      <div>
                        <div className="uploader-file-name">{item.file.name}</div>
                        <div className="uploader-file-size">
                          {(item.file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      className="uploader-remove-btn"
                      onClick={() => removeFileItem(item.id)}
                      title="删除"
                    >✕</button>
                  </div>

                  {item.status === 'extracting' && (
                    <div className="uploader-extracting">
                      <span className="uploader-spinner" />
                      <span>AI 正在解析文档...</span>
                    </div>
                  )}

                  {(item.status === 'done' || item.status === 'error') && (
                    <div className="uploader-item-form">
                      <div className={`uploader-extract-status ${item.status === 'error' ? 'is-error' : 'is-done'}`}>
                        <span className="uploader-extract-status-text">
                          {item.status === 'done' ? '✓ AI 已提取，可重新执行' : `⚠ ${item.error}`}
                        </span>
                        <button className="uploader-retry-btn" onClick={() => retryExtract(item.id)}>
                          重新提取
                        </button>
                      </div>
                      <div className="uploader-field">
                        <label>标题</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateFileItem(item.id, 'title', e.target.value)}
                          placeholder="文档标题"
                          className="uploader-input"
                        />
                      </div>
                      <div className="uploader-field">
                        <label>摘要</label>
                        <textarea
                          value={item.summary}
                          onChange={(e) => updateFileItem(item.id, 'summary', e.target.value)}
                          placeholder="文档摘要"
                          className="uploader-input uploader-textarea"
                          rows={3}
                        />
                      </div>
                      <div className="uploader-field">
                        <label>话题标签（逗号分隔）</label>
                        <input
                          type="text"
                          value={item.tags}
                          onChange={(e) => updateFileItem(item.id, 'tags', e.target.value)}
                          placeholder="例如：大模型, 融资"
                          className="uploader-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}


          {isUploading && (
            <div className="uploader-progress">
              <div className="uploader-progress-bar">
                <div
                  className="uploader-progress-fill"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <span className="uploader-progress-text">第{uploadProgress.doc_index}份文件{uploadProgress.exec_name},进度{uploadProgress.progress}%</span>
            </div>
          )}
        </div>

        <div className="uploader-footer">
          <button className="secondary-btn" onClick={onClose}>取消</button>
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={!fileItems.length || allExtracting || isUploading}
          >
            {mode === 'upload'
              ? `上传入库${fileItems.length ? `（${fileItems.length}）` : ''}`
              : '确认保存'}
          </button>
        </div>
      </div>
    </div >
  )
}
