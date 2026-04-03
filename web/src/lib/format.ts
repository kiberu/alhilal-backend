export function formatMoney(amount: number | null, currency = "UGX"): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN_FOR_SALES: "Open for sales",
    PLANNING: "Planning",
    SELLING: "Selling",
    WAITLIST: "Waitlist",
    ON_TRACK: "On track",
    SCHEDULED: "Scheduled",
  };
  return (
    labels[status] ||
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (value) => value.toUpperCase())
  );
}

export function formatNightsLabel(value: number | null): string {
  if (value === null || value === undefined) return "";
  return `${value} night${value === 1 ? "" : "s"}`;
}

export function formatPackageCountLabel(value: number | null): string {
  if (value === null || value === undefined) return "";
  return `${value} package${value === 1 ? "" : "s"}`;
}
