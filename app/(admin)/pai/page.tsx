"use client"

import { PAI_PLAN_SCHEMA_KEY } from "@/lib/schema-model"
import { TopBar } from "@/components/top-bar"
import { SingleKeySchemaManager } from "../schemas/_components/single-key-schema-manager"

export default function PaiPage() {
  return (
    <>
      <TopBar title="PAI" />
      <main className="p-6">
        <SingleKeySchemaManager
          schemaKey={PAI_PLAN_SCHEMA_KEY}
          infoText='Aqui você organiza as perguntas do Plano de Ação de Integração
            (PAI) — o formulário que o usuário preenche depois de registrar uma
            Experiência. Assim como nos outros formulários, você nunca vê as respostas
            que os usuários escrevem, só o modelo de perguntas.'
          emptyStateText="Nenhuma versão do formulário de PAI foi criada ainda. Comece criando a
            primeira versão."
        />
      </main>
    </>
  )
}
