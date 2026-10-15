import { LayoutDashboard } from 'lucide-react'
import { definePlugin } from 'sanity'
import { ManagerTool } from './manager-tool'

export const managerPlugin = definePlugin({
  name: 'parlament-manager',
  tools: [{ name: 'manage', title: 'Upravitelj', icon: LayoutDashboard, component: ManagerTool }],
})
