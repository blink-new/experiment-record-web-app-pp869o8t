import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Star, StarOff, Edit, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { blink } from '@/lib/blink'
import { CardNote } from '@/types'
import { safeFormat } from '@/lib/dateUtils'

interface CardNoteListProps {
  onCreateNote: () => void
  onEditNote: (note: CardNote) => void
}

const categories = [
  { value: 'all', label: '全部分类' },
  { value: 'general', label: '通用' },
  { value: 'research', label: '研究' },
  { value: 'ideas', label: '想法' },
  { value: 'references', label: '参考' },
  { value: 'methods', label: '方法' },
  { value: 'observations', label: '观察' },
]

export function CardNoteList({ onCreateNote, onEditNote }: CardNoteListProps) {
  const [notes, setNotes] = useState<CardNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      const result = await blink.db.cardNotes.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      
      const notesWithParsedTags = result.map(note => ({
        ...note,
        tags: typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags,
        is_favorite: Number(note.is_favorite) > 0
      }))
      
      setNotes(notesWithParsedTags)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const toggleFavorite = async (noteId: string, currentFavorite: boolean) => {
    try {
      await blink.db.cardNotes.update(noteId, {
        is_favorite: currentFavorite ? 0 : 1,
        updated_at: new Date().toISOString()
      })
      
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, is_favorite: !currentFavorite }
          : note
      ))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      await blink.db.cardNotes.delete(noteId)
      setNotes(notes.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    const matchesFavorite = !showFavoritesOnly || note.is_favorite
    
    return matchesSearch && matchesCategory && matchesFavorite
  })

  const getStats = () => {
    const totalNotes = notes.length
    const favoriteNotes = notes.filter(note => note.is_favorite).length
    const categories = [...new Set(notes.map(note => note.category))].length
    const allTags = notes.flatMap(note => note.tags)
    const uniqueTags = [...new Set(allTags)].length
    
    return { totalNotes, favoriteNotes, categories, uniqueTags }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总笔记数</p>
                <p className="text-2xl font-bold text-primary">{stats.totalNotes}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">收藏笔记</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.favoriteNotes}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">分类数量</p>
                <p className="text-2xl font-bold text-blue-600">{stats.categories}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">标签数量</p>
                <p className="text-2xl font-bold text-green-600">{stats.uniqueTags}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索笔记标题、内容或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
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
          
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="whitespace-nowrap"
          >
            <Star className="h-4 w-4 mr-2" />
            仅收藏
          </Button>
        </div>
        
        <Button onClick={onCreateNote} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          新建笔记
        </Button>
      </div>

      {/* 笔记网格 */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' || showFavoritesOnly ? '没有找到匹配的笔记' : '还没有笔记'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' || showFavoritesOnly 
                ? '尝试调整搜索条件或筛选器' 
                : '创建您的第一个卡片笔记来开始记录想法和知识'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && !showFavoritesOnly && (
              <Button onClick={onCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                创建笔记
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="group hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderLeft: `4px solid ${note.color}` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(note.id, note.is_favorite)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {note.is_favorite ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditNote(note)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除笔记 "{note.title}" 吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteNote(note.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" style={{ backgroundColor: `${note.color}20`, color: note.color }}>
                    {categories.find(c => c.value === note.category)?.label || note.category}
                  </Badge>
                  <span>•</span>
                  <span>{safeFormat(note.created_at, 'MM/dd', '无日期')}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {note.content}
                </p>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}