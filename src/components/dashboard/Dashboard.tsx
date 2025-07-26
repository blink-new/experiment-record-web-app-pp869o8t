import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FlaskConical, 
  FileText, 
  StickyNote, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { safeFormat } from '@/lib/dateUtils'
import type { Experiment } from '@/types'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    protocols: 0
  })

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      // 加载实验数据
      const experimentsData = await blink.db.experiments.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 5
      })
      
      setExperiments(experimentsData)
      
      // 计算统计数据
      const total = experimentsData.length
      const inProgress = experimentsData.filter(exp => exp.status === 'in_progress').length
      const completed = experimentsData.filter(exp => exp.status === 'completed').length
      
      setStats({
        total,
        inProgress,
        completed,
        protocols: 12 // 临时数据
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-1">欢迎回到实验记录助手</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => onNavigate?.('experiments')}
          >
            <Plus className="h-4 w-4 mr-2" />
            新建实验
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总实验数</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +2 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              活跃实验
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              本月完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">协议模板</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.protocols}</div>
            <p className="text-xs text-muted-foreground">
              可用协议
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近实验 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="h-5 w-5 mr-2" />
              最近实验
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experiments.length > 0 ? (
                experiments.map((experiment) => (
                  <div key={experiment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{experiment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        创建于 {safeFormat(experiment.created_at, 'PP', '无日期')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(experiment.status)}>
                        {getStatusText(experiment.status)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onNavigate?.('experiments')}
                      >
                        查看
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">还没有实验记录</p>
                  <Button 
                    className="mt-4"
                    onClick={() => onNavigate?.('experiments')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一个实验
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 快速操作和提醒 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => onNavigate?.('experiments')}
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                新建实验
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => onNavigate?.('protocols')}
              >
                <FileText className="h-4 w-4 mr-2" />
                创建协议
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => onNavigate?.('notes')}
              >
                <StickyNote className="h-4 w-4 mr-2" />
                添加笔记
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => onNavigate?.('analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                查看分析
              </Button>
            </CardContent>
          </Card>

          {/* SOP 提醒 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                SOP 提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">实验前检查</p>
                  <p className="text-xs text-amber-700 mt-1">
                    确保所有设备已校准，试剂在有效期内
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">数据记录</p>
                  <p className="text-xs text-blue-700 mt-1">
                    及时记录实验数据，避免遗忘
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">实验后整理</p>
                  <p className="text-xs text-green-700 mt-1">
                    清理实验台，整理实验记录
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}