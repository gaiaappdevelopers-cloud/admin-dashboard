"use client"

import {
  Sparkles,
  Layers,
  FileText,
  BookOpen,
  Users,
  Activity,
  HeartHandshake,
  Info,
  AlertCircle,
} from "lucide-react"

import { useStats } from "@/hooks/use-stats"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const contentCards = [
  { title: "Active Experience Types", value: "4", icon: Sparkles, description: "Live in the mobile app" },
  { title: "Published Schemas", value: "4", icon: Layers, description: "Active form definitions" },
  { title: "Live Pages", value: "6", icon: FileText, description: "Content pages in the app" },
  { title: "Blog Posts", value: "3 published · 2 drafts", icon: BookOpen, description: "Published content" },
]

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  note,
}: {
  title: string
  value: string
  icon: React.ElementType
  description: string
  note?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {note && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-56 text-xs">{note}</TooltipContent>
            </Tooltip>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-28" />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useStats()

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="p-6 space-y-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contentCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </h2>

          {isError ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Failed to load activity stats. The backend may be unavailable.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    title="Registered Users"
                    value={stats!.total_users.toLocaleString()}
                    icon={Users}
                    description="Total accounts created"
                  />
                  <StatCard
                    title="Experiences This Week"
                    value={stats!.experiences_this_week.toLocaleString()}
                    icon={Activity}
                    description="Diary entries logged"
                  />
                  <StatCard
                    title="Research Consents"
                    value={stats!.research_consents_count.toLocaleString()}
                    icon={HeartHandshake}
                    description="Users opted into research"
                    note="Research consent collection is not yet active. This will update once the feature launches."
                  />
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
