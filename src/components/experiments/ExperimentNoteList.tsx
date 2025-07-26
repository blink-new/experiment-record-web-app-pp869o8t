import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  StickyNote, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Search,
  Calendar,
  Tag
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { formatListDate, formatDetailDate, formatDetailDateTime } from '@/lib/dateUtils'
import { ExperimentNoteForm } from './ExperimentNoteForm'
import type { Note } from '@/types'

interface ExperimentNoteListProps {
  experimentId: string
  notes: Note[]
  onNotesChange: () => void
}

export function ExperimentNoteList({ experimentId, notes, onNotesChange }: ExperimentNoteListProps) {
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | undefined>()
  const [deleteNote, setDeleteNote] = useState<Note | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setShowNoteForm(true)
  }

  const handleDelete = async () => {
    if (!deleteNote) return

    try {
      await blink.db.notes.delete(deleteNote.id)
      onNotesChange()
      setDeleteNote(undefined)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleFormClose = () => {
    setShowNoteForm(false)
    setEditingNote(undefined)
  }

  // 获取所有标签
  const allTags = [...new Set(notes.flatMap(note => note.tags))]

  // 过滤笔记
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  const getStatistics = () => {
    const totalNotes = notes.length
    const totalTags = allTags.length
    const latestNote = notes.length > 0 ? notes[0] : null
    
    return { totalNotes, totalTags, latestNote }
  }

  const { totalNotes, totalTags, latestNote } = getStatistics()

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总笔记数</p>
                <p className="text-2xl font-bold">{totalNotes}</p>
              </div>
              <StickyNote className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">标签数量</p>
                <p className="text-2xl font-bold">{totalTags}</p>
              </div>
              <Tag className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">最新笔记</p>
                <p className="text-sm font-semibold">
                  {latestNote 
                    ? formatListDate(latestNote.created_at)
                    : '无笔记'
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <StickyNote className="h-5 w-5 mr-2" />
            实验笔记
          </CardTitle>
          <Button onClick={() => setShowNoteForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加笔记
          </Button>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索笔记标题或内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {allTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    {selectedTag === 'all' ? '全部标签' : selectedTag}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedTag('all')}>
                    全部标签
                  </DropdownMenuItem>
                  {allTags.map((tag) => (
                    <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 笔记列表 */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDetailDate(note.created_at)}
                        </span>
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {note.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteNote(note)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="text-gray-600 leading-relaxed">
                    <p className="line-clamp-3">{note.content}</p>
                  </div>
                  
                  {note.updated_at !== note.created_at && (
                    <div className="mt-3 text-xs text-gray-500">
                      最后更新: {formatDetailDateTime(note.updated_at)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <StickyNote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedTag !== 'all' ? '没有找到匹配的笔记' : '还没有实验笔记'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedTag !== 'all' 
                  ? '尝试调整搜索条件或清除筛选器'
                  : '开始记录您的第一条实验笔记'
                }
              </p>
              <Button onClick={() => setShowNoteForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加笔记
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 笔记表单对话框 */}
      <ExperimentNoteForm
        open={showNoteForm}
        onOpenChange={handleFormClose}
        experimentId={experimentId}
        note={editingNote}
        onSuccess={() => {
          onNotesChange()
          handleFormClose()
        }}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteNote} onOpenChange={() => setDeleteNote(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除笔记 "{deleteNote?.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}