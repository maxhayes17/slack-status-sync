export type User = {
  id: string;
  display_name: string;
  email: string;
  slack_user_id?: string;
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
  calendar_id: string;
  summary: string;
  description: string;
  color?: CalendarColor;
  start: string;
  end: string;
  all_day: boolean;
};

export type Emoji = {
  name: string;
  path: string;
};

export type StatusEvent = {
  id: string;
  user_id: string;
  calendar_id: string;
  event_id: string;
  start: string;
  end: string;
  status_text: string;
  status_emoji?: Emoji;
};
