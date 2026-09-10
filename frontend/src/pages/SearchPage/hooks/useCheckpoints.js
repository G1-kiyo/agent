import { useRef, useState,useEffect } from 'react'
import NodeOperator from '../../../utils/nodeoperator'

// 检索检查点管理 hook（智能检索页面专属）
// 单一职责：维护检查点列表与选中态（追加、选中、重置、分叉）
// 与检索执行解耦：执行过程中通过 onCheckpoint 回调通知追加检查点
export const useCheckpoints = () => {
  const [checkpoints, setCheckpoints] = useState([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState({})
  const [latestCheckpoint, setLatestCheckpoint] = useState({})
  const nodeOperatorRef = useRef(null)

  useEffect(() => {
    nodeOperatorRef.cuurent = new NodeOperator(checkpoints)
  }, [checkpoints])
  const hasKey = (node, targetKey, newResult) => {
    const stack = [node]
    while (stack.length > 0) {
      const current = stack.pop();
      console.log("current", current)
      if (current.checkpointId === targetKey) {
        current.children.push(newResult)
        return true
      } else {
        stack.push(...current.children)
      }
    }
    return false
  }
  const addCheckpointToNodeList = (nodeList, targetKey, newResult) => {
    if (targetKey) {
      for (let node of nodeList) {
        if (hasKey(node, targetKey, newResult)) return;
      }
    }
    nodeList.push(newResult)
  }
  // 追加检查点（检索迭代时调用）
  const updateCheckpoint = (name, checkpointInfo) => {
    const { checkpoint_id, thread_id, parent, query } = checkpointInfo
    const newCheckpoint = {
      name,
      time: new Date().toLocaleString(),
      checkpointId: checkpoint_id,
      threadId: thread_id,
      parent,
      query,
      children: []
    }
    const buildCheckpoints = (nodeOperatorRef.current ?
      nodeOperatorRef.current.add(newCheckpoint, "parent.checkpoint_id", "checkpointId", "children") :
      checkpoints
    )

    console.log("checkpoints", checkpoints)
    setCheckpoints(buildCheckpoints)
    setLatestCheckpoint(newCheckpoint)
    return newCheckpoint
  }

  // 选中指定检查点  
  const selectCheckpoint = (checkpoint) => {
    setSelectedCheckpoint(checkpoint)
  }

  // 创建分叉讨论检查点
  const createFork = () => {
    const newCheckpoint = { name: '分叉讨论', time: '刚刚' }
    setCheckpoints((prev) => [...prev, newCheckpoint])
    return newCheckpoint
  }

  // 重置到初始状态
  const resetCheckpoints = () => {
    setCheckpoints([])
    setSelectedCheckpoint({})
    setLatestCheckpoint({})
  }

  return {
    checkpoints,
    selectedCheckpoint,
    latestCheckpoint,
    updateCheckpoint,
    selectCheckpoint,
    createFork,
    resetCheckpoints
  }
}
