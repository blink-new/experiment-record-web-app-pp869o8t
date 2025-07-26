import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  Pause,
  Edit,
  Eye,
  Trash2
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { safeFormat } from '@/lib/dateUtils'
import type { Experiment } from '@/types'

interface ExperimentListProps {
  onCreateExperiment: () => void
  onEditExperiment: (experiment: Experiment) => void
  onViewExperiment: (experiment: Experiment) => void
}

export function ExperimentList({ onCreateExperiment, onEditExperiment, onViewExperiment }: ExperimentListProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadExperiments = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const experimentsData = await blink.db.experiments.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      
      setExperiments(experimentsData)
    } catch (error) {
      console.error('Failed to load experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperiments()
  }, [])

  const handleDeleteExperiment = async (experimentId: string) => {
    if (!confirm('确定要删除这个实验记录吗？此操作不可撤销。')) {
      return
    }

    try {
      await blink.db.experiments.delete(experimentId)
      setExperiments(experiments.filter(exp => exp.id !== experimentId))
    } catch (error) {
      console.error('Failed to delete experiment:', error)
      alert('删除失败，请重试')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'planning':
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-600" />
      default:
        return <FlaskConical className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'in_progress':
        return '进行中'
      case 'planning':
        return '计划中'
      case 'paused':
        return '已暂停'
      default:
        return status
    }
  }

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || experiment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">实验记录</h1>
          <p className="text-gray-600 mt-1">管理您的实验记录和数据</p>
        </div>
        <Button onClick={onCreateExperiment} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          新建实验
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索实验标题或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="planning">计划中</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实验列表 */}
      <div className="space-y-4">
        {filteredExperiments.length > 0 ? (
          filteredExperiments.map((experiment) => (
            <Card key={experiment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(experiment.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {experiment.title}
                      </h3>
                      <Badge className={getStatusColor(experiment.status)}>
                        {getStatusText(experiment.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {experiment.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>开始时间: {safeFormat(experiment.start_date, 'PP', '无日期')}</span>
                      {experiment.end_date && (
                        <span>结束时间: {safeFormat(experiment.end_date, 'PP', '无日期')}</span>
                      )}
                      <span>创建于: {safeFormat(experiment.created_at, 'PP', '无日期')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewExperiment(experiment)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditExperiment(experiment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExperiment(experiment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? '没有找到匹配的实验' : '还没有实验记录'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? '尝试调整搜索条件或筛选器' 
                    : '创建您的第一个实验记录开始使用'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Button onClick={onCreateExperiment} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一个实验
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}