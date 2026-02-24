import { EventEmitter } from 'events';

// Global singleton for event broadcasting
const globalForEvents = global as unknown as { timetableEvents: EventEmitter };

export const timetableEvents = globalForEvents.timetableEvents || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.timetableEvents = timetableEvents;
