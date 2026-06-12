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
  Target,
} from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, LabelList } from "recharts"

import { useStats } from "@/hooks/use-stats"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const contentCards = [
  { title: "Active Experience Types", value: "4", icon: Sparkles, description: "Live in the mobile app" },
  { title: "Published Schemas", value: "4", icon: Layers, description: "Active form definitions" },
  { title: "Live Pages", value: "6", icon: FileText, description: "Content pages in the app" },
  { title: "Blog Posts", value: "3 published · 2 drafts", icon: BookOpen, description: "Published content" },
]

const FUNNEL_DATA = [
  { stage: "Users", value: 1247, rate: null },
  { stage: "Experiences", value: 842, rate: "67.5%" },
  { stage: "PAIs created", value: 156, rate: "18.5%" },
  { stage: "Leads", value: 43, rate: "27.6%" },
]

const FUNNEL_CONFIG = {
  value: { label: "Count", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const STATUS_DATA = [
  { status: "new", label: "New", value: 18 },
  { status: "assigned", label: "Assigned", value: 15 },
  { status: "contacted", label: "Contacted", value: 10 },
]

const STATUS_CONFIG = {
  new: { label: "New", color: "hsl(var(--chart-1))" },
  assigned: { label: "Assigned", color: "hsl(var(--chart-2))" },
  contacted: { label: "Contacted", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leads
            </h2>
            <Badge variant="outline" className="text-xs font-normal rounded-sm">
              Coming soon · mock data
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {/* Total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leads
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">43</p>
                <p className="mt-1 text-xs text-muted-foreground">Users who requested professional support</p>
              </CardContent>
            </Card>

            {/* Funnel bar chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartContainer config={FUNNEL_CONFIG} className="h-[160px] w-full">
                  <BarChart
                    data={FUNNEL_DATA}
                    layout="vertical"
                    margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      width={72}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} maxBarSize={20}>
                      <LabelList
                        dataKey="value"
                        position="right"
                        className="fill-foreground text-xs font-medium"
                        formatter={(v) => Number(v).toLocaleString()}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <div className="mt-1 flex justify-around">
                  {FUNNEL_DATA.filter((d) => d.rate).map((d) => (
                    <span key={d.stage} className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary">{d.rate}</span> → {d.stage}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  By Status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-0">
                <ChartContainer config={STATUS_CONFIG} className="h-[140px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={STATUS_DATA}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={42}
                      outerRadius={62}
                      strokeWidth={2}
                    >
                      {STATUS_DATA.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={`var(--color-${entry.status})`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-1 flex flex-col gap-1 w-full">
                  {STATUS_DATA.map((entry) => (
                    <div key={entry.status} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: `var(--color-${entry.status})` }}
                        />
                        {entry.label}
                      </span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  )
}
