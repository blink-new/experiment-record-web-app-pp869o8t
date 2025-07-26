import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2 } from 'lucide-react'
import { blink } from '@/lib/blink'
import type { Note } from '@/types'

interface ExperimentNoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: string
  note?: Note
  onSuccess: () => void
}

export function ExperimentNoteForm({ 
  open, 
  onOpenChange, 
  experimentId, 
  note, 
  onSuccess 
}: ExperimentNoteFormProps) {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    tags: note?.tags || []
  })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    try {
      setLoading(true)
      const user = await blink.auth.me()

      const noteData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        experiment_id: experimentId,
        user_id: user.id
      }

      if (note) {
        // 编辑现有笔记
        await blink.db.notes.update(note.id, {
          ...noteData,
          updated_at: new Date().toISOString()
        })
      } else {
        // 创建新笔记
        await blink.db.notes.create({
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...noteData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      onSuccess()
      onOpenChange(false)
      
      // 重置表单
      setFormData({
        title: '',
        content: '',
        tags: []
      })
      setNewTag('')
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {note ? '编辑实验笔记' : '添加实验笔记'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">笔记标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入笔记标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">笔记内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入笔记内容..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="添加标签"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {note ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}