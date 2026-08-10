"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle, PauseCircle, PlayCircle, Trash2, Flag, Building2 } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type EstablishmentStatus = "pending_verification" | "active" | "suspended" | "rejected"

interface MockEstablishment {
  id: string
  name: string
  responsible_name: string
  cnpj?: string
  location: string
  ritual_types: string[]
  status: EstablishmentStatus
  rejection_reason?: string
  submitted_at: string
  reports_count: number
}

const MOCK_ESTABLISHMENTS: MockEstablishment[] = [
  { id: "1", name: "Centro Espiritual Lua Nova", responsible_name: "Carlos Mendonça", cnpj: "42.891.234/0001-55", location: "São Paulo, SP", ritual_types: ["Ayahuasca", "Cacao"], status: "pending_verification", submitted_at: "2026-06-10T10:00:00Z", reports_count: 0 },
  { id: "2", name: "Casa do Caminho Interior", responsible_name: "Fernanda Lopes", location: "Florianópolis, SC", ritual_types: ["Ayahuasca"], status: "pending_verification", submitted_at: "2026-06-09T15:30:00Z", reports_count: 0 },
  { id: "3", name: "Aldeia da Cura", responsible_name: "João Paiva", cnpj: "38.120.977/0001-12", location: "Belo Horizonte, MG", ritual_types: ["Ayahuasca", "Mescaline", "Cacao"], status: "active", submitted_at: "2026-05-15T09:00:00Z", reports_count: 1 },
  { id: "4", name: "Espaço Sagrado Raízes", responsible_name: "Luciana Freitas", cnpj: "51.334.210/0001-88", location: "Curitiba, PR", ritual_types: ["Cacao", "Ayahuasca"], status: "active", submitted_at: "2026-05-10T11:45:00Z", reports_count: 0 },
  { id: "5", name: "Portal das Águas", responsible_name: "Roberto Neves", location: "Rio de Janeiro, RJ", ritual_types: ["Ayahuasca"], status: "suspended", submitted_at: "2026-04-20T08:30:00Z", reports_count: 3 },
  { id: "6", name: "Templo da Luz", responsible_name: "Sônia Barros", location: "Salvador, BA", ritual_types: ["Mescaline"], status: "rejected", rejection_reason: "CNPJ não encontrado na Receita Federal.", submitted_at: "2026-05-30T14:00:00Z", reports_count: 0 },
]

const STATUS_CONFIG: Record<EstablishmentStatus, { label: string; className: string }> = {
  pending_verification: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400" },
  active: { label: "Ativo", className: "bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400" },
  suspended: { label: "Suspenso", className: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400" },
  rejected: { label: "Rejeitado", className: "bg-destructive/10 text-destructive hover:bg-destructive/10" },
}

type Tab = "all" | EstablishmentStatus

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState(MOCK_ESTABLISHMENTS)
  const [tab, setTab] = useState<Tab>("all")
  const [rejectTarget, setRejectTarget] = useState<MockEstablishment | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<MockEstablishment | null>(null)
  const [approveTarget, setApproveTarget] = useState<MockEstablishment | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<MockEstablishment | null>(null)

  const filtered = tab === "all" ? establishments : establishments.filter((e) => e.status === tab)

  const counts = {
    all: establishments.length,
    pending_verification: establishments.filter((e) => e.status === "pending_verification").length,
    active: establishments.filter((e) => e.status === "active").length,
    suspended: establishments.filter((e) => e.status === "suspended").length,
    rejected: establishments.filter((e) => e.status === "rejected").length,
  }

  function update(id: string, patch: Partial<MockEstablishment>) {
    setEstablishments((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))
  }

  return (
    <>
      <TopBar title="Estabelecimentos" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="all">Todos <span className="ml-1.5 text-muted-foreground">{counts.all}</span></TabsTrigger>
              <TabsTrigger value="pending_verification">Pendentes <span className="ml-1.5 text-muted-foreground">{counts.pending_verification}</span></TabsTrigger>
              <TabsTrigger value="active">Ativos <span className="ml-1.5 text-muted-foreground">{counts.active}</span></TabsTrigger>
              <TabsTrigger value="suspended">Suspensos <span className="ml-1.5 text-muted-foreground">{counts.suspended}</span></TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados <span className="ml-1.5 text-muted-foreground">{counts.rejected}</span></TabsTrigger>
            </TabsList>
          </Tabs>

          <Badge variant="outline" className="gap-1.5 text-xs font-normal rounded-sm">
            <Building2 className="h-3 w-3" />
            Em breve · dados de exemplo
          </Badge>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Rituais</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum estabelecimento encontrado.
                  </TableCell>
                </TableRow>
              ) : filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.name}</p>
                    {e.cnpj && <p className="text-xs text-muted-foreground">{e.cnpj}</p>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.responsible_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{e.location}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {e.ritual_types.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.submitted_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {e.status === "rejected" && e.rejection_reason ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={`${STATUS_CONFIG[e.status].className} cursor-help`}>
                            {STATUS_CONFIG[e.status].label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 text-xs">{e.rejection_reason}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge className={STATUS_CONFIG[e.status].className}>
                        {STATUS_CONFIG[e.status].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {e.reports_count > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-orange-700 hover:text-orange-700 hover:bg-orange-500/10" asChild>
                          <Link href={`/establishments/${e.id}/reports`}>
                            <Flag className="h-3.5 w-3.5" />
                            {e.reports_count}
                          </Link>
                        </Button>
                      )}
                      {e.status === "pending_verification" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-green-700 hover:text-green-700 hover:bg-green-600/10" onClick={() => setApproveTarget(e)}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Aprovar
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => { setRejectTarget(e); setRejectReason("") }}>
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {e.status === "active" && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-orange-700 hover:text-orange-700 hover:bg-orange-500/10" onClick={() => setSuspendTarget(e)}>
                          <PauseCircle className="mr-1 h-3.5 w-3.5" />
                          Suspender
                        </Button>
                      )}
                      {e.status === "suspended" && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-green-700 hover:text-green-700 hover:bg-green-600/10" onClick={() => update(e.id, { status: "active" })}>
                          <PlayCircle className="mr-1 h-3.5 w-3.5" />
                          Reativar
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(e)}>
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

      {/* Approve */}
      <AlertDialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar `{approveTarget?.name}`?</AlertDialogTitle>
            <AlertDialogDescription>
              O estabelecimento será listado como um espaço verificado no marketplace do
              app mobile. Confirme que você revisou as informações enviadas e o CNPJ antes
              de aprovar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { update(approveTarget!.id, { status: "active" }); setApproveTarget(null) }}>
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar `{rejectTarget?.name}`?</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="reason">Motivo (enviado ao candidato)</Label>
            <Textarea id="reason" rows={3} placeholder="ex: CNPJ não encontrado na Receita Federal." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => { update(rejectTarget!.id, { status: "rejected", rejection_reason: rejectReason.trim() }); setRejectTarget(null); setRejectReason("") }}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender `{suspendTarget?.name}`?</AlertDialogTitle>
            <AlertDialogDescription>
              O estabelecimento fica escondido do marketplace enquanto estiver suspenso.
              Você pode reativá-lo a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => { update(suspendTarget!.id, { status: "suspended" }); setSuspendTarget(null) }}
            >
              Suspender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir `{deleteTarget?.name}`?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai remover o estabelecimento e todos os dados associados
              permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setEstablishments((prev) => prev.filter((e) => e.id !== deleteTarget!.id)); setDeleteTarget(null) }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
