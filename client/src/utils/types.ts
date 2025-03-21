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

export type CalendarEvent = {
  id: string;
  calendarId: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
};

export type StatusEvent = {
  id: string;
  calendarId: string;
  eventId: string;
  start: string;
  end: string;
  statusText: string;
  statusEmoji: string;
};
