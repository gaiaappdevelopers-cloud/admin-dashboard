"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Flag,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Trash2,
} from "lucide-react"

import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ReportCategory =
  | "unsafe_practice"
  | "misleading_information"
  | "inappropriate_behavior"
  | "other"

type ReportStatus = "pending" | "reviewed" | "dismissed"

interface MockReport {
  id: string
  reporter_name: string
  category: ReportCategory
  description: string
  status: ReportStatus
  created_at: string
}

const CATEGORY_LABEL: Record<ReportCategory, string> = {
  unsafe_practice: "Unsafe practice",
  misleading_information: "Misleading information",
  inappropriate_behavior: "Inappropriate behavior",
  other: "Other",
}

const MOCK_ESTABLISHMENTS: Record<string, { name: string; reports: MockReport[] }> = {
  "3": {
    name: "Aldeia da Cura",
    reports: [
      {
        id: "r1",
        reporter_name: "Beatriz A.",
        category: "misleading_information",
        description: "The facilitator claimed the ceremony would cure my depression. This felt irresponsible and dangerous.",
        status: "pending",
        created_at: "2026-06-08T14:00:00Z",
      },
    ],
  },
  "5": {
    name: "Portal das Águas",
    reports: [
      {
        id: "r2",
        reporter_name: "Marcos T.",
        category: "unsafe_practice",
        description: "No medical screening was conducted before the ceremony. A participant had a severe reaction.",
        status: "pending",
        created_at: "2026-06-05T09:30:00Z",
      },
      {
        id: "r3",
        reporter_name: "Renata F.",
        category: "inappropriate_behavior",
        description: "The main facilitator acted aggressively toward a participant who wanted to leave early.",
        status: "pending",
        created_at: "2026-06-06T17:10:00Z",
      },
      {
        id: "r4",
        reporter_name: "Thiago M.",
        category: "misleading_information",
        description: "The advertising promised integration support that was never provided.",
        status: "reviewed",
        created_at: "2026-05-20T11:00:00Z",
      },
    ],
  },
}

type Action = "dismiss" | "warn" | "suspend" | "delete"

interface ConfirmState {
  reportId: string
  action: Action
}

const ACTION_CONFIG: Record<Action, { label: string; description: string; buttonClass: string }> = {
  dismiss: {
    label: "Dismiss report",
    description: "Mark this report as reviewed and take no further action. The reporter will not be notified.",
    buttonClass: "",
  },
  warn: {
    label: "Issue warning",
    description: "Mark this as reviewed and flag the establishment for a formal warning. This is recorded internally.",
    buttonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
  },
  suspend: {
    label: "Suspend establishment",
    description: "The establishment will be immediately hidden from the marketplace pending investigation.",
    buttonClass: "bg-orange-600 text-white hover:bg-orange-700",
  },
  delete: {
    label: "Delete report",
    description: "Permanently delete this report. This action cannot be undone.",
    buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
}

export default function EstablishmentReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const establishment = MOCK_ESTABLISHMENTS[id] ?? { name: `Establishment #${id}`, reports: [] }

  const [reports, setReports] = useState(establishment.reports)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  function handleConfirm() {
    if (!confirm) return
    const { reportId, action } = confirm

    if (action === "delete") {
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } else if (action === "dismiss") {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: "dismissed" as const } : r))
    } else {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: "reviewed" as const } : r))
    }

    setConfirm(null)
  }

  const pending = reports.filter((r) => r.status === "pending").length

  return (
    <>
      <TopBar title={`Reports · ${establishment.name}`} />
      <main className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" asChild>
            <Link href="/establishments">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Establishments
            </Link>
          </Button>

          {pending > 0 && (
            <Badge className="gap-1 bg-orange-500/10 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400">
              <Flag className="h-3 w-3" />
              {pending} pending
            </Badge>
          )}

          <Badge variant="outline" className="gap-1.5 text-xs font-normal rounded-sm">
            <Flag className="h-3 w-3" />
            Coming soon · mock data
          </Badge>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-48" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No reports found for this establishment.
                  </TableCell>
                </TableRow>
              ) : reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-sm font-medium whitespace-nowrap">{report.reporter_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABEL[report.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-sm text-sm text-muted-foreground">
                    {report.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(report.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {report.status === "pending" && (
                      <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400">Pending</Badge>
                    )}
                    {report.status === "reviewed" && (
                      <Badge className="bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400">Reviewed</Badge>
                    )}
                    {report.status === "dismissed" && (
                      <Badge variant="secondary">Dismissed</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {report.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setConfirm({ reportId: report.id, action: "dismiss" })}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Dismiss
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-yellow-700 hover:text-yellow-700 hover:bg-yellow-500/10"
                            onClick={() => setConfirm({ reportId: report.id, action: "warn" })}
                          >
                            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                            Warn
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-orange-700 hover:text-orange-700 hover:bg-orange-500/10"
                            onClick={() => setConfirm({ reportId: report.id, action: "suspend" })}
                          >
                            <PauseCircle className="mr-1 h-3.5 w-3.5" />
                            Suspend
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setConfirm({ reportId: report.id, action: "delete" })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm ? ACTION_CONFIG[confirm.action].label : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm ? ACTION_CONFIG[confirm.action].description : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirm ? ACTION_CONFIG[confirm.action].buttonClass : ""}
              onClick={handleConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
