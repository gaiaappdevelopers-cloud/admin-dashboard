import { PAI_PLAN_SCHEMA_KEY, REGISTRATION_SEEKER_SCHEMA_KEY } from "./schema-model"

export type PreviewLayout = "paginated" | "accordion_stack" | "unknown"

interface ExperienceTypeKeyLike {
  schema_key: string
  follow_up_schema_key?: string | null
}

/**
 * How the mobile app actually lays out a schema's sections — confirmed by
 * screenshots from the Flutter dev (gaia-admin/public/mobile_screenshots):
 * Experience forms show one Section per page (paginated); the Buscador
 * registration/anamnese form and the PAI's schema-driven step both stack
 * every Section as an accordion card. (PAI's other two wizard steps —
 * linking a source Experience, and picking concrete actions — aren't
 * schema-driven, so they're outside what this preview covers.)
 */
export function resolvePreviewLayout(
  schemaKey: string,
  experienceTypes: ExperienceTypeKeyLike[] | undefined
): PreviewLayout {
  if (schemaKey === REGISTRATION_SEEKER_SCHEMA_KEY) return "accordion_stack"
  if (schemaKey === PAI_PLAN_SCHEMA_KEY) return "accordion_stack"

  const isExperienceForm = experienceTypes?.some(
    (et) => et.schema_key === schemaKey || et.follow_up_schema_key === schemaKey
  )
  return isExperienceForm ? "paginated" : "unknown"
}
