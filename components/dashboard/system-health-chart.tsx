"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "1日", cpu: 65, memory: 55, disk: 40, network: 70 },
  { name: "2日", cpu: 70, memory: 60, disk: 45, network: 65 },
  { name: "3日", cpu: 60, memory: 65, disk: 50, network: 60 },
  { name: "4日", cpu: 80, memory: 70, disk: 55, network: 75 },
  { name: "5日", cpu: 75, memory: 75, disk: 60, network: 80 },
  { name: "6日", cpu: 70, memory: 80, disk: 65, network: 85 },
  { name: "7日", cpu: 65, memory: 75, disk: 70, network: 80 },
  { name: "8日", cpu: 60, memory: 70, disk: 75, network: 75 },
  { name: "9日", cpu: 55, memory: 65, disk: 70, network: 70 },
  { name: "10日", cpu: 50, memory: 60, disk: 65, network: 65 },
  { name: "11日", cpu: 55, memory: 55, disk: 60, network: 60 },
  { name: "12日", cpu: 60, memory: 50, disk: 55, network: 55 },
  { name: "13日", cpu: 65, memory: 55, disk: 50, network: 60 },
  { name: "14日", cpu: 70, memory: 60, disk: 55, network: 65 },
  { name: "15日", cpu: 75, memory: 65, disk: 60, network: 70 },
  { name: "16日", cpu: 80, memory: 70, disk: 65, network: 75 },
  { name: "17日", cpu: 85, memory: 75, disk: 70, network: 80 },
  { name: "18日", cpu: 80, memory: 80, disk: 75, network: 85 },
  { name: "19日", cpu: 75, memory: 75, disk: 80, network: 80 },
  { name: "20日", cpu: 70, memory: 70, disk: 75, network: 75 },
  { name: "21日", cpu: 65, memory: 65, disk: 70, network: 70 },
  { name: "22日", cpu: 60, memory: 60, disk: 65, network: 65 },
  { name: "23日", cpu: 55, memory: 55, disk: 60, network: 60 },
  { name: "24日", cpu: 50, memory: 50, disk: 55, network: 55 },
  { name: "25日", cpu: 55, memory: 55, disk: 50, network: 60 },
  { name: "26日", cpu: 60, memory: 60, disk: 55, network: 65 },
  { name: "27日", cpu: 65, memory: 65, disk: 60, network: 70 },
  { name: "28日", cpu: 70, memory: 70, disk: 65, network: 75 },
  { name: "29日", cpu: 75, memory: 75, disk: 70, network: 80 },
  { name: "30日", cpu: 70, memory: 70, disk: 75, network: 75 },
]

export function SystemHealthChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU 使用率" />
          <Line type="monotone" dataKey="memory" stroke="#10b981" name="内存使用率" />
          <Line type="monotone" dataKey="disk" stroke="#f59e0b" name="磁盘使用率" />
          <Line type="monotone" dataKey="network" stroke="#8b5cf6" name="网络使用率" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
