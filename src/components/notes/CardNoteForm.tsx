import { useState, useEffect } from 'react'
import { X, Plus, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { blink } from '@/lib/blink'
import { CardNote } from '@/types'

interface CardNoteFormProps {
  note?: CardNote
  onSave: () => void
  onCancel: () => void
}

const categories = [
  { value: 'general', label: '通用' },
  { value: 'research', label: '研究' },
  { value: 'ideas', label: '想法' },
  { value: 'references', label: '参考' },
  { value: 'methods', label: '方法' },
  { value: 'observations', label: '观察' },
]

const colors = [
  { value: '#f59e0b', label: '橙色' },
  { value: '#ef4444', label: '红色' },
  { value: '#10b981', label: '绿色' },
  { value: '#3b82f6', label: '蓝色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#f97316', label: '橘色' },
  { value: '#06b6d4', label: '青色' },
  { value: '#84cc16', label: '黄绿色' },
]

export function CardNoteForm({ note, onSave, onCancel }: CardNoteFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    color: '#f59e0b',
    is_favorite: false
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        color: note.color,
        is_favorite: note.is_favorite
      })
      setTags(note.tags)
    }
  }, [note])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        color: formData.color,
        tags: JSON.stringify(tags),
        is_favorite: formData.is_favorite ? 1 : 0,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (note) {
        await blink.db.cardNotes.update(note.id, noteData)
      } else {
        await blink.db.cardNotes.create({
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...noteData,
          created_at: new Date().toISOString()
        })
      }
      
      onSave()
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {note ? '编辑笔记' : '新建笔记'}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card style={{ borderLeft: `4px solid ${formData.color}` }}>
        <CardHeader>
          <CardTitle className="text-lg">笔记预览</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">标题 *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入笔记标题..."
                required
              />
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">内容 *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="输入笔记内容..."
                rows={8}
                required
              />
            </div>

            {/* 分类和颜色 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">分类</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">颜色</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color.value 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">标签</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 收藏选项 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="favorite" className="text-sm font-medium">
                添加到收藏
              </label>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit" disabled={loading || !formData.title.trim() || !formData.content.trim()}>
                {loading ? '保存中...' : (note ? '更新笔记' : '创建笔记')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}