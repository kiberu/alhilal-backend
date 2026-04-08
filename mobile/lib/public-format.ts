function numberOrNull(value: number | null | undefined) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

export function formatPublicMoney(amount: number | null | undefined, currency = 'UGX'): string {
  const safeAmount = numberOrNull(amount);
  if (safeAmount === null) {
    return 'Price shared on request';
  }

  return `${currency} ${safeAmount.toLocaleString('en-UG', {
    maximumFractionDigits: 0,
  })}`;
}

export function formatPublicDate(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatPublicDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate || !endDate) {
    return 'Dates to be confirmed';
  }

  const start = formatPublicDate(startDate);
  const end = formatPublicDate(endDate);
  if (!start || !end) {
    return 'Dates to be confirmed';
  }

  return `${start} - ${end}`;
}

export function formatPublicStatusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    OPEN_FOR_SALES: 'Open for sales',
    PLANNING: 'Planning',
    SELLING: 'Selling',
    WAITLIST: 'Waitlist',
    ON_TRACK: 'On track',
    SCHEDULED: 'Scheduled',
  };

  if (!status) {
    return 'Status to be confirmed';
  }

  return (
    labels[status] ||
    status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (value) => value.toUpperCase())
  );
}

export function formatPublicNightsLabel(value: number | null | undefined): string {
  const safeValue = numberOrNull(value);
  if (safeValue === null) {
    return 'Duration to be confirmed';
  }

  return `${safeValue} night${safeValue === 1 ? '' : 's'}`;
}

export function formatPublicPackageCountLabel(value: number | null | undefined): string {
  const safeValue = numberOrNull(value);
  if (safeValue === null) {
    return 'Packages to be confirmed';
  }

  return `${safeValue} package${safeValue === 1 ? '' : 's'}`;
}

export function sortPublicTrips<T extends { featured?: boolean; start_date?: string }>(trips: T[]): T[] {
  return [...trips].sort((left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
      return left.featured ? -1 : 1;
    }

    return String(left.start_date || '').localeCompare(String(right.start_date || ''));
  });
}
