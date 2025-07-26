import { useState } from 'react'
import { 
  LayoutDashboard, 
  FlaskConical, 
  FileText, 
  StickyNote, 
  BarChart3, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: '仪表板', icon: LayoutDashboard },
    { id: 'experiments', label: '实验记录', icon: FlaskConical },
    { id: 'protocols', label: '协议管理', icon: FileText },
    { id: 'notes', label: '卡片笔记', icon: StickyNote },
    { id: 'analytics', label: '数据分析', icon: BarChart3 },
  ]

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary">实验记录助手</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-4'}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}