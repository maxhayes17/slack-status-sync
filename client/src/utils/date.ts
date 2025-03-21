import dayjs from "dayjs";

export function formatDateTime(date: string | Date, allDay: boolean): string {
  const formatString = allDay ? "ddd, MMM D, YYYY" : "ddd, MMM D, YYYY h:mma";
  return dayjs(date).format(formatString);
}
