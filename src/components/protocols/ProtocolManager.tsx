import { useState } from 'react'
import { ProtocolList } from './ProtocolList'
import { ProtocolForm } from './ProtocolForm'
import { ProtocolDetail } from './ProtocolDetail'
import type { Protocol } from '@/types'

type ViewMode = 'list' | 'create' | 'edit' | 'detail'

export function ProtocolManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)

  const handleCreateProtocol = () => {
    setSelectedProtocol(null)
    setViewMode('create')
  }

  const handleEditProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol)
    setViewMode('edit')
  }

  const handleViewProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol)
    setViewMode('detail')
  }

  const handleSaveProtocol = (protocol: Protocol) => {
    // 保存成功后返回列表页面
    setViewMode('list')
    setSelectedProtocol(null)
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedProtocol(null)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedProtocol(null)
  }

  switch (viewMode) {
    case 'create':
      return (
        <ProtocolForm
          onSave={handleSaveProtocol}
          onCancel={handleCancel}
        />
      )
    
    case 'edit':
      return (
        <ProtocolForm
          protocol={selectedProtocol!}
          onSave={handleSaveProtocol}
          onCancel={handleCancel}
        />
      )
    
    case 'detail':
      return (
        <ProtocolDetail
          protocol={selectedProtocol!}
          onEdit={handleEditProtocol}
          onBack={handleBackToList}
        />
      )
    
    default:
      return (
        <ProtocolList
          onCreateProtocol={handleCreateProtocol}
          onEditProtocol={handleEditProtocol}
          onViewProtocol={handleViewProtocol}
        />
      )
  }
}