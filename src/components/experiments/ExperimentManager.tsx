import { useState } from 'react'
import { ExperimentList } from './ExperimentList'
import { ExperimentForm } from './ExperimentForm'
import { ExperimentDetail } from './ExperimentDetail'
import type { Experiment } from '@/types'

type ViewMode = 'list' | 'create' | 'edit' | 'detail'

export function ExperimentManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)

  const handleCreateExperiment = () => {
    setSelectedExperiment(null)
    setViewMode('create')
  }

  const handleEditExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment)
    setViewMode('edit')
  }

  const handleViewExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment)
    setViewMode('detail')
  }

  const handleSaveExperiment = (experiment: Experiment) => {
    // 保存成功后返回列表页面
    setViewMode('list')
    setSelectedExperiment(null)
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedExperiment(null)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedExperiment(null)
  }

  switch (viewMode) {
    case 'create':
      return (
        <ExperimentForm
          onSave={handleSaveExperiment}
          onCancel={handleCancel}
        />
      )
    
    case 'edit':
      return (
        <ExperimentForm
          experiment={selectedExperiment!}
          onSave={handleSaveExperiment}
          onCancel={handleCancel}
        />
      )
    
    case 'detail':
      return (
        <ExperimentDetail
          experiment={selectedExperiment!}
          onEdit={handleEditExperiment}
          onBack={handleBackToList}
        />
      )
    
    default:
      return (
        <ExperimentList
          onCreateExperiment={handleCreateExperiment}
          onEditExperiment={handleEditExperiment}
          onViewExperiment={handleViewExperiment}
        />
      )
  }
}