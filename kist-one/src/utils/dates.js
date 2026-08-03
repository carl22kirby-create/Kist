export function dateToParts(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfWeek(date) {
  const c = new Date(date);
  const day = c.getDay();
  c.setDate(c.getDate() + (day === 0 ? -6 : 1 - day));
  return c;
}

export function addDays(date, days) {
  const c = new Date(date);
  c.setDate(c.getDate() + days);
  return c;
}

export function addMonths(date, months) {
  const c = new Date(date);
  c.setMonth(c.getMonth() + months);
  return c;
}

export function addYears(date, years) {
  const c = new Date(date);
  c.setFullYear(c.getFullYear() + years);
  return c;
}
