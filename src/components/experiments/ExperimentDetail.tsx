import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  FlaskConical,
  Calendar,
  Clock,
  CheckCircle,
  Pause,
  FileText,
  BarChart3,
  StickyNote,
  Plus
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { formatDetailDate, safeDate } from '@/lib/dateUtils'
import { ExperimentDataList } from './ExperimentDataList'
import { ExperimentNoteList } from './ExperimentNoteList'
import type { Experiment, ExperimentData, Note } from '@/types'

interface ExperimentDetailProps {
  experiment: Experiment
  onEdit: (experiment: Experiment) => void
  onBack: () => void
}

export function ExperimentDetail({ experiment, onEdit, onBack }: ExperimentDetailProps) {
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const loadExperimentDetails = async () => {
    try {
      setLoading(true)
      
      // 加载实验数据
      const dataResults = await blink.db.experiment_data.list({
        where: { experiment_id: experiment.id },
        orderBy: { timestamp: 'desc' }
      })
      setExperimentData(dataResults)

      // 加载相关笔记
      const notesResults = await blink.db.notes.list({
        where: { experiment_id: experiment.id },
        orderBy: { created_at: 'desc' }
      })
      setNotes(notesResults)
    } catch (error) {
      console.error('Failed to load experiment details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperimentDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'planning':
        return <Calendar className="h-5 w-5 text-yellow-600" />
      case 'paused':
        return <Pause className="h-5 w-5 text-gray-600" />
      default:
        return <FlaskConical className="h-5 w-5 text-gray-600" />
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

  const calculateDuration = () => {
    const startDate = safeDate(experiment.start_date)
    const endDate = experiment.end_date ? safeDate(experiment.end_date) : new Date()
    
    if (!startDate || !endDate) return 0
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(experiment.status)}
              <h1 className="text-3xl font-bold text-gray-900">{experiment.title}</h1>
              <Badge className={getStatusColor(experiment.status)}>
                {getStatusText(experiment.status)}
              </Badge>
            </div>
            <p className="text-gray-600">{experiment.description}</p>
          </div>
        </div>
        <Button onClick={() => onEdit(experiment)} className="bg-primary hover:bg-primary/90">
          <Edit className="h-4 w-4 mr-2" />
          编辑实验
        </Button>
      </div>

      {/* 实验概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">开始日期</p>
                <p className="text-lg font-semibold">
                  {formatDetailDate(experiment.start_date)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {experiment.end_date ? '结束日期' : '预计结束'}
                </p>
                <p className="text-lg font-semibold">
                  {experiment.end_date 
                    ? formatDetailDate(experiment.end_date)
                    : '未设定'
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">实验天数</p>
                <p className="text-lg font-semibold">{calculateDuration()} 天</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">数据记录</p>
                <p className="text-lg font-semibold">{experimentData.length} 条</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息标签页 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="data">实验数据</TabsTrigger>
          <TabsTrigger value="notes">实验笔记</TabsTrigger>
          <TabsTrigger value="protocol">实验协议</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>实验详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">实验描述</h4>
                <p className="text-gray-600 leading-relaxed">{experiment.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">实验ID:</span>
                      <span className="font-mono">{experiment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">创建时间:</span>
                      <span>{formatDetailDate(experiment.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最后更新:</span>
                      <span>{formatDetailDate(experiment.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">关联信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">关联协议:</span>
                      <span>{experiment.protocol_id || '无'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">数据记录:</span>
                      <span>{experimentData.length} 条</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">实验笔记:</span>
                      <span>{notes.length} 条</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <ExperimentDataList
            experimentId={experiment.id}
            data={experimentData}
            onDataChange={loadExperimentDetails}
          />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <ExperimentNoteList
            experimentId={experiment.id}
            notes={notes}
            onNotesChange={loadExperimentDetails}
          />
        </TabsContent>

        <TabsContent value="protocol" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                实验协议
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experiment.protocol_id ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">关联协议: {experiment.protocol_id}</h4>
                    <p className="text-gray-600">协议详情将在协议管理模块中显示...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">此实验未关联协议</p>
                  <Button variant="outline">
                    关联协议
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}