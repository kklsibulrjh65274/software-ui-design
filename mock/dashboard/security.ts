// 安全相关的 mock 数据
export const users = [
  {
    id: "user-001",
    username: "admin",
    email: "admin@example.com",
    role: "管理员",
    status: "活跃",
    lastLogin: "2023-05-10 08:45:12",
  },
  {
    id: "user-002",
    username: "operator",
    email: "operator@example.com",
    role: "操作员",
    status: "活跃",
    lastLogin: "2023-05-09 16:30:45",
  },
  {
    id: "user-003",
    username: "analyst",
    email: "analyst@example.com",
    role: "分析师",
    status: "活跃",
    lastLogin: "2023-05-08 14:15:30",
  },
  {
    id: "user-004",
    username: "guest",
    email: "guest@example.com",
    role: "访客",
    status: "锁定",
    lastLogin: "2023-04-25 10:20:15",
  },
]

export const roles = [
  {
    id: "role-001",
    name: "管理员",
    description: "系统管理员，拥有所有权限",
    users: 1,
    permissions: "所有权限",
  },
  {
    id: "role-002",
    name: "操作员",
    description: "系统操作员，可以执行大部分操作",
    users: 1,
    permissions: "读写权限，无管理权限",
  },
  {
    id: "role-003",
    name: "分析师",
    description: "数据分析师，主要进行数据查询和分析",
    users: 1,
    permissions: "只读权限，可执行查询",
  },
  {
    id: "role-004",
    name: "访客",
    description: "系统访客，只能查看有限信息",
    users: 1,
    permissions: "有限的只读权限",
  },
]

export const accessPolicies = [
  {
    id: "policy-001",
    name: "数据库完全访问",
    type: "数据库",
    target: "postgres-main",
    role: "管理员",
    access: "完全访问",
  },
  {
    id: "policy-002",
    name: "数据库只读访问",
    type: "数据库",
    target: "postgres-main",
    role: "分析师",
    access: "只读",
  },
  {
    id: "policy-003",
    name: "存储管理访问",
    type: "存储",
    target: "文件存储",
    role: "操作员",
    access: "读写",
  },
  {
    id: "policy-004",
    name: "系统监控访问",
    type: "系统",
    target: "监控面板",
    role: "操作员",
    access: "只读",
  },
]