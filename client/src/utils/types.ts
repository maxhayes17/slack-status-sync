export type User = {
  displayName: string;
  email: string;
};

export type Calendar = {
  id: string;
  summary: string;
  description: string;
  timezone: string;
};

type CalendarEventDate = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};
export type CalendarEvent = {
  id: string;
  summary: string;
  description: string;
  start: CalendarEventDate;
  end: CalendarEventDate;
};
