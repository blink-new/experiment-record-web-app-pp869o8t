import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { blink } from '@/lib/blink'
import { safeDate, safeFormat } from '@/lib/dateUtils'
import type { ExperimentData } from '@/types'

interface ExperimentDataFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: string
  data?: ExperimentData
  onSuccess: () => void
}

export function ExperimentDataForm({ 
  open, 
  onOpenChange, 
  experimentId, 
  data, 
  onSuccess 
}: ExperimentDataFormProps) {
  const [formData, setFormData] = useState({
    data_type: data?.data_type || '',
    data_value: data?.data_value || '',
    measurement_unit: data?.measurement_unit || '',
    timestamp: data?.timestamp ? (safeDate(data.timestamp) || new Date()) : new Date(),
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.data_type || !formData.data_value) return

    try {
      setLoading(true)
      const user = await blink.auth.me()

      const dataToSave = {
        experiment_id: experimentId,
        data_type: formData.data_type,
        data_value: formData.data_value,
        measurement_unit: formData.measurement_unit || undefined,
        timestamp: formData.timestamp.toISOString(),
        user_id: user.id
      }

      if (data) {
        // 编辑现有数据
        await blink.db.experiment_data.update(data.id, dataToSave)
      } else {
        // 创建新数据
        await blink.db.experiment_data.create({
          id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...dataToSave,
          created_at: new Date().toISOString()
        })
      }

      onSuccess()
      onOpenChange(false)
      
      // 重置表单
      setFormData({
        data_type: '',
        data_value: '',
        measurement_unit: '',
        timestamp: new Date(),
        notes: ''
      })
    } catch (error) {
      console.error('Failed to save experiment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dataTypes = [
    { value: 'temperature', label: '温度' },
    { value: 'ph', label: 'pH值' },
    { value: 'concentration', label: '浓度' },
    { value: 'volume', label: '体积' },
    { value: 'weight', label: '重量' },
    { value: 'time', label: '时间' },
    { value: 'count', label: '计数' },
    { value: 'percentage', label: '百分比' },
    { value: 'observation', label: '观察记录' },
    { value: 'other', label: '其他' }
  ]

  const units = {
    temperature: ['°C', '°F', 'K'],
    ph: ['pH'],
    concentration: ['mol/L', 'g/L', 'mg/L', 'μg/L', '%'],
    volume: ['mL', 'L', 'μL'],
    weight: ['g', 'kg', 'mg', 'μg'],
    time: ['s', 'min', 'h', 'd'],
    count: ['个', '次'],
    percentage: ['%'],
    observation: [],
    other: []
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {data ? '编辑实验数据' : '添加实验数据'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data_type">数据类型 *</Label>
            <Select
              value={formData.data_type}
              onValueChange={(value) => setFormData({ ...formData, data_type: value, measurement_unit: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择数据类型" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_value">数据值 *</Label>
            <Input
              id="data_value"
              value={formData.data_value}
              onChange={(e) => setFormData({ ...formData, data_value: e.target.value })}
              placeholder="输入数据值"
              required
            />
          </div>

          {formData.data_type && units[formData.data_type as keyof typeof units]?.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="measurement_unit">测量单位</Label>
              <Select
                value={formData.measurement_unit}
                onValueChange={(value) => setFormData({ ...formData, measurement_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择单位" />
                </SelectTrigger>
                <SelectContent>
                  {units[formData.data_type as keyof typeof units].map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>记录时间 *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {safeFormat(formData.timestamp, 'PPP HH:mm', '选择时间')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.timestamp}
                  onSelect={(date) => date && setFormData({ ...formData, timestamp: date })}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Label className="text-sm">时间</Label>
                  <Input
                    type="time"
                    value={safeFormat(formData.timestamp, 'HH:mm', '00:00')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':')
                      const newDate = new Date(formData.timestamp)
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      setFormData({ ...formData, timestamp: newDate })
                    }}
                    className="mt-1"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="添加备注信息（可选）"
              rows={3}
            />
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
              {data ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}