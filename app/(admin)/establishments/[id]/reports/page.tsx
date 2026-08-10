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
  unsafe_practice: "Prática insegura",
  misleading_information: "Informação enganosa",
  inappropriate_behavior: "Comportamento inadequado",
  other: "Outro",
}

const MOCK_ESTABLISHMENTS: Record<string, { name: string; reports: MockReport[] }> = {
  "3": {
    name: "Aldeia da Cura",
    reports: [
      {
        id: "r1",
        reporter_name: "Beatriz A.",
        category: "misleading_information",
        description: "O facilitador afirmou que a cerimônia curaria minha depressão. Isso pareceu irresponsável e perigoso.",
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
        description: "Nenhuma triagem médica foi feita antes da cerimônia. Um participante teve uma reação severa.",
        status: "pending",
        created_at: "2026-06-05T09:30:00Z",
      },
      {
        id: "r3",
        reporter_name: "Renata F.",
        category: "inappropriate_behavior",
        description: "O facilitador principal agiu de forma agressiva com um participante que queria sair mais cedo.",
        status: "pending",
        created_at: "2026-06-06T17:10:00Z",
      },
      {
        id: "r4",
        reporter_name: "Thiago M.",
        category: "misleading_information",
        description: "A divulgação prometia suporte de integração que nunca foi oferecido.",
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
    label: "Dispensar denúncia",
    description: "Marca essa denúncia como revisada, sem nenhuma outra ação. O denunciante não é notificado.",
    buttonClass: "",
  },
  warn: {
    label: "Emitir advertência",
    description: "Marca como revisada e sinaliza o estabelecimento para uma advertência formal. Isso fica registrado internamente.",
    buttonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
  },
  suspend: {
    label: "Suspender estabelecimento",
    description: "O estabelecimento fica escondido do marketplace imediatamente, aguardando investigação.",
    buttonClass: "bg-orange-600 text-white hover:bg-orange-700",
  },
  delete: {
    label: "Excluir denúncia",
    description: "Exclui essa denúncia permanentemente. Essa ação não pode ser desfeita.",
    buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
}

export default function EstablishmentReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const establishment = MOCK_ESTABLISHMENTS[id] ?? { name: `Estabelecimento #${id}`, reports: [] }

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
      <TopBar title={`Denúncias · ${establishment.name}`} />
      <main className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" asChild>
            <Link href="/establishments">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para Estabelecimentos
            </Link>
          </Button>

          {pending > 0 && (
            <Badge className="gap-1 bg-orange-500/10 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400">
              <Flag className="h-3 w-3" />
              {pending} pendente{pending === 1 ? "" : "s"}
            </Badge>
          )}

          <Badge variant="outline" className="gap-1.5 text-xs font-normal rounded-sm">
            <Flag className="h-3 w-3" />
            Em breve · dados de exemplo
          </Badge>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Denunciante</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-48" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma denúncia encontrada para esse estabelecimento.
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
                      <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400">Pendente</Badge>
                    )}
                    {report.status === "reviewed" && (
                      <Badge className="bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400">Revisada</Badge>
                    )}
                    {report.status === "dismissed" && (
                      <Badge variant="secondary">Dispensada</Badge>
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
                            Dispensar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-yellow-700 hover:text-yellow-700 hover:bg-yellow-500/10"
                            onClick={() => setConfirm({ reportId: report.id, action: "warn" })}
                          >
                            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                            Advertir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-orange-700 hover:text-orange-700 hover:bg-orange-500/10"
                            onClick={() => setConfirm({ reportId: report.id, action: "suspend" })}
                          >
                            <PauseCircle className="mr-1 h-3.5 w-3.5" />
                            Suspender
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={confirm ? ACTION_CONFIG[confirm.action].buttonClass : ""}
              onClick={handleConfirm}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
