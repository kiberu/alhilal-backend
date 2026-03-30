export function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return new Intl.DateTimeFormat("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatRange(start, end);
}

export function formatMoney(minorUnits?: number | null, currency = "UGX") {
  if (!minorUnits) {
    return null;
  }

  const amount = currency === "UGX" ? minorUnits : minorUnits / 100;

  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UGX" ? 0 : 2,
  }).format(amount);
}

export function formatCityList(cities: string[]) {
  return cities.join(", ");
}
