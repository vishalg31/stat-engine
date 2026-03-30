"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getFieldConfig, getFieldsForContext } from "@/lib/stat-engine/fieldRegistry";
import { getOperatorsForType } from "@/lib/stat-engine/operatorRegistry";

function buildDefaultValue(fieldConfig, operatorKey) {
  if (operatorKey === "between") {
    return ["", ""];
  }

  if (fieldConfig?.type === "enum") {
    return fieldConfig.options?.[0] || "";
  }

  return "";
}

export default function ConditionRow({ context, condition, onChange, onRemove, canRemove }) {
  const availableFields = getFieldsForContext(context);
  const fieldConfig = getFieldConfig(context, condition.field) || availableFields[0];
  const operatorOptions = fieldConfig ? getOperatorsForType(fieldConfig.type).filter((operator) => fieldConfig.operators.includes(operator.key)) : [];

  function handleFieldChange(nextField) {
    const nextFieldConfig = getFieldConfig(context, nextField);
    const nextOperator = nextFieldConfig?.operators?.[0] || "eq";

    onChange({
      field: nextField,
      operator: nextOperator,
      value: buildDefaultValue(nextFieldConfig, nextOperator)
    });
  }

  function handleOperatorChange(nextOperator) {
    onChange({
      ...condition,
      operator: nextOperator,
      value: buildDefaultValue(fieldConfig, nextOperator)
    });
  }

  function renderValueInput() {
    if (!fieldConfig) {
      return null;
    }

    if (condition.operator === "between") {
      const currentValue = Array.isArray(condition.value) ? condition.value : ["", ""];
      return (
        <div className="grid grid-cols-2 gap-3">
          <input
            value={currentValue[0]}
            onChange={(event) => onChange({ ...condition, value: [event.target.value, currentValue[1]] })}
            placeholder="Min"
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-300"
          />
          <input
            value={currentValue[1]}
            onChange={(event) => onChange({ ...condition, value: [currentValue[0], event.target.value] })}
            placeholder="Max"
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-300"
          />
        </div>
      );
    }

    if (fieldConfig.type === "enum") {
      return (
        <select
          value={condition.value}
          onChange={(event) => onChange({ ...condition, value: event.target.value })}
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-300"
        >
          {(fieldConfig.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        value={condition.value}
        onChange={(event) => onChange({ ...condition, value: event.target.value })}
        placeholder={fieldConfig.type === "text" ? "Enter value" : "Enter number"}
        inputMode={fieldConfig.type === "text" ? "text" : "decimal"}
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-300"
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="rounded-[20px] border border-emerald-400/14 bg-[linear-gradient(180deg,rgba(18,28,26,0.98),rgba(13,19,18,0.98))] p-3"
      >
        <div className="grid gap-2.5">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Field</span>
              <select
                value={condition.field}
                onChange={(event) => handleFieldChange(event.target.value)}
                className="h-10 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-emerald-300"
              >
                {availableFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Operator</span>
              <select
                value={condition.operator}
                onChange={(event) => handleOperatorChange(event.target.value)}
                className="h-10 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-emerald-300"
              >
                {operatorOptions.map((operator) => (
                  <option key={operator.key} value={operator.key}>
                    {operator.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Value</span>
              {renderValueInput()}
            </label>

            {canRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="h-10 rounded-2xl border border-rose-400/16 bg-rose-500/10 px-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/16"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
