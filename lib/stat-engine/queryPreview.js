import { getFieldConfig } from "./fieldRegistry";
import { getOperatorConfig } from "./operatorRegistry";

const CONTEXT_LABELS = {
  career: "career players",
  season: "season records",
  teamSeason: "team-season records",
  battingInnings: "batting innings",
  bowlingInnings: "bowling innings",
  matchup: "matchups"
};

function formatConditionValue(operatorKey, value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (operatorKey === "between") {
    const [minValue, maxValue] = Array.isArray(value) ? value : [value?.min, value?.max];
    return `${minValue} and ${maxValue}`;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

export function buildConditionPreview(context, condition) {
  const fieldConfig = getFieldConfig(context, condition.field);
  const operatorConfig = getOperatorConfig(condition.operator);

  if (!fieldConfig || !operatorConfig) {
    return null;
  }

  return `${fieldConfig.label} ${operatorConfig.label} ${formatConditionValue(condition.operator, condition.value)}`.trim();
}

export function buildQueryPreview({ context, conditions }) {
  const activeConditions = (conditions || [])
    .map((condition) => buildConditionPreview(context, condition))
    .filter(Boolean);

  if (activeConditions.length === 0) {
    return `Showing all ${CONTEXT_LABELS[context] || "records"}`;
  }

  return `Showing ${CONTEXT_LABELS[context] || "records"} with ${activeConditions.join(" AND ")}`;
}
