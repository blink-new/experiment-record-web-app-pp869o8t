import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2,
  BookOpen,
  Filter
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { blink } from '@/lib/blink'
import { safeFormat } from '@/lib/dateUtils'
import type { Protocol } from '@/types'

interface ProtocolListProps {
  onCreateProtocol: () => void
  onEditProtocol: (protocol: Protocol) => void
  onViewProtocol: (protocol: Protocol) => void
}

export function ProtocolList({ onCreateProtocol, onEditProtocol, onViewProtocol }: ProtocolListProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadProtocols = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      const data = await blink.db.protocols.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      setProtocols(data)
    } catch (error) {
      console.error('Failed to load protocols:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProtocols()
  }, [])

  const handleDeleteProtocol = async (protocolId: string) => {
    try {
      await blink.db.protocols.delete(protocolId)
      setProtocols(protocols.filter(p => p.id !== protocolId))
    } catch (error) {
      console.error('Failed to delete protocol:', error)
      alert('删除失败，请重试')
    }
  }

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || protocol.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'molecular':
        return 'bg-blue-100 text-blue-800'
      case 'cell':
        return 'bg-green-100 text-green-800'
      case 'protein':
        return 'bg-purple-100 text-purple-800'
      case 'analytical':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'molecular':
        return '分子生物学'
      case 'cell':
        return '细胞生物学'
      case 'protein':
        return '蛋白质'
      case 'analytical':
        return '分析检测'
      default:
        return '其他'
    }
  }

  const getProtocolStats = () => {
    const total = protocols.length
    const categories = [...new Set(protocols.map(p => p.category))].length
    const recentCount = protocols.filter(p => {
      try {
        const createdDate = new Date(p.created_at)
        if (isNaN(createdDate.getTime())) return false
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return createdDate > weekAgo
      } catch {
        return false
      }
    }).length

    return { total, categories, recentCount }
  }

  const stats = getProtocolStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">协议管理</h1>
          <p className="text-gray-600 mt-1">管理实验协议和标准操作程序</p>
        </div>
        <Button onClick={onCreateProtocol} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          新建协议
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总协议数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">分类数量</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本周新增</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索协议标题或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="molecular">分子生物学</SelectItem>
                <SelectItem value="cell">细胞生物学</SelectItem>
                <SelectItem value="protein">蛋白质</SelectItem>
                <SelectItem value="analytical">分析检测</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 协议列表 */}
      {filteredProtocols.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' ? '未找到匹配的协议' : '还没有协议'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all' 
                ? '尝试调整搜索条件或筛选器' 
                : '创建您的第一个实验协议，建立标准化的实验流程'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={onCreateProtocol} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                创建协议
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProtocols.map((protocol) => (
            <Card key={protocol.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{protocol.title}</CardTitle>
                    <Badge className={getCategoryColor(protocol.category)}>
                      {getCategoryText(protocol.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProtocol(protocol)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除协议 "{protocol.title}" 吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProtocol(protocol.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">{protocol.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>创建于 {safeFormat(protocol.created_at, 'PPP', '无日期')}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProtocol(protocol)}
                  >
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}