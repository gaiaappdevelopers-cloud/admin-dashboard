import { Sparkles, Layers, FileText, BookOpen, Users, Activity, HeartHandshake, Info } from "lucide-react"

import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const cards = [
  {
    title: "Active Experience Types",
    value: "4",
    icon: Sparkles,
    description: "Live in the mobile app",
  },
  {
    title: "Published Schemas",
    value: "4",
    icon: Layers,
    description: "Active form definitions",
  },
  {
    title: "Live Pages",
    value: "6",
    icon: FileText,
    description: "Content pages in the app",
  },
  {
    title: "Blog Posts",
    value: "3 published · 2 drafts",
    icon: BookOpen,
    description: "Published content",
  },
  {
    title: "Registered Users",
    value: "1,284",
    icon: Users,
    description: "Total accounts created",
  },
  {
    title: "Experiences This Week",
    value: "342",
    icon: Activity,
    description: "Diary entries logged",
  },
  {
    title: "Research Consents",
    value: "0",
    icon: HeartHandshake,
    description: "Users opted into research",
    note: "Research consent collection is not yet active. This will update once the feature launches.",
  },
]

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard" />
      <main className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {card.note && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56 text-xs">
                        {card.note}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
