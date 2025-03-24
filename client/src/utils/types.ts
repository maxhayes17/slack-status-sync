export type User = {
  id: string;
  displayName: string;
  email: string;
};

export type CalendarColor = {
  background: string;
  foreground: string;
};

export type Calendar = {
  id: string;
  summary: string;
  description: string;
  color?: CalendarColor;
  timezone: string;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  summary: string;
  description: string;
  color?: CalendarColor;
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
  statusEmoji?: string;
};
