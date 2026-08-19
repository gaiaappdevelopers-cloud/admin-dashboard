"use client"

import { REGISTRATION_SEEKER_SCHEMA_KEY } from "@/lib/schema-model"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SingleKeySchemaManager } from "../schemas/_components/single-key-schema-manager"

export default function RegistrationsPage() {
  return (
    <>
      <TopBar title="Cadastros" />
      <main className="p-6">
        <Tabs defaultValue="seeker">
          <TabsList>
            <TabsTrigger value="seeker">Buscador</TabsTrigger>
            <TabsTrigger value="professional" disabled className="gap-1.5">
              Profissionais
              <Badge variant="outline" className="text-[10px] font-normal">
                Em breve
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="practice_space" disabled className="gap-1.5">
              Estabelecimentos
              <Badge variant="outline" className="text-[10px] font-normal">
                Em breve
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seeker" className="mt-4">
            <SingleKeySchemaManager
              schemaKey={REGISTRATION_SEEKER_SCHEMA_KEY}
              infoText="Aqui você organiza as perguntas da anamnese que o Buscador preenche
                ao criar a conta no app mobile. Assim como nos outros formulários, você
                nunca vê as respostas que os usuários escrevem, só o modelo de perguntas."
              emptyStateText="Nenhuma versão do formulário de cadastro do Buscador foi criada
                ainda. Comece criando a primeira versão."
            />
          </TabsContent>

          <TabsContent value="professional" className="mt-4">
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              O cadastro de Profissionais ainda usa campos fixos, não um formulário
              dinâmico — essa aba será ativada quando isso mudar.
            </div>
          </TabsContent>

          <TabsContent value="practice_space" className="mt-4">
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              O cadastro de Estabelecimentos ainda usa campos fixos, não um formulário
              dinâmico — essa aba será ativada quando isso mudar.
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
