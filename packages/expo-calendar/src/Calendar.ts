import { UnavailabilityError } from '@unimodules/core';
import {
  PermissionResponse,
  PermissionStatus,
  PermissionHookOptions,
  createPermissionHook,
} from 'expo-modules-core';
import { Platform, processColor } from 'react-native';

import ExpoCalendar from './ExpoCalendar';

export type RecurringEventOptions = {
  futureEvents?: boolean;
  instanceStartDate?: string | Date;
}; // iOS

export interface Calendar {
  id: string;
  title: string;
  sourceId?: string; // iOS
  source: Source;
  type?: string; // iOS
  color: string;
  entityType?: string; // iOS
  allowsModifications: boolean;
  allowedAvailabilities: string[];
  isPrimary?: boolean; // Android
  name?: string | null; // Android
  ownerAccount?: string; // Android
  timeZone?: string; // Android
  allowedReminders?: string[]; // Android
  allowedAttendeeTypes?: string[]; // Android
  isVisible?: boolean; // Android
  isSynced?: boolean; // Android
  accessLevel?: string; // Android
}

export type Source = {
  id?: string; // iOS only ??
  type: string;
  name: string;
  isLocalAccount?: boolean; // Android
};

export type Event = {
  id: string;
  calendarId: string;
  title: string;
  location: string;
  creationDate?: string | Date; // iOS
  lastModifiedDate?: string | Date; // iOS
  timeZone: string;
  endTimeZone?: string; // Android
  url?: string; // iOS
  notes: string;
  alarms: Alarm[];
  recurrenceRule: RecurrenceRule;
  startDate: string | Date;
  endDate: string | Date;
  originalStartDate?: string | Date; // iOS
  isDetached?: boolean; // iOS
  allDay: boolean;
  availability: string; // Availability
  status: string; // Status
  organizer?: string; // Organizer - iOS
  organizerEmail?: string; // Android
  accessLevel?: string; // Android,
  guestsCanModify?: boolean; // Android,
  guestsCanInviteOthers?: boolean; // Android
  guestsCanSeeGuests?: boolean; // Android
  originalId?: string; // Android
  instanceId?: string; // Android
};

export interface Reminder {
  id?: string;
  calendarId?: string;
  title?: string;
  location?: string;
  creationDate?: string | Date;
  lastModifiedDate?: string | Date;
  timeZone?: string;
  url?: string;
  notes?: string;
  alarms?: Alarm[];
  recurrenceRule?: RecurrenceRule;
  startDate?: string | Date;
  dueDate?: string | Date;
  completed?: boolean;
  completionDate?: string | Date;
}

export type Attendee = {
  id?: string; // Android
  isCurrentUser?: boolean; // iOS
  name: string;
  role: string;
  status: string;
  type: string;
  url?: string; // iOS
  email?: string; // Android
};

export type Alarm = {
  absoluteDate?: string; // iOS
  relativeOffset?: number;
  structuredLocation?: {
    // iOS
    title?: string;
    proximity?: string; // Proximity
    radius?: number;
    coords?: {
      latitude?: number;
      longitude?: number;
    };
  };
  method?: string; // Method, Android
};

export enum DayOfTheWeek {
  Sunday = 1,
  Monday = 2,
  Tuesday = 3,
  Wednesday = 4,
  Thursday = 5,
  Friday = 6,
  Saturday = 7,
}

export enum MonthOfTheYear {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

export type RecurrenceRule = {
  frequency: string; // Frequency
  interval?: number;
  endDate?: string | Date;
  occurrence?: number;

  daysOfTheWeek?: { dayOfTheWeek: DayOfTheWeek; weekNumber?: number }[];
  daysOfTheMonth?: number[];
  monthsOfTheYear?: MonthOfTheYear[];
  weeksOfTheYear?: number[];
  daysOfTheYear?: number[];
  setPositions?: number[];
};

export { PermissionResponse, PermissionStatus, PermissionHookOptions };

type OptionalKeys<T> = {
  [P in keyof T]?: T[P] | null;
};

/**
 * Returns whether the Calendar API is enabled on the current device. This does not check the app permissions.
 *
 * @returns Async `boolean`, indicating whether the Calendar API is available on the current device. Currently this resolves `true` on iOS and Android only.
 */
export async function isAvailableAsync(): Promise<boolean> {
  return !!ExpoCalendar.getCalendarsAsync;
}

export async function getCalendarsAsync(entityType?: string): Promise<Calendar[]> {
  if (!ExpoCalendar.getCalendarsAsync) {
    throw new UnavailabilityError('Calendar', 'getCalendarsAsync');
  }
  if (!entityType) {
    return ExpoCalendar.getCalendarsAsync(null);
  }
  return ExpoCalendar.getCalendarsAsync(entityType);
}

export async function createCalendarAsync(details: OptionalKeys<Calendar> = {}): Promise<string> {
  if (!ExpoCalendar.saveCalendarAsync) {
    throw new UnavailabilityError('Calendar', 'createCalendarAsync');
  }
  const color = details.color ? processColor(details.color) : undefined;
  const newDetails = { ...details, id: undefined, color };
  return ExpoCalendar.saveCalendarAsync(newDetails);
}

export async function updateCalendarAsync(
  id: string,
  details: OptionalKeys<Calendar> = {}
): Promise<string> {
  if (!ExpoCalendar.saveCalendarAsync) {
    throw new UnavailabilityError('Calendar', 'updateCalendarAsync');
  }
  if (!id) {
    throw new Error(
      'updateCalendarAsync must be called with an id (string) of the target calendar'
    );
  }
  const color = details.color ? processColor(details.color) : undefined;

  if (Platform.OS === 'android') {
    if (
      details.hasOwnProperty('source') ||
      details.hasOwnProperty('color') ||
      details.hasOwnProperty('allowsModifications') ||
      details.hasOwnProperty('allowedAvailabilities') ||
      details.hasOwnProperty('isPrimary') ||
      details.hasOwnProperty('ownerAccount') ||
      details.hasOwnProperty('timeZone') ||
      details.hasOwnProperty('allowedReminders') ||
      details.hasOwnProperty('allowedAttendeeTypes') ||
      details.hasOwnProperty('accessLevel')
    ) {
      console.warn(
        'updateCalendarAsync was called with one or more read-only properties, which will not be updated'
      );
    }
  } else {
    if (
      details.hasOwnProperty('source') ||
      details.hasOwnProperty('type') ||
      details.hasOwnProperty('entityType') ||
      details.hasOwnProperty('allowsModifications') ||
      details.hasOwnProperty('allowedAvailabilities')
    ) {
      console.warn(
        'updateCalendarAsync was called with one or more read-only properties, which will not be updated'
      );
    }
  }

  const newDetails = { ...details, id, color };
  return ExpoCalendar.saveCalendarAsync(newDetails);
}

export async function deleteCalendarAsync(id: string): Promise<void> {
  if (!ExpoCalendar.deleteCalendarAsync) {
    throw new UnavailabilityError('Calendar', 'deleteCalendarAsync');
  }
  if (!id) {
    throw new Error(
      'deleteCalendarAsync must be called with an id (string) of the target calendar'
    );
  }
  return ExpoCalendar.deleteCalendarAsync(id);
}

export async function getEventsAsync(
  calendarIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  if (!ExpoCalendar.getEventsAsync) {
    throw new UnavailabilityError('Calendar', 'getEventsAsync');
  }
  if (!startDate) {
    throw new Error('getEventsAsync must be called with a startDate (date) to search for events');
  }
  if (!endDate) {
    throw new Error('getEventsAsync must be called with an endDate (date) to search for events');
  }
  if (!calendarIds || !calendarIds.length) {
    throw new Error(
      'getEventsAsync must be called with a non-empty array of calendarIds to search'
    );
  }
  return ExpoCalendar.getEventsAsync(
    stringifyIfDate(startDate),
    stringifyIfDate(endDate),
    calendarIds
  );
}

export async function getEventAsync(
  id: string,
  { futureEvents = false, instanceStartDate }: RecurringEventOptions = {}
): Promise<Event> {
  if (!ExpoCalendar.getEventByIdAsync) {
    throw new UnavailabilityError('Calendar', 'getEventAsync');
  }
  if (!id) {
    throw new Error('getEventAsync must be called with an id (string) of the target event');
  }
  if (Platform.OS === 'ios') {
    return ExpoCalendar.getEventByIdAsync(id, instanceStartDate);
  } else {
    return ExpoCalendar.getEventByIdAsync(id);
  }
}

export async function createEventAsync(
  calendarId: string,
  { id, ...details }: OptionalKeys<Event> = {}
): Promise<string> {
  if (!ExpoCalendar.saveEventAsync) {
    throw new UnavailabilityError('Calendar', 'createEventAsync');
  }
  if (!calendarId) {
    throw new Error('createEventAsync must be called with an id (string) of the target calendar');
  }

  if (Platform.OS === 'android') {
    if (!details.startDate) {
      throw new Error('createEventAsync requires a startDate (Date)');
    }
    if (!details.endDate) {
      throw new Error('createEventAsync requires an endDate (Date)');
    }
  }

  const newDetails = {
    ...details,
    calendarId,
  };

  return ExpoCalendar.saveEventAsync(stringifyDateValues(newDetails), {});
}

export async function updateEventAsync(
  id: string,
  details: OptionalKeys<Event> = {},
  { futureEvents = false, instanceStartDate }: RecurringEventOptions = {}
): Promise<string> {
  if (!ExpoCalendar.saveEventAsync) {
    throw new UnavailabilityError('Calendar', 'updateEventAsync');
  }
  if (!id) {
    throw new Error('updateEventAsync must be called with an id (string) of the target event');
  }

  if (Platform.OS === 'ios') {
    if (
      details.hasOwnProperty('creationDate') ||
      details.hasOwnProperty('lastModifiedDate') ||
      details.hasOwnProperty('originalStartDate') ||
      details.hasOwnProperty('isDetached') ||
      details.hasOwnProperty('status') ||
      details.hasOwnProperty('organizer')
    ) {
      console.warn(
        'updateEventAsync was called with one or more read-only properties, which will not be updated'
      );
    }
  }

  const newDetails = { ...details, id, instanceStartDate };
  return ExpoCalendar.saveEventAsync(stringifyDateValues(newDetails), { futureEvents });
}

export async function deleteEventAsync(
  id: string,
  { futureEvents = false, instanceStartDate }: RecurringEventOptions = {}
): Promise<void> {
  if (!ExpoCalendar.deleteEventAsync) {
    throw new UnavailabilityError('Calendar', 'deleteEventAsync');
  }
  if (!id) {
    throw new Error('deleteEventAsync must be called with an id (string) of the target event');
  }
  return ExpoCalendar.deleteEventAsync({ id, instanceStartDate }, { futureEvents });
}

export async function getAttendeesForEventAsync(
  id: string,
  { futureEvents = false, instanceStartDate }: RecurringEventOptions = {}
): Promise<Attendee[]> {
  if (!ExpoCalendar.getAttendeesForEventAsync) {
    throw new UnavailabilityError('Calendar', 'getAttendeesForEventAsync');
  }
  if (!id) {
    throw new Error(
      'getAttendeesForEventAsync must be called with an id (string) of the target event'
    );
  }
  // Android only takes an ID, iOS takes an object
  const params = Platform.OS === 'ios' ? { id, instanceStartDate } : id;
  return ExpoCalendar.getAttendeesForEventAsync(params);
}

export async function createAttendeeAsync(
  eventId: string,
  details: OptionalKeys<Attendee> = {}
): Promise<string> {
  if (!ExpoCalendar.saveAttendeeForEventAsync) {
    throw new UnavailabilityError('Calendar', 'createAttendeeAsync');
  }
  if (!eventId) {
    throw new Error('createAttendeeAsync must be called with an id (string) of the target event');
  }
  if (!details.email) {
    throw new Error('createAttendeeAsync requires an email (string)');
  }
  if (!details.role) {
    throw new Error('createAttendeeAsync requires a role (string)');
  }
  if (!details.type) {
    throw new Error('createAttendeeAsync requires a type (string)');
  }
  if (!details.status) {
    throw new Error('createAttendeeAsync requires a status (string)');
  }
  const newDetails = { ...details, id: undefined };
  return ExpoCalendar.saveAttendeeForEventAsync(newDetails, eventId);
} // Android

export async function updateAttendeeAsync(
  id: string,
  details: OptionalKeys<Attendee> = {}
): Promise<string> {
  if (!ExpoCalendar.saveAttendeeForEventAsync) {
    throw new UnavailabilityError('Calendar', 'updateAttendeeAsync');
  }
  if (!id) {
    throw new Error('updateAttendeeAsync must be called with an id (string) of the target event');
  }
  const newDetails = { ...details, id };
  return ExpoCalendar.saveAttendeeForEventAsync(newDetails, null);
} // Android

export async function getDefaultCalendarAsync(): Promise<Calendar> {
  if (!ExpoCalendar.getDefaultCalendarAsync) {
    throw new UnavailabilityError('Calendar', 'getDefaultCalendarAsync');
  }
  return ExpoCalendar.getDefaultCalendarAsync();
} // iOS

export async function deleteAttendeeAsync(id: string): Promise<void> {
  if (!ExpoCalendar.deleteAttendeeAsync) {
    throw new UnavailabilityError('Calendar', 'deleteAttendeeAsync');
  }
  if (!id) {
    throw new Error('deleteAttendeeAsync must be called with an id (string) of the target event');
  }
  return ExpoCalendar.deleteAttendeeAsync(id);
} // Android

export async function getRemindersAsync(
  calendarIds: (string | null)[],
  status: string | null,
  startDate: Date,
  endDate: Date
): Promise<Reminder[]> {
  if (!ExpoCalendar.getRemindersAsync) {
    throw new UnavailabilityError('Calendar', 'getRemindersAsync');
  }
  if (status && !startDate) {
    throw new Error(
      'getRemindersAsync must be called with a startDate (date) to search for reminders'
    );
  }
  if (status && !endDate) {
    throw new Error(
      'getRemindersAsync must be called with an endDate (date) to search for reminders'
    );
  }
  if (!calendarIds || !calendarIds.length) {
    throw new Error(
      'getRemindersAsync must be called with a non-empty array of calendarIds to search'
    );
  }
  return ExpoCalendar.getRemindersAsync(
    stringifyIfDate(startDate) || null,
    stringifyIfDate(endDate) || null,
    calendarIds,
    status || null
  );
} // iOS

export async function getReminderAsync(id: string): Promise<Reminder> {
  if (!ExpoCalendar.getReminderByIdAsync) {
    throw new UnavailabilityError('Calendar', 'getReminderAsync');
  }
  if (!id) {
    throw new Error('getReminderAsync must be called with an id (string) of the target reminder');
  }
  return ExpoCalendar.getReminderByIdAsync(id);
} // iOS

export async function createReminderAsync(
  calendarId: string | null,
  { id, ...details }: Reminder = {}
): Promise<string> {
  if (!ExpoCalendar.saveReminderAsync) {
    throw new UnavailabilityError('Calendar', 'createReminderAsync');
  }

  const newDetails = {
    ...details,
    calendarId: calendarId === null ? undefined : calendarId,
  };
  return ExpoCalendar.saveReminderAsync(stringifyDateValues(newDetails));
} // iOS

export async function updateReminderAsync(id: string, details: Reminder = {}): Promise<string> {
  if (!ExpoCalendar.saveReminderAsync) {
    throw new UnavailabilityError('Calendar', 'updateReminderAsync');
  }
  if (!id) {
    throw new Error(
      'updateReminderAsync must be called with an id (string) of the target reminder'
    );
  }

  if (details.hasOwnProperty('creationDate') || details.hasOwnProperty('lastModifiedDate')) {
    console.warn(
      'updateReminderAsync was called with one or more read-only properties, which will not be updated'
    );
  }

  const newDetails = { ...details, id };
  return ExpoCalendar.saveReminderAsync(stringifyDateValues(newDetails));
} // iOS

export async function deleteReminderAsync(id: string): Promise<void> {
  if (!ExpoCalendar.deleteReminderAsync) {
    throw new UnavailabilityError('Calendar', 'deleteReminderAsync');
  }
  if (!id) {
    throw new Error(
      'deleteReminderAsync must be called with an id (string) of the target reminder'
    );
  }
  return ExpoCalendar.deleteReminderAsync(id);
} // iOS

export async function getSourcesAsync(): Promise<Source[]> {
  if (!ExpoCalendar.getSourcesAsync) {
    throw new UnavailabilityError('Calendar', 'getSourcesAsync');
  }
  return ExpoCalendar.getSourcesAsync();
} // iOS

export async function getSourceAsync(id: string): Promise<Source> {
  if (!ExpoCalendar.getSourceByIdAsync) {
    throw new UnavailabilityError('Calendar', 'getSourceAsync');
  }
  if (!id) {
    throw new Error('getSourceAsync must be called with an id (string) of the target source');
  }
  return ExpoCalendar.getSourceByIdAsync(id);
} // iOS

export function openEventInCalendar(id: string): void {
  if (!ExpoCalendar.openEventInCalendar) {
    console.warn(`openEventInCalendar is not available on platform: ${Platform.OS}`);
    return;
  }
  if (!id) {
    throw new Error('openEventInCalendar must be called with an id (string) of the target event');
  }
  return ExpoCalendar.openEventInCalendar(parseInt(id, 10));
} // Android

/**
 * @deprecated Use `requestCalendarPermissionsAsync()` instead
 */
export async function requestPermissionsAsync(): Promise<PermissionResponse> {
  console.warn(
    'requestPermissionsAsync is deprecated. Use requestCalendarPermissionsAsync instead.'
  );
  return requestCalendarPermissionsAsync();
}

export async function getCalendarPermissionsAsync(): Promise<PermissionResponse> {
  if (!ExpoCalendar.getCalendarPermissionsAsync) {
    throw new UnavailabilityError('Calendar', 'getCalendarPermissionsAsync');
  }
  return ExpoCalendar.getCalendarPermissionsAsync();
}

export async function getRemindersPermissionsAsync(): Promise<PermissionResponse> {
  if (!ExpoCalendar.getRemindersPermissionsAsync) {
    throw new UnavailabilityError('Calendar', 'getRemindersPermissionsAsync');
  }
  return ExpoCalendar.getRemindersPermissionsAsync();
}

export async function requestCalendarPermissionsAsync(): Promise<PermissionResponse> {
  if (!ExpoCalendar.requestCalendarPermissionsAsync) {
    throw new UnavailabilityError('Calendar', 'requestCalendarPermissionsAsync');
  }
  return await ExpoCalendar.requestCalendarPermissionsAsync();
}

export async function requestRemindersPermissionsAsync(): Promise<PermissionResponse> {
  if (!ExpoCalendar.requestRemindersPermissionsAsync) {
    throw new UnavailabilityError('Calendar', 'requestRemindersPermissionsAsync');
  }
  return await ExpoCalendar.requestRemindersPermissionsAsync();
}

// @needsAudit
/**
 * Check or request permissions to access the calendar.
 * This uses both `getCalendarPermissionsAsync` and `requestCalendarPermissionsAsync` to interact with the permissions.
 *
 * @example
 * ```ts
 * const [status, requestPermission] = Calendar.useCalendarPermissions();
 * ```
 */
export const useCalendarPermissions = createPermissionHook({
  getMethod: getCalendarPermissionsAsync,
  requestMethod: requestCalendarPermissionsAsync,
});

// @needsAudit
/**
 * Check or request permissions to access reminders.
 * This uses both `getRemindersPermissionsAsync` and `requestRemindersPermissionsAsync` to interact with the permissions.
 *
 * @example
 * ```ts
 * const [status, requestPermission] = Calendar.useRemindersPermissions();
 * ```
 */
export const useRemindersPermissions = createPermissionHook({
  getMethod: getRemindersPermissionsAsync,
  requestMethod: requestRemindersPermissionsAsync,
});

export const EntityTypes = {
  EVENT: 'event',
  REMINDER: 'reminder',
};

export const Frequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const Availability = {
  NOT_SUPPORTED: 'notSupported', // iOS
  BUSY: 'busy',
  FREE: 'free',
  TENTATIVE: 'tentative',
  UNAVAILABLE: 'unavailable', // iOS
};

export const CalendarType = {
  LOCAL: 'local',
  CALDAV: 'caldav',
  EXCHANGE: 'exchange',
  SUBSCRIBED: 'subscribed',
  BIRTHDAYS: 'birthdays',
  UNKNOWN: 'unknown',
}; // iOS

export const EventStatus = {
  NONE: 'none',
  CONFIRMED: 'confirmed',
  TENTATIVE: 'tentative',
  CANCELED: 'canceled',
};

export const SourceType = {
  LOCAL: 'local',
  EXCHANGE: 'exchange',
  CALDAV: 'caldav',
  MOBILEME: 'mobileme',
  SUBSCRIBED: 'subscribed',
  BIRTHDAYS: 'birthdays',
};

export const AttendeeRole = {
  UNKNOWN: 'unknown', // iOS
  REQUIRED: 'required', // iOS
  OPTIONAL: 'optional', // iOS
  CHAIR: 'chair', // iOS
  NON_PARTICIPANT: 'nonParticipant', // iOS
  ATTENDEE: 'attendee', // Android
  ORGANIZER: 'organizer', // Android
  PERFORMER: 'performer', // Android
  SPEAKER: 'speaker', // Android
  NONE: 'none', // Android
};

export const AttendeeStatus = {
  UNKNOWN: 'unknown', // iOS
  PENDING: 'pending', // iOS
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  TENTATIVE: 'tentative',
  DELEGATED: 'delegated', // iOS
  COMPLETED: 'completed', // iOS
  IN_PROCESS: 'inProcess', // iOS
  INVITED: 'invited', // Android
  NONE: 'none', // Android
};

export const AttendeeType = {
  UNKNOWN: 'unknown', // iOS
  PERSON: 'person', // iOS
  ROOM: 'room', // iOS
  GROUP: 'group', // iOS
  RESOURCE: 'resource',
  OPTIONAL: 'optional', // Android
  REQUIRED: 'required', // Android
  NONE: 'none', // Android
};

export const AlarmMethod = {
  ALARM: 'alarm',
  ALERT: 'alert',
  EMAIL: 'email',
  SMS: 'sms',
  DEFAULT: 'default',
};

export const EventAccessLevel = {
  CONFIDENTIAL: 'confidential',
  PRIVATE: 'private',
  PUBLIC: 'public',
  DEFAULT: 'default',
};

export const CalendarAccessLevel = {
  CONTRIBUTOR: 'contributor',
  EDITOR: 'editor',
  FREEBUSY: 'freebusy',
  OVERRIDE: 'override',
  OWNER: 'owner',
  READ: 'read',
  RESPOND: 'respond',
  ROOT: 'root',
  NONE: 'none',
};

export const ReminderStatus = {
  COMPLETED: 'completed',
  INCOMPLETE: 'incomplete',
};

function stringifyIfDate(date: any): any {
  return date instanceof Date ? date.toISOString() : date;
}

function stringifyDateValues(obj: object): object {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (value != null && typeof value === 'object' && !(value instanceof Date)) {
      if (Array.isArray(value)) {
        return { ...acc, [key]: value.map(stringifyDateValues) };
      }
      return { ...acc, [key]: stringifyDateValues(value) };
    }
    acc[key] = stringifyIfDate(value);
    return acc;
  }, {});
}
