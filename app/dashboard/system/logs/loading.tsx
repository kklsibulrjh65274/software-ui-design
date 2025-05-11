import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogsManagementLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* 日志统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* 日志过滤和搜索骨架 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* 日志表格骨架 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex items-center space-x-4 py-3">
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[180px]" />
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-6 w-[100px]" />
              </div>

              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-4">
                    <Skeleton className="h-6 w-[100px]" />
                    <Skeleton className="h-6 w-[180px]" />
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-[100px]" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
