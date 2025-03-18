import { getAuthHeaders } from "./auth";
import { Calendar, User, CalendarEvent } from "./types";

export const STATUS_SYNCER_SERVER_URL =
  process.env.REACT_APP_STATUS_SYNCER_SERVER_URL;

export const getUser = async (): Promise<User | void> => {
  await fetch(`${STATUS_SYNCER_SERVER_URL}/users/me`, {
    headers: await getAuthHeaders(),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      return { displayName: data.display_name, email: data.email } as User;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
};

export const getCalendars = async (): Promise<Calendar | void> => {
  await fetch(`${STATUS_SYNCER_SERVER_URL}/calendars`, {
    headers: await getAuthHeaders(),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      return {
        id: data.id,
        summary: data.summary,
        description: data.description,
        timezone: data.timezone,
      } as Calendar;
    })
    .catch((error) => {
      console.error("Error fetching calendars:", error);
    });
};

export const getCalendarEvents = async (
  calendarId: string
): Promise<CalendarEvent | void> => {
  await fetch(`${STATUS_SYNCER_SERVER_URL}/calendars/${calendarId}/events`, {
    headers: await getAuthHeaders(),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      return {
        id: data.id,
        summary: data.summary,
        description: data.description,
        start: data.start,
        end: data.end,
      } as CalendarEvent;
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
};
