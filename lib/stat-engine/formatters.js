export function formatNumber(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return String(Number(value));
}

export function formatDecimal(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return Number(value).toFixed(2).replace(/\.00$/, "");
}

export function formatPercent(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${Number(value).toFixed(2).replace(/\.00$/, "")}%`;
}

export function formatBestBowling(wickets, runs) {
  if (wickets === null || wickets === undefined || runs === null || runs === undefined) {
    return "--";
  }

  return `${wickets}/${runs}`;
}

export const FORMATTERS = {
  number: formatNumber,
  decimal: formatDecimal,
  percent: formatPercent,
  text: (value) => String(value ?? "--"),
  bestBowling: (value) => formatBestBowling(value?.wickets, value?.runs)
};

export function formatValue(value, formatter = "text") {
  const formatterFn = FORMATTERS[formatter] || FORMATTERS.text;
  return formatterFn(value);
}
