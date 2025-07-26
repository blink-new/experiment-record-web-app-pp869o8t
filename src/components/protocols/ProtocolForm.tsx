import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  ArrowLeft,
  BookOpen
} from 'lucide-react'
import { blink } from '@/lib/blink'
import type { Protocol } from '@/types'

interface ProtocolFormProps {
  protocol?: Protocol
  onSave: (protocol: Protocol) => void
  onCancel: () => void
}

export function ProtocolForm({ protocol, onSave, onCancel }: ProtocolFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'other'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (protocol) {
      setFormData({
        title: protocol.title,
        description: protocol.description,
        content: protocol.content,
        category: protocol.category
      })
    }
  }, [protocol])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('请输入协议标题')
      return
    }

    if (!formData.description.trim()) {
      alert('请输入协议描述')
      return
    }

    if (!formData.content.trim()) {
      alert('请输入协议内容')
      return
    }

    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const protocolData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category: formData.category,
        user_id: user.id
      }

      let savedProtocol: Protocol

      if (protocol) {
        // 更新现有协议
        await blink.db.protocols.update(protocol.id, {
          ...protocolData,
          updated_at: new Date().toISOString()
        })
        savedProtocol = {
          ...protocol,
          ...protocolData,
          updated_at: new Date().toISOString()
        }
      } else {
        // 创建新协议
        const newProtocol = await blink.db.protocols.create({
          id: `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...protocolData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        savedProtocol = newProtocol
      }

      onSave(savedProtocol)
    } catch (error) {
      console.error('Failed to save protocol:', error)
      alert('保存失败，请重试')
    } finally {
      setLoading(false)
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

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {protocol ? '编辑协议' : '新建协议'}
          </h1>
          <p className="text-gray-600 mt-1">
            {protocol ? '修改协议信息和内容' : '创建新的实验协议'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            协议基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 协议标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">协议标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入协议标题..."
                className="w-full"
                required
              />
            </div>

            {/* 协议描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">协议描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述协议的用途和适用范围..."
                className="w-full min-h-[80px]"
                required
              />
            </div>

            {/* 协议分类 */}
            <div className="space-y-2">
              <Label>协议分类</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="molecular">分子生物学</SelectItem>
                  <SelectItem value="cell">细胞生物学</SelectItem>
                  <SelectItem value="protein">蛋白质</SelectItem>
                  <SelectItem value="analytical">分析检测</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 协议内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">协议内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="详细的实验步骤和操作说明...

例如：
1. 准备工作
   - 准备所需试剂和器材
   - 检查设备状态

2. 实验步骤
   - 步骤1：...
   - 步骤2：...
   - 步骤3：...

3. 注意事项
   - 安全提醒
   - 关键控制点

4. 结果判断
   - 预期结果
   - 异常处理"
                className="w-full min-h-[300px] font-mono text-sm"
                required
              />
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
                    {protocol ? '更新协议' : '创建协议'}
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