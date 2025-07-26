import { useState } from 'react'
import { CardNoteList } from './CardNoteList'
import { CardNoteForm } from './CardNoteForm'
import { CardNote } from '@/types'

export function CardNoteManager() {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list')
  const [editingNote, setEditingNote] = useState<CardNote | undefined>(undefined)

  const handleCreateNote = () => {
    setEditingNote(undefined)
    setCurrentView('form')
  }

  const handleEditNote = (note: CardNote) => {
    setEditingNote(note)
    setCurrentView('form')
  }

  const handleSaveNote = () => {
    setCurrentView('list')
    setEditingNote(undefined)
  }

  const handleCancel = () => {
    setCurrentView('list')
    setEditingNote(undefined)
  }

  return (
    <div className="p-6">
      {currentView === 'list' ? (
        <CardNoteList 
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
        />
      ) : (
        <CardNoteForm
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}