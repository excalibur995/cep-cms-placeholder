# CEP DDD Update Recommendations

Scope: update `CEP_Detailed_Design_Document_CMS_v1.1.0.docx` with the notification-template collection design.
STP-related content is excluded throughout.

---

## What to do

Three sections already exist in the document with thin placeholder content. Update them as described below.

---

## Revision History — update the v1.1.0 row

| Version | Effective Date | Summary of Changes |
|---|---|---|
| 1.1.0 | 17/06/26 | Updated notification-template schema definition across Sections 3.1.3, 3.2.1, and 5.1 including full field reference |

---

## Section 3.2.1 — Configurable Content Types (update existing row)

Find the existing row:

> `Notification Template | Collection Type | A versioned record of a notification template -- used by MBPNS`

**Replace the description with:**

> A versioned record that stores multi-channel notification content for a single notification event. Each record is identified by a `templateId` and manages content for four delivery channels: push notification (title + body, two variants), web inbox (subject, message, details), email (subject, plain-text body, HTML body), and SMS (message). Locale variants (e.g. `en`, `id`) are managed through the Strapi i18n plugin — one record per `templateId`, with editors switching locale in the admin UI to author language-specific content. Non-display fields (category classification, icon name, email auth, image references) are shared across all locales. Records are versioned and follow the standard draft → review → publish lifecycle before being consumed by MBPNS.

---

## Section 5.1 — Logical Data Model (update existing row + add field reference)

**Update the existing row** (currently "Stores reusable notification message templates for MBPNS consumption"):

| Collection Type | Purpose |
|---|---|
| notification-template | Stores multi-channel notification content identified by `templateId` and `version`. Manages push, web inbox, email, and SMS channel fields as flat top-level attributes. Locale variants are handled via the Strapi i18n plugin. Consumed by MBPNS for customer communications. |

**Add a new sub-section** after the main Logical Data Model table prose, before the Data Flow Diagrams heading:

### notification-template — Field Reference

The `notification-template` collection uses flat top-level attributes mirroring the MBPNS notification spec table. Fields are divided into localized (per-locale content) and non-localized (shared identifiers and configuration).

**Identity and classification (non-localized):**

| Attribute | Type | Required | Description |
|---|---|---|---|
| `templateId` | string | Yes | Kebab-case domain identifier (e.g. `kta-otp-success`). Shared across all locales. |
| `version` | integer | No | Schema version. Incremented on breaking changes. |
| `categoryTitle` | enum | Yes | Overall category: `Alert`, `Promotion`, `Transaction`, `Action` |
| `subCategoryTitle` | string | Yes | Sub-category label within the category |
| `iconName` | string | No | Icon identifier for the sub-category |
| `note` | text | No | Internal authoring note; not delivered to consumers |

**Push notification (localized):**

| Attribute | Type | Description |
|---|---|---|
| `pushTitle1` | string | Primary push title |
| `pushMsg1` | text | Primary push message body |
| `pushTitle2` | string | Secondary push title (alternate variant) |
| `pushMsg2` | text | Secondary push message body |

**Web inbox (localized content / non-localized config):**

| Attribute | Type | Localized | Description |
|---|---|---|---|
| `webInboxSubject` | string | Yes | Inbox notification subject |
| `webInboxMsg` | text | Yes | Inbox message body |
| `webInboxDetails` | string | Yes | Additional detail text |
| `webInboxIsHtml` | boolean | No | Whether the inbox message is rendered as HTML |
| `webInboxTemplateId` | integer | No | External web inbox template reference ID |

**Email (localized content / non-localized config):**

| Attribute | Type | Localized | Description |
|---|---|---|---|
| `emailSubject` | string | Yes | Email subject line |
| `emailMsg` | text | Yes | Plain-text email body |
| `emailMsgHtml` | richtext | Yes | HTML email body (WYSIWYG-authored in admin) |
| `emailIsHtml` | boolean | No | Whether to send the HTML body; required field |
| `emailAuth` | string | No | Email authentication/sender identifier; shared across locales |
| `emailImages` | text | No | Comma-separated image URL references; shared across locales |

**SMS (localized):**

| Attribute | Type | Description |
|---|---|---|
| `smsMsg` | text | SMS message text |

**Promotional (non-localized):**

| Attribute | Type | Description |
|---|---|---|
| `promoImages` | text | Comma-separated promotional image URL references |

---

## Section 3.1.3 — Notification Template (add prose under the existing diagram)

The section currently has only a sequence diagram image. Add this description immediately below the diagram:

> The notification template sequence describes how MBPNS retrieves CMS-managed notification content. When a notification event is triggered, MBPNS calls the CMS `notification-template` API using the `templateId` and the target `locale` as query parameters. The CMS returns the fully resolved notification record for that locale, including all applicable channel fields (push, web inbox, email, SMS). MBPNS selects the relevant channel fields for the notification being dispatched and uses them to compose the outbound message.
>
> When notification template content is updated and published in Strapi, the outbound webhook notifies MBPNS so it can invalidate any locally cached template records. MBPNS is responsible for re-fetching the updated content from the CMS before dispatching subsequent notifications.
