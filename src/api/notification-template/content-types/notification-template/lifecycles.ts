import { errors } from "@strapi/utils";

const SUBCATEGORY_MAP: Record<string, string[]> = {
  Alert: [
    "System announcements",
    "Tips and education",
    "Reminders",
    "Status update",
    "Opt-in alerts",
    "Awards & prize",
    "Requests received",
    "Actionable-to-dos",
    "System-Security",
  ],
  Transaction: ["Money-in", "Money-out"],
  Promo: [],
};

function validate(data: Record<string, unknown>) {
  const category = data.categoryTitle as string | undefined;
  const sub = data.subCategoryTitle as string | undefined | null;
  if (!category) return;

  const allowed = SUBCATEGORY_MAP[category];
  if (allowed === undefined) return;

  if (allowed.length === 0) {
    if (sub) {
      throw new errors.ValidationError(
        `categoryTitle "Promo" does not use subcategories — leave subCategoryTitle empty.`
      );
    }
  } else {
    if (sub && !allowed.includes(sub)) {
      throw new errors.ValidationError(
        `"${sub}" is not a valid subCategoryTitle for "${category}". Allowed values: ${allowed.join(", ")}.`
      );
    }
  }
}

export default {
  beforeCreate({ params }: { params: { data: Record<string, unknown> } }) {
    validate(params.data);
  },
  beforeUpdate({ params }: { params: { data: Record<string, unknown> } }) {
    validate(params.data);
  },
};
