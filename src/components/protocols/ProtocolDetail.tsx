import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  BookOpen,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import { safeFormat } from '@/lib/dateUtils'
import type { Protocol } from '@/types'

interface ProtocolDetailProps {
  protocol: Protocol
  onEdit: (protocol: Protocol) => void
  onBack: () => void
}

export function ProtocolDetail({ protocol, onEdit, onBack }: ProtocolDetailProps) {
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

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
        {line}
      </div>
    ))
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{protocol.title}</h1>
            <p className="text-gray-600 mt-1">协议详情和操作说明</p>
          </div>
        </div>
        <Button onClick={() => onEdit(protocol)} className="bg-primary hover:bg-primary/90">
          <Edit className="h-4 w-4 mr-2" />
          编辑协议
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 协议信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                协议信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">协议标题</h3>
                <p className="text-gray-700">{protocol.title}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">协议描述</h3>
                <p className="text-gray-700">{protocol.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">协议分类</h3>
                <Badge className={getCategoryColor(protocol.category)}>
                  {getCategoryText(protocol.category)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 协议内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                协议内容
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {formatContent(protocol.content)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 创建信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">创建信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">创建时间</p>
                  <p>{safeFormat(protocol.created_at, 'PPP', '无日期')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">更新时间</p>
                  <p>{safeFormat(protocol.updated_at, 'PPP', '无日期')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">创建者</p>
                  <p>当前用户</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">使用统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-gray-600">关联实验数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">本月使用次数</div>
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onEdit(protocol)}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑协议
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(protocol.content)
                  alert('协议内容已复制到剪贴板')
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                复制内容
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}