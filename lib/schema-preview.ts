import { PAI_PLAN_SCHEMA_KEY, REGISTRATION_SEEKER_SCHEMA_KEY } from "./schema-model"

export type PreviewLayout = "paginated" | "accordion_stack" | "unknown"

interface ExperienceTypeKeyLike {
  schema_key: string
  follow_up_schema_key?: string | null
}

/**
 * How the mobile app actually lays out a schema's sections — confirmed by
 * the Flutter dev: Experience forms show one Section per page (paginated);
 * the Buscador registration/anamnese form stacks every Section as an
 * accordion card on a single page. PAI's layout is still pending
 * confirmation, so it resolves to "unknown" rather than guessing.
 */
export function resolvePreviewLayout(
  schemaKey: string,
  experienceTypes: ExperienceTypeKeyLike[] | undefined
): PreviewLayout {
  if (schemaKey === REGISTRATION_SEEKER_SCHEMA_KEY) return "accordion_stack"
  if (schemaKey === PAI_PLAN_SCHEMA_KEY) return "unknown"

  const isExperienceForm = experienceTypes?.some(
    (et) => et.schema_key === schemaKey || et.follow_up_schema_key === schemaKey
  )
  return isExperienceForm ? "paginated" : "unknown"
}
