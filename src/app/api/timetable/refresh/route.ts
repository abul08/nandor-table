import { NextResponse } from 'next/server';
import { timetableEvents } from '@/lib/events';

export async function POST() {
    try {
        // Broadcast the refresh signal to all connected clients
        timetableEvents.emit('refresh');
        return NextResponse.json({ success: true, message: 'Refresh signal sent' });
    } catch (error) {
        console.error('Failed to send refresh signal:', error);
        return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 });
    }
}
