import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>
              <Skeleton className="h-5 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-8" />
                </div>
              ))}
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>
                  <Skeleton className="h-5 w-24" />
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-[180px]" />
                  <Skeleton className="h-9 w-[200px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-b px-4 py-2">
                <div className="flex gap-4">
                  {Array(4)
                    .fill(null)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-9 w-24" />
                    ))}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-5 w-5 mt-0.5" />
                          <div>
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-96 mb-2" />
                            <div className="flex items-center gap-2 mt-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
