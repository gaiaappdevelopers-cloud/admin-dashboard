# GAIA Admin — Domain Glossary

## Scope of this panel

This panel is a **CMS and research dashboard**. Admins manage content (questions, copy, ordering, activation) but have no control over visual presentation — the Flutter app owns that. The panel also exposes anonymized user and Experience data to support research partnerships with universities, providing data-driven insights into psychedelic consumption patterns and trends.

The MVP ships a dashboard with real content counts and mocked user activity metrics. A future phase adds real analytics and controlled data access for research partners.

## Research consent

A user's explicit opt-in to anonymous data sharing for research purposes. Consent is requested twice: once via a disclaimer during mobile app onboarding, and again via in-app notifications before research data is collected. Participation is always anonymous and fully transparent to the user. Data shared under research consent is used to support university partnerships studying psychedelic consumption patterns.

> The admin panel does not manage consent — it is granted by users in the mobile app. The panel only consumes the resulting anonymized dataset. Research partner access to data is out of scope for this panel and will be delivered via a separate interface.

## Admin

A user with `ProfileType.ADMIN` — the only role that can access this panel. A single privilege level: full access to all create, update, and delete operations across Schemas, Pages, and ExperienceTypes.

## Experience

A single event logged by a user in the GAIA diary app. The user selects an ExperienceType, fills in a form defined by that type's active Schema, and the result is persisted as a diary entry.

> Experiences are not created or edited by the admin panel — they are managed by the mobile app. The admin panel configures the types and forms that shape how Experiences are created.

## Schema

A versioned form definition that describes the fields a user fills in when logging an Experience of a given ExperienceType. A Schema consists of one or more Sections. It is identified by a stable `schema_key` — a free-form string, snake_case by convention in the current catalog (e.g. `experience_entry_dream`).

Only one version of a Schema is **published** (active) at a time. Draft versions can be edited and deleted; a published version cannot be deleted.

The mobile app fetches the published Schema by `schema_key` when a user starts a new Experience. Publishing a new version takes effect for subsequent Experience creation sessions. ExperienceTypes reference a stable `schema_key`; updating the form means publishing a new Schema version under the same key, never changing the key itself.

When a new Schema version is published, Experiences already logged against previous versions are unaffected — they retain the form version used when they were created.

## ExperienceType

A category of Experience available to the user in the mobile app — e.g. "Dream", "Daily Reflection", "Contemplative Practice", "Transformative Experience". Each ExperienceType references a `schema_key`, pointing to the Schema that defines its form. Multiple ExperienceTypes can share the same `schema_key` if their form structure is identical.

The current active ExperienceTypes are:

- `experience_entry_dream`
- `experience_entry_reflection`
- `experience_entry_contemplative_practice`
- `experience_entry_transformative`

Legacy inactive ExperienceTypes are retained only for compatibility and must not define the future contract.

Key fields:

- `is_active` — when `false`, the type is hidden from new Experience creation. Existing Experiences created from that type remain accessible in the user's diary.
- `is_suggested` — surfaces the type prominently to new or onboarding users as a curated starting point; a subset of all active ExperienceTypes.
- `display_order` — integer controlling position in the mobile app's list. Drag-and-drop reordering requires one `PUT` per affected record.
- `icon` — semantic string key interpreted by the Flutter app. It is not an asset path and should not be treated as arbitrary text.
- `icon_color` — free-form hex color string (e.g. `#A855F7`) interpreted by the Flutter app with a safe fallback when invalid.
- `description` — appears as a subtitle beneath the title in the mobile app's ExperienceType selection list.

Supported `icon` keys for active ExperienceTypes:

- `moon` — Dream.
- `sparkles` — Daily Reflection.
- `meditation` — Contemplative Practice.
- `insight` — Transformative Experience.

The admin panel does not define the visual layout, size, typography, icon asset, or final icon composition. It only provides semantic metadata. The Flutter app owns rendering and fallback behavior.

## Page

A static content screen rendered in the mobile app (e.g. "About", "Terms of Use"). Identified by a `page_key`; each key has variants for the supported languages: `pt` (Portuguese) and `en` (English). Portuguese is the primary language — the MVP targets Brazil first, with international expansion planned later. The mobile app falls back to `pt` for unsupported locales. Deleting a Page targets a single language variant — other variants of the same `page_key` are unaffected.

## Section

A named group of form fields within a Schema. A Section organizes the form into logical blocks, but does not define the final visual presentation. Layout, styling, spacing, and component composition remain the Flutter app's responsibility.

Section fields:

- `section_key` — unique identifier of the section within the Schema.
- `section_title` — title displayed to the user.
- `section_description` — supporting description displayed with the section.
- `section_info_box` — optional contextual help block with `icon`, `title`, and `description`.
- `is_initially_expanded` — whether the section starts expanded in the form.
- `fields` — ordered list of Field definitions contained in the section.

Common section purposes in active Experience Schemas:

- Context sections: date, title, type, or opening metadata.
- Narrative sections: the main written content of the Experience.
- Integration sections: insights, next steps, emotions, themes, symbols, or meaning-making prompts.

## Field

A Field is the smallest editable unit of a dynamic form. Each Field belongs to a Section and represents one expected user input.

Field fields:

- `field_key` — unique identifier of the field within the Schema.
- `field_title` — primary label displayed to the user.
- `field_description` — optional helper text.
- `field_type` — input type rendered by the Flutter app.
- `summary_role` — optional role used by the app/backend to identify fields that summarize the Experience, such as title or description.
- `field_tooltip` — optional contextual help with `title` and `description`.
- `initial_date_strategy` — optional date initialization strategy, such as `today`.
- `storage_format` — storage format for formatted text fields, currently `markdown`.
- `max_length` — optional character limit.
- `is_field_mandatory` — whether the field is mandatory according to the Schema.
- `is_pai_eligible` — whether the field can be used as input for PAI generation or update.
- `options` — available options for selection-like fields.
- `allows_multiple_selection` — whether multiple options can be selected.
- `is_read_only` — whether the field is displayed as read-only.
- `link` — optional link to a Page, such as Terms of Use.
- `complementary_field` — optional follow-up field used when an answer requires additional detail.

Supported `field_type` values in the current contract:

- `text`
- `formatted_text`
- `date`
- `selection`
- `dropdown`
- `boolean`
- `checkbox`

Supported `summary_role` values in active Experience Schemas:

- `title`
- `description`

PAI eligibility is controlled per field through `is_pai_eligible`. In active Experience Schemas, this is used for insight and action-oriented fields such as `main_insight` and `next_step`.

## BlogPost

A long-form content article written in the admin panel and displayed in the mobile app's blog section. Managed entirely by admins — not user-generated.

MVP fields: `title`, rich text `content`, `status` (draft or published), `published_at` date, and language variants (`pt`/`en` — consistent with Pages).

> The backend endpoint is live. Blog posts are created and managed entirely through this admin panel.

**Lifecycle:** Draft → Published → (optionally) unpublished back to Draft. Deletion is permanent (no soft delete, consistent with other entities). A draft post is never visible in the mobile app; only Published posts appear.

**Editor UX:** Two-tab layout — "Edit" tab (rich text editor) and "Preview" tab (rendered HTML approximation). A prominent "Publish" button promotes a Draft to Published; a separate "Unpublish" action reverts a Published post to Draft.

**Future scope (not MVP):** categories/tags, cover image, author attribution.

## Lead

A user who has explicitly expressed interest in connecting with a Professional (therapist or psychiatrist). Leads are the primary commercial output of the platform — they are purchased by Professionals.

**Generation flow:**
1. User completes an Experience.
2. At the end of the Experience flow, the user is offered the option to create a PAI.
3. If the user chooses to create a PAI, the PAI creation screen opens with a disclaimer/header: *"Would you like to be connected with a professional?"*
4. Answering yes creates a Lead.

This funnel ensures lead quality: only users who completed an Experience, chose to do integration work (PAI), and actively requested professional support become Leads. Each step filters for higher intent.

> The admin dashboard should surface lead volume and growth prominently — this data is the primary sales argument when onboarding new Professionals. Backend modeling for Leads is pending.

## Professional

A therapist or psychiatrist who purchases access to Leads generated by the platform. Professionals are a paying user type — the app's primary revenue source in the MVP phase.

**Verification states:** `pending_verification` → `active` | `rejected`

A Professional account is never activated automatically. It must pass through a manual admin review before gaining access to leads.

**MVP registration flow:**
1. Professional signs up via the mobile app (separate interface from the standard user flow), submitting: full name, specialty (`psychologist` or `psychiatrist`), professional register number (CRP for psychologists, CRM + RQE for psychiatrists), and state/region.
2. Account is created in `pending_verification` state — no access to leads.
3. Admin reviews the application in the admin panel verification queue.
4. Admin manually cross-checks the CRP/CRM number against the public federal register (CFP at cfp.org.br for psychologists; CFM at cfm.org.br for psychiatrists).
5. Admin approves → account activates. Admin rejects → account flagged with a reason, applicant notified by email.

**Admin panel responsibilities (MVP):**
- Verification queue: list of pending applications with submitted credentials
- Approve / reject with optional reason note
- View active professionals and their subscription status
- Deactivate or delete accounts

**Future implementations:**
- Automated CRP/CRM validation via web scraping or public register API (if exposed)
- Document upload: diploma, specialty certificate, RQE for psychiatrists
- Specialty tags (trauma, addiction, grief, etc.) for lead matching by area of expertise
- Subscription and billing management visible in the admin panel
- Lead assignment rules: geography, specialty, availability

---

## Establishment

A venue or organization that hosts indigenous ritual experiences — ayahuasca, mescaline, cacao ceremonies, and similar practices rooted in Brazilian indigenous culture. Establishments are the second commercial user type. The platform functions as a regulated marketplace (similar to Airbnb), connecting new practitioners with vetted ceremony spaces.

Ayahuasca ceremonies are legal in Brazil for religious use (CONAD ruling, 2010), but establishments are not formally licensed businesses in the traditional sense. Verification therefore relies on legal business registration and admin judgment rather than a single authoritative register.

**Verification states:** `pending_verification` → `active` | `rejected` | `suspended`

**MVP registration flow:**
1. Establishment representative signs up via the mobile app (separate interface), submitting: responsible person's full name and CPF, establishment name, CNPJ (if registered as a legal entity), location, description, and types of rituals offered.
2. Account created in `pending_verification` state.
3. Admin reviews the application: validates CNPJ via Receita Federal (if provided), reviews submitted information and description.
4. Admin approves or rejects with a reason note.
5. Approved establishments are listed as vetted spaces in the marketplace section of the mobile app.

**Admin panel responsibilities (MVP):**
- Verification queue for pending establishment applications
- Approve / reject / suspend accounts
- View all active establishments with their profile and status
- Read and act on user reports (see Report)
- Delete accounts permanently

**Future implementations:**
- Automated CNPJ validation via Receita Federal API
- Photo and document upload for the physical space and responsible persons
- Community ratings and reviews aggregated in the admin panel
- Event calendar management (upcoming ceremonies, capacity)
- Geolocation and map view in the admin panel

---

## Report

A user-submitted complaint about an Establishment. Submitted from the mobile app after or during engagement with a listed space. Reports are visible only to admins — they are not public.

A Report contains: the reporting user (anonymous by default), the target Establishment, a category (e.g. `safety`, `misrepresentation`, `misconduct`, `other`), a free-text description, and a timestamp.

**Admin actions upon receiving a report:**
- Review and dismiss (no action needed)
- Warn the establishment (internal note, no automatic notification in MVP)
- Suspend the establishment account (account hidden from marketplace while under review)
- Delete the establishment account permanently

Multiple reports against the same establishment should be surfaced together in the admin panel so patterns are visible across individual incidents.

## Dynamic Forms and App Store Strategy

The Schema versioning system exists partly for regulatory reasons: by defining forms as remote JSON fetched at runtime rather than compiled into the app, the admin can update question sets, add or remove fields, and change form structure without triggering an App Store review cycle. This is critical for a psychedelic-adjacent app where static content referencing specific substances could invite rejection or removal. The Flutter app renders whatever the published Schema defines; the admin controls the content without touching the binary.

## PAI (Plano de Ação de Integração)

An Integration Action Plan — a user-authored document built from the `is_pai_eligible` fields of a completed Experience (e.g. main insight, next step). It is presented as a separate screen in the mobile app and can be updated by the user after the Experience is submitted. Edits to the PAI do not modify the original Experience.

> Not managed by the admin panel. The admin configures which fields are PAI-eligible via the Schema; the user owns their PAI content entirely.
