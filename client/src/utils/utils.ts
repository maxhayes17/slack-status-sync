import { getAuthHeaders } from "./auth";
import { Calendar, User, CalendarEvent } from "./types";

export const STATUS_SYNCER_SERVER_URL =
  process.env.REACT_APP_STATUS_SYNCER_SERVER_URL;

export const getUser = async (): Promise<User | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/users/me`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    console.log(data);
    return { displayName: data.display_name, email: data.email } as User;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getCalendars = async (): Promise<Calendar[] | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/calendars`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    const calendars = data.map((calendar: any) => {
      return {
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        timezone: calendar.timezone,
      } as Calendar;
    });
    console.log(calendars);
    return calendars;
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return null;
  }
};

export const getCalendarEvents = async (
  calendarId: string
): Promise<CalendarEvent[] | null> => {
  try {
    const resp = await fetch(
      `${STATUS_SYNCER_SERVER_URL}/calendars/${calendarId}/events`,
      {
        headers: await getAuthHeaders(),
      }
    );
    const data = await resp.json();
    console.log(data);
    return data.map((event: any) => {
      return {
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
      } as CalendarEvent;
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return null;
  }
};
