import React from 'react'
import './SearchProgress.css'

export const SearchProgress = ({ iterationCount, isSearching }) => {
  if (!isSearching) return null

  return (
    <div className="search-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(iterationCount / 5) * 100}%` }} 
        />
      </div>
      <p className="progress-text">迭代中... {iterationCount}/5</p>
    </div>
  )
}