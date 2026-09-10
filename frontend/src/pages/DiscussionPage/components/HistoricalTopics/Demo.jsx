import React, { useState } from 'react'
import { HistoricalTopics } from './HistoricalTopics'
import { mockTopics } from './mockData'

/**
 * 历史话题组件演示
 */
export const HistoricalTopicsDemo = () => {
  const [selectedTopic, setSelectedTopic] = useState(null)
  
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic)
    console.log('选中话题:', topic)
  }
  
  const handleCreateTopic = () => {
    console.log('创建新话题')
  }

  return (
    <div className="demo-container">
      <h1>历史话题组件演示</h1>
      <div className="demo-content">
        <HistoricalTopics 
          topics={mockTopics}
          onSelectTopic={handleTopicSelect}
          onCreateTopic={handleCreateTopic}
          currentTopicId={selectedTopic?.id}
        />
      </div>
      {selectedTopic && (
        <div className="selected-topic-info">
          <h3>当前选中的话题:</h3>
          <pre>{JSON.stringify(selectedTopic, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}