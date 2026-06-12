"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Trash2, ExternalLink, Stethoscope } from "lucide-react"

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

type ProfessionalStatus = "pending_verification" | "active" | "rejected"

interface MockProfessional {
  id: string
  name: string
  specialty: "psychologist" | "psychiatrist"
  register_type: "CRP" | "CRM"
  register_number: string
  register_state: string
  status: ProfessionalStatus
  rejection_reason?: string
  submitted_at: string
}

const MOCK_PROFESSIONALS: MockProfessional[] = [
  { id: "1", name: "Dra. Camila Rocha", specialty: "psychiatrist", register_type: "CRM", register_number: "CRM-SP 187432", register_state: "SP", status: "pending_verification", submitted_at: "2026-06-10T14:22:00Z" },
  { id: "2", name: "Dr. Rafael Menezes", specialty: "psychologist", register_type: "CRP", register_number: "CRP-06 98721/4", register_state: "SP", status: "pending_verification", submitted_at: "2026-06-09T09:45:00Z" },
  { id: "3", name: "Dra. Juliana Alves", specialty: "psychologist", register_type: "CRP", register_number: "CRP-05 52341/3", register_state: "RJ", status: "active", submitted_at: "2026-05-28T11:10:00Z" },
  { id: "4", name: "Dr. Marcos Ferreira", specialty: "psychiatrist", register_type: "CRM", register_number: "CRM-MG 234910", register_state: "MG", status: "active", submitted_at: "2026-05-20T16:30:00Z" },
  { id: "5", name: "Dra. Ana Beatriz Costa", specialty: "psychologist", register_type: "CRP", register_number: "CRP-08 11234/5", register_state: "RS", status: "rejected", rejection_reason: "Número de CRP não encontrado no cadastro do CFP.", submitted_at: "2026-06-01T10:00:00Z" },
]

const STATUS_CONFIG: Record<ProfessionalStatus, { label: string; className: string }> = {
  pending_verification: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400" },
  active: { label: "Active", className: "bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive hover:bg-destructive/10" },
}

const REGISTER_URL: Record<"CRP" | "CRM", string> = {
  CRP: "https://cadastro.cfp.org.br",
  CRM: "https://portal.cfm.org.br/busca-medicos",
}

type Tab = "all" | ProfessionalStatus

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState(MOCK_PROFESSIONALS)
  const [tab, setTab] = useState<Tab>("all")
  const [rejectTarget, setRejectTarget] = useState<MockProfessional | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<MockProfessional | null>(null)
  const [approveTarget, setApproveTarget] = useState<MockProfessional | null>(null)

  const filtered = tab === "all" ? professionals : professionals.filter((p) => p.status === tab)

  const counts = {
    all: professionals.length,
    pending_verification: professionals.filter((p) => p.status === "pending_verification").length,
    active: professionals.filter((p) => p.status === "active").length,
    rejected: professionals.filter((p) => p.status === "rejected").length,
  }

  function handleApprove() {
    if (!approveTarget) return
    setProfessionals((prev) =>
      prev.map((p) => p.id === approveTarget.id ? { ...p, status: "active" as const } : p)
    )
    setApproveTarget(null)
  }

  function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return
    setProfessionals((prev) =>
      prev.map((p) =>
        p.id === rejectTarget.id
          ? { ...p, status: "rejected" as const, rejection_reason: rejectReason.trim() }
          : p
      )
    )
    setRejectTarget(null)
    setRejectReason("")
  }

  function handleDelete() {
    if (!deleteTarget) return
    setProfessionals((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <>
      <TopBar title="Professionals" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="all">All <span className="ml-1.5 text-muted-foreground">{counts.all}</span></TabsTrigger>
              <TabsTrigger value="pending_verification">Pending <span className="ml-1.5 text-muted-foreground">{counts.pending_verification}</span></TabsTrigger>
              <TabsTrigger value="active">Active <span className="ml-1.5 text-muted-foreground">{counts.active}</span></TabsTrigger>
              <TabsTrigger value="rejected">Rejected <span className="ml-1.5 text-muted-foreground">{counts.rejected}</span></TabsTrigger>
            </TabsList>
          </Tabs>

          <Badge variant="outline" className="gap-1.5 text-xs font-normal rounded-sm">
            <Stethoscope className="h-3 w-3" />
            Coming soon · mock data
          </Badge>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Register</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pl-4">Status</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No professionals found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {p.specialty}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs">{p.register_number}</code>
                      <a
                        href={REGISTER_URL[p.register_type]}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Verify on ${p.register_type === "CRP" ? "CFP" : "CFM"}`}
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.register_state}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(p.submitted_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {p.status === "rejected" && p.rejection_reason ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={`${STATUS_CONFIG[p.status].className} cursor-help`}>
                            {STATUS_CONFIG[p.status].label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 text-xs">{p.rejection_reason}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge className={STATUS_CONFIG[p.status].className}>
                        {STATUS_CONFIG[p.status].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "pending_verification" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-700 hover:text-green-700 hover:bg-green-600/10"
                            onClick={() => setApproveTarget(p)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => { setRejectTarget(p); setRejectReason("") }}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
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

      {/* Approve */}
      <AlertDialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {approveTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Make sure you have verified {approveTarget?.register_number} on the{" "}
              {approveTarget?.register_type === "CRP" ? "CFP" : "CFM"} register before approving.
              The account will be activated immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.name}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="reason">Reason (sent to the applicant)</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="e.g. Register number not found in the CFP database."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
