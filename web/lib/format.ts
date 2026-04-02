function parseDateValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateRange(startDate: string, endDate: string) {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);

  if (!start || !end) {
    return "Dates to be confirmed";
  }

  return new Intl.DateTimeFormat("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatRange(start, end);
}

export function formatDate(value?: string | null) {
  const date = parseDateValue(value);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

function sentenceCaseFromCode(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  OPEN_FOR_SALES: "Open for sales",
  PREPARATION: "Preparation",
  VISA_IN_PROGRESS: "Visa in progress",
  TICKETING: "Ticketing",
  READY_TO_TRAVEL: "Ready to travel",
  IN_JOURNEY: "In journey",
  RETURNED: "Returned",
  POST_TRIP: "Post trip",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
  SELLING: "Selling",
  WAITLIST: "Waitlist",
  CLOSED: "Closed",
  IN_OPERATION: "In operation",
  COMPLETED: "Completed",
  NOT_STARTED: "Not started",
  SCHEDULED: "Scheduled",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export function formatStatusLabel(status?: string | null) {
  if (!status) {
    return "Status not published";
  }

  return STATUS_LABELS[status] || sentenceCaseFromCode(status);
}

export function formatNightsLabel(nights?: number | null) {
  if (!nights && nights !== 0) {
    return null;
  }

  return `${nights} night${nights === 1 ? "" : "s"}`;
}

export function formatPackageCountLabel(packagesCount?: number | null) {
  if (!packagesCount && packagesCount !== 0) {
    return null;
  }

  return `${packagesCount} package${packagesCount === 1 ? "" : "s"}`;
}
