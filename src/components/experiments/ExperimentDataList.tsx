import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  BarChart3, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react'
import { blink } from '@/lib/blink'
import { formatListDate, formatDetailDateTime } from '@/lib/dateUtils'
import { ExperimentDataForm } from './ExperimentDataForm'
import type { ExperimentData } from '@/types'

interface ExperimentDataListProps {
  experimentId: string
  data: ExperimentData[]
  onDataChange: () => void
}

export function ExperimentDataList({ experimentId, data, onDataChange }: ExperimentDataListProps) {
  const [showDataForm, setShowDataForm] = useState(false)
  const [editingData, setEditingData] = useState<ExperimentData | undefined>()
  const [deleteData, setDeleteData] = useState<ExperimentData | undefined>()
  const [filterType, setFilterType] = useState<string>('all')

  const handleEdit = (dataItem: ExperimentData) => {
    setEditingData(dataItem)
    setShowDataForm(true)
  }

  const handleDelete = async () => {
    if (!deleteData) return

    try {
      await blink.db.experiment_data.delete(deleteData.id)
      onDataChange()
      setDeleteData(undefined)
    } catch (error) {
      console.error('Failed to delete data:', error)
    }
  }

  const handleFormClose = () => {
    setShowDataForm(false)
    setEditingData(undefined)
  }

  const getDataTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      temperature: '温度',
      ph: 'pH值',
      concentration: '浓度',
      volume: '体积',
      weight: '重量',
      time: '时间',
      count: '计数',
      percentage: '百分比',
      observation: '观察记录',
      other: '其他'
    }
    return types[type] || type
  }

  const getDataTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      temperature: 'bg-red-100 text-red-800',
      ph: 'bg-blue-100 text-blue-800',
      concentration: 'bg-green-100 text-green-800',
      volume: 'bg-purple-100 text-purple-800',
      weight: 'bg-yellow-100 text-yellow-800',
      time: 'bg-indigo-100 text-indigo-800',
      count: 'bg-pink-100 text-pink-800',
      percentage: 'bg-orange-100 text-orange-800',
      observation: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredData = filterType === 'all' 
    ? data 
    : data.filter(item => item.data_type === filterType)

  const dataTypes = [...new Set(data.map(item => item.data_type))]

  const getStatistics = () => {
    const totalRecords = data.length
    const uniqueTypes = dataTypes.length
    const latestRecord = data.length > 0 ? data[0] : null
    
    return { totalRecords, uniqueTypes, latestRecord }
  }

  const { totalRecords, uniqueTypes, latestRecord } = getStatistics()

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总记录数</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">数据类型</p>
                <p className="text-2xl font-bold">{uniqueTypes}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">最新记录</p>
                <p className="text-sm font-semibold">
                  {latestRecord 
                    ? formatListDate(latestRecord.timestamp)
                    : '无记录'
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
            <BarChart3 className="h-5 w-5 mr-2" />
            实验数据记录
          </CardTitle>
          <div className="flex items-center gap-2">
            {dataTypes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterType === 'all' ? '全部类型' : getDataTypeLabel(filterType)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    全部类型
                  </DropdownMenuItem>
                  {dataTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                      {getDataTypeLabel(type)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button onClick={() => setShowDataForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加数据
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="space-y-4">
              {filteredData.map((dataItem) => (
                <div key={dataItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getDataTypeColor(dataItem.data_type)}>
                        {getDataTypeLabel(dataItem.data_type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDetailDateTime(dataItem.timestamp)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(dataItem)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteData(dataItem)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {dataItem.data_value}
                      </span>
                      {dataItem.measurement_unit && (
                        <span className="text-lg text-gray-600">
                          {dataItem.measurement_unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterType === 'all' ? '还没有实验数据' : `没有${getDataTypeLabel(filterType)}数据`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filterType === 'all' 
                  ? '开始记录您的第一条实验数据'
                  : '尝试切换到其他数据类型或添加新数据'
                }
              </p>
              <Button onClick={() => setShowDataForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加数据
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据表单对话框 */}
      <ExperimentDataForm
        open={showDataForm}
        onOpenChange={handleFormClose}
        experimentId={experimentId}
        data={editingData}
        onSuccess={() => {
          onDataChange()
          handleFormClose()
        }}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteData} onOpenChange={() => setDeleteData(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条实验数据吗？此操作无法撤销。
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