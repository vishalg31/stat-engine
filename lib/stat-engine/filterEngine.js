import { getFieldConfig } from "./fieldRegistry";
import { getOperatorConfig } from "./operatorRegistry";
import { buildQueryPreview } from "./queryPreview";

function normalizeBetweenValue(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  if (rawValue && typeof rawValue === "object") {
    return [rawValue.min, rawValue.max];
  }

  return [rawValue, rawValue];
}

function normalizeInputValue(fieldConfig, operatorKey, rawValue) {
  if (operatorKey === "between") {
    return normalizeBetweenValue(rawValue);
  }

  if (fieldConfig?.type === "number" || fieldConfig?.type === "year") {
    return Number(rawValue);
  }

  return rawValue;
}

export function evaluateCondition({ context, record, condition }) {
  const fieldConfig = getFieldConfig(context, condition.field);
  const operatorConfig = getOperatorConfig(condition.operator);

  if (!fieldConfig || !operatorConfig) {
    return false;
  }

  if (!fieldConfig.operators.includes(condition.operator)) {
    return false;
  }

  const fieldValue = record[condition.field];

  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  return operatorConfig.test(fieldValue, normalizeInputValue(fieldConfig, condition.operator, condition.value));
}

export function filterDataset({ context, dataset, conditions = [] }) {
  const activeConditions = conditions.filter(
    (condition) => condition?.field && condition?.operator && condition?.value !== undefined && condition?.value !== null && condition?.value !== ""
  );

  const results =
    activeConditions.length === 0
      ? dataset
      : dataset.filter((record) =>
          activeConditions.every((condition) => evaluateCondition({ context, record, condition }))
        );

  return {
    results,
    total: results.length,
    preview: buildQueryPreview({ context, conditions: activeConditions })
  };
}
