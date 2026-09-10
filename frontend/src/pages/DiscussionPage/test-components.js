// 简单的组件测试文件
// 用于验证DiscussionPage组件的正确导入和结构

import React from 'react'
import ReactDOM from 'react-dom'

// 导入所有必要的组件
import { DiscussionPage } from './DiscussionPage'
import { DiscussionHeader } from './components/DiscussionHeader/DiscussionHeader'
import { DiscussionThread } from './components/DiscussionThread/DiscussionThread'
import { MessageList } from './components/MessageList/MessageList'
import { MessageItem } from './components/MessageItem/MessageItem'
import { MessageInput } from './components/MessageInput/MessageInput'
import { VotingSystem } from './components/VotingSystem/VotingSystem'
import { ForkDialog } from './components/ForkDialog/ForkDialog'
import { DiscussionActions } from './components/DiscussionActions/DiscussionActions'

// 导入所有hooks
import { useDiscussionState } from './hooks/useDiscussionState'
import { useMessages } from './hooks/useMessages'
import { useVoting } from './hooks/useVoting'
import { useForkDiscussion } from './hooks/useForkDiscussion'
import { useCreateDiscussion } from './hooks/useCreateDiscussion'

console.log('DiscussionPage components imported successfully')

// 验证组件导出
const components = [
  'DiscussionPage',
  'DiscussionHeader',
  'DiscussionThread', 
  'MessageList',
  'MessageItem',
  'MessageInput',
  'VotingSystem',
  'ForkDialog',
  'DiscussionActions'
]

components.forEach(componentName => {
  const component = eval(componentName) // 动态获取组件
  if (component && typeof component === 'function') {
    console.log(`✓ ${componentName} exported successfully`)
  } else {
    console.log(`✗ ${componentName} export failed`)
  }
})

// 验证hooks导出
const hooks = [
  'useDiscussionState',
  'useMessages', 
  'useVoting',
  'useForkDiscussion',
  'useCreateDiscussion'
]

hooks.forEach(hookName => {
  const hook = eval(hookName)
  if (hook && typeof hook === 'function') {
    console.log(`✓ ${hookName} exported successfully`)
  } else {
    console.log(`✗ ${hookName} export failed`)
  }
})

console.log('Component testing completed')