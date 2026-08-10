"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"

import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LeadStatus = "new" | "assigned" | "contacted"

interface MockLead {
  id: string
  created_at: string
  experience_type: string
  experience_type_key: string
  status: LeadStatus
  pai_summary: string
}

const MOCK_LEADS: MockLead[] = [
  { id: "1", created_at: "2026-06-11T09:14:00Z", experience_type: "Experiência Transformadora", experience_type_key: "experience_entry_transformative", status: "new", pai_summary: "Processando uma mudança significativa de perspectiva após uma cerimônia." },
  { id: "2", created_at: "2026-06-10T21:45:00Z", experience_type: "Reflexão do Dia", experience_type_key: "experience_entry_reflection", status: "assigned", pai_summary: "Padrões recorrentes de ansiedade identificados, buscando orientação profissional." },
  { id: "3", created_at: "2026-06-10T14:30:00Z", experience_type: "Sonho", experience_type_key: "experience_entry_dream", status: "contacted", pai_summary: "Sonho recorrente e vívido com resíduo emocional, quer explorar terapeuticamente." },
  { id: "4", created_at: "2026-06-09T18:22:00Z", experience_type: "Experiência Transformadora", experience_type_key: "experience_entry_transformative", status: "new", pai_summary: "Experiência difícil com desconforto emocional persistente." },
  { id: "5", created_at: "2026-06-09T11:05:00Z", experience_type: "Prática Contemplativa", experience_type_key: "experience_entry_contemplative_practice", status: "assigned", pai_summary: "Buscando apoio para integrar percepções de um retiro longo." },
  { id: "6", created_at: "2026-06-08T20:10:00Z", experience_type: "Reflexão do Dia", experience_type_key: "experience_entry_reflection", status: "contacted", pai_summary: "Processo de luto após uma perda pessoal, quer apoio profissional." },
  { id: "7", created_at: "2026-06-07T16:33:00Z", experience_type: "Experiência Transformadora", experience_type_key: "experience_entry_transformative", status: "new", pai_summary: "Primeira experiência em cerimônia, se sentindo sobrecarregado e curioso." },
]

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "Novo", className: "bg-primary/10 text-primary hover:bg-primary/10" },
  assigned: { label: "Atribuído", className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400" },
  contacted: { label: "Contatado", className: "bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400" },
}

type Tab = "all" | LeadStatus

export default function LeadsPage() {
  const [tab, setTab] = useState<Tab>("all")

  const filtered = tab === "all" ? MOCK_LEADS : MOCK_LEADS.filter((l) => l.status === tab)

  const counts = {
    all: MOCK_LEADS.length,
    new: MOCK_LEADS.filter((l) => l.status === "new").length,
    assigned: MOCK_LEADS.filter((l) => l.status === "assigned").length,
    contacted: MOCK_LEADS.filter((l) => l.status === "contacted").length,
  }

  return (
    <>
      <TopBar title="Leads" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="all">Todos <span className="ml-1.5 text-muted-foreground">{counts.all}</span></TabsTrigger>
              <TabsTrigger value="new">Novos <span className="ml-1.5 text-muted-foreground">{counts.new}</span></TabsTrigger>
              <TabsTrigger value="assigned">Atribuídos <span className="ml-1.5 text-muted-foreground">{counts.assigned}</span></TabsTrigger>
              <TabsTrigger value="contacted">Contatados <span className="ml-1.5 text-muted-foreground">{counts.contacted}</span></TabsTrigger>
            </TabsList>
          </Tabs>

          <Badge variant="outline" className="gap-1.5 text-xs font-normal rounded-sm">
            <TrendingUp className="h-3 w-3" />
            Em breve · dados de exemplo
          </Badge>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo de experiência</TableHead>
                <TableHead>Resumo do PAI</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.experience_type}</span>
                  </TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">
                    {lead.pai_summary}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_CONFIG[lead.status].className}>
                      {STATUS_CONFIG[lead.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  )
}
