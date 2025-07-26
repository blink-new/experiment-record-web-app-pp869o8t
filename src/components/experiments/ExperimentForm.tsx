import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CalendarIcon, 
  Save, 
  ArrowLeft,
  FlaskConical
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { safeDate, safeFormat } from '@/lib/dateUtils'
import type { Experiment } from '@/types'

interface ExperimentFormProps {
  experiment?: Experiment
  onSave: (experiment: Experiment) => void
  onCancel: () => void
}

export function ExperimentForm({ experiment, onSave, onCancel }: ExperimentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as const,
    start_date: new Date(),
    end_date: null as Date | null,
    protocol_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [protocols, setProtocols] = useState<any[]>([])

  useEffect(() => {
    if (experiment) {
      const startDate = safeDate(experiment.start_date) || new Date()
      const endDate = experiment.end_date ? safeDate(experiment.end_date) : null
      
      setFormData({
        title: experiment.title,
        description: experiment.description,
        status: experiment.status,
        start_date: startDate,
        end_date: endDate,
        protocol_id: experiment.protocol_id || ''
      })
    }
  }, [experiment])

  const loadProtocols = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.protocols.list({
        where: { user_id: user.id },
        orderBy: { title: 'asc' }
      })
      setProtocols(data)
    } catch (error) {
      console.error('Failed to load protocols:', error)
    }
  }

  useEffect(() => {
    loadProtocols()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('请输入实验标题')
      return
    }

    if (!formData.description.trim()) {
      alert('请输入实验描述')
      return
    }

    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const experimentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
        protocol_id: formData.protocol_id || null,
        user_id: user.id
      }

      let savedExperiment: Experiment

      if (experiment) {
        // 更新现有实验
        await blink.db.experiments.update(experiment.id, {
          ...experimentData,
          updated_at: new Date().toISOString()
        })
        savedExperiment = {
          ...experiment,
          ...experimentData,
          updated_at: new Date().toISOString()
        }
      } else {
        // 创建新实验
        const newExperiment = await blink.db.experiments.create({
          id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...experimentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        savedExperiment = newExperiment
      }

      onSave(savedExperiment)
    } catch (error) {
      console.error('Failed to save experiment:', error)
      alert('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return '计划中'
      case 'in_progress':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'paused':
        return '已暂停'
      default:
        return status
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {experiment ? '编辑实验' : '新建实验'}
          </h1>
          <p className="text-gray-600 mt-1">
            {experiment ? '修改实验信息和设置' : '创建新的实验记录'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2" />
            实验基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 实验标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">实验标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入实验标题..."
                className="w-full"
                required
              />
            </div>

            {/* 实验描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">实验描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述实验目的、方法和预期结果..."
                className="w-full min-h-[120px]"
                required
              />
            </div>

            {/* 实验状态和日期 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 实验状态 */}
              <div className="space-y-2">
                <Label>实验状态</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">计划中</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="paused">已暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 开始日期 */}
              <div className="space-y-2">
                <Label>开始日期 *</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        safeFormat(formData.start_date, 'PPP', '选择日期')
                      ) : (
                        <span>选择日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, start_date: date })
                          setStartDateOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 结束日期 */}
              <div className="space-y-2">
                <Label>结束日期</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        safeFormat(formData.end_date, 'PPP', '选择日期（可选）')
                      ) : (
                        <span>选择日期（可选）</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => {
                        setFormData({ ...formData, end_date: date })
                        setEndDateOpen(false)
                      }}
                      disabled={(date) => date < formData.start_date}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 关联协议 */}
            <div className="space-y-2">
              <Label htmlFor="protocol">关联协议（可选）</Label>
              <Select 
                value={formData.protocol_id || "none"} 
                onValueChange={(value) => setFormData({ ...formData, protocol_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择实验协议..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无关联协议</SelectItem>
                  {protocols.map((protocol) => (
                    <SelectItem key={protocol.id} value={protocol.id}>
                      {protocol.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {experiment ? '更新实验' : '创建实验'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}