export const OPERATOR_REGISTRY = {
  gt: {
    key: "gt",
    label: ">",
    types: ["number", "year"],
    test: (fieldValue, inputValue) => Number(fieldValue) > Number(inputValue)
  },
  gte: {
    key: "gte",
    label: ">=",
    types: ["number", "year"],
    test: (fieldValue, inputValue) => Number(fieldValue) >= Number(inputValue)
  },
  lt: {
    key: "lt",
    label: "<",
    types: ["number", "year"],
    test: (fieldValue, inputValue) => Number(fieldValue) < Number(inputValue)
  },
  lte: {
    key: "lte",
    label: "<=",
    types: ["number", "year"],
    test: (fieldValue, inputValue) => Number(fieldValue) <= Number(inputValue)
  },
  eq: {
    key: "eq",
    label: "=",
    types: ["number", "text", "enum", "year"],
    test: (fieldValue, inputValue) => fieldValue === inputValue
  },
  between: {
    key: "between",
    label: "between",
    types: ["number", "year"],
    test: (fieldValue, inputValue) => {
      const [minValue, maxValue] = Array.isArray(inputValue)
        ? inputValue
        : [inputValue?.min, inputValue?.max];
      return Number(fieldValue) >= Number(minValue) && Number(fieldValue) <= Number(maxValue);
    }
  },
  is: {
    key: "is",
    label: "is",
    types: ["text", "enum"],
    test: (fieldValue, inputValue) =>
      String(fieldValue || "").toLowerCase() === String(inputValue || "").toLowerCase()
  },
  isNot: {
    key: "isNot",
    label: "is not",
    types: ["text", "enum"],
    test: (fieldValue, inputValue) =>
      String(fieldValue || "").toLowerCase() !== String(inputValue || "").toLowerCase()
  },
  contains: {
    key: "contains",
    label: "contains",
    types: ["text"],
    test: (fieldValue, inputValue) =>
      String(fieldValue || "").toLowerCase().includes(String(inputValue || "").toLowerCase())
  },
  in: {
    key: "in",
    label: "in",
    types: ["enum", "text"],
    test: (fieldValue, inputValue) => {
      const values = Array.isArray(inputValue) ? inputValue : [inputValue];
      return values.map((value) => String(value).toLowerCase()).includes(String(fieldValue || "").toLowerCase());
    }
  }
};

export function getOperatorConfig(operatorKey) {
  return OPERATOR_REGISTRY[operatorKey] || null;
}

export function getOperatorsForType(fieldType) {
  return Object.values(OPERATOR_REGISTRY).filter((operator) => operator.types.includes(fieldType));
}
