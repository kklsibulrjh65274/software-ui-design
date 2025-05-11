import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ObjectStorageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* 存储概览卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-32" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* 主要内容标签页骨架 */}
      <Tabs defaultValue="buckets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buckets" disabled>
            存储桶管理
          </TabsTrigger>
          <TabsTrigger value="objects" disabled>
            对象管理
          </TabsTrigger>
          <TabsTrigger value="lifecycle" disabled>
            生命周期策略
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buckets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>

          <div className="rounded-md border p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-2">
                {Array(7)
                  .fill(null)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-4 w-24" />
                  ))}
              </div>
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    {Array(7)
                      .fill(null)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-4 w-24" />
                      ))}
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
