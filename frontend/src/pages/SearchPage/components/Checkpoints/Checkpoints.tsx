import './Checkpoints.css'

// 递归渲染checkpoint树
const CheckpointNode = ({ checkpoint, latestCheckpoint, selectedCheckpoint, onSelect, level = 0 }) => {
  const hasChildren = checkpoint.children && checkpoint.children.length > 0
  const isSelected = selectedCheckpoint.checkpointId === checkpoint.checkpointId
  const isLatest = latestCheckpoint.checkpointId === checkpoint.checkpointId
  return (
    <div className="checkpoint-tree">
      <div
        className={`checkpoint-item ${isSelected ? 'selected' : ''}`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onSelect(checkpoint)}
      >
        <span className="checkpoint-icon">
          {hasChildren ? '📁' : '📄'}
        </span>
        <span className="checkpoint-name">{checkpoint.name}</span>
        <span className="checkpoint-time">{isLatest ? "刚刚" : checkpoint.time}</span>
      </div>

      {hasChildren && (
        <div className="checkpoint-children">
          {checkpoint.children.map((child, childIndex) => (
            <CheckpointNode
              key={child.checkpointId || childIndex}
              latestCheckpoint={latestCheckpoint}
              checkpoint={child}
              selectedCheckpoint={selectedCheckpoint}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const Checkpoints = ({ checkpoints, selectedCheckpoint, latestCheckpoint, onCheckpointSelect, onCreateFork, canCreateFork }) => {


  return (
    <div className="checkpoints">
      <div className="checkpoint-header">
        <h4>检查点</h4>
        {canCreateFork && <button
          className="primary-btn fork-btn"
          onClick={onCreateFork}
        >
          创建分叉
        </button>}

      </div>
      <div className="checkpoint-list">
        {checkpoints.map((checkpoint, index) => (
          <CheckpointNode
            key={checkpoint.checkpointId || index}
            latestCheckpoint={latestCheckpoint}
            checkpoint={checkpoint}
            selectedCheckpoint={selectedCheckpoint}
            onSelect={onCheckpointSelect}
            level={0}
          />
        ))}
      </div>
    </div>
  )
}