import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { timetableEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("API GET /api/timetable hit");
    try {
        const timetables = db.prepare('SELECT * FROM timetables ORDER BY category, type, row_index').all() as any[];
        const uniformDays = db.prepare('SELECT * FROM uniform_days').all() as any[];
        const holidays = db.prepare('SELECT * FROM holidays').all() as any[];

        console.log(`Fetched counts - Timetables: ${timetables.length}, Uniform: ${uniformDays.length}, Holidays: ${holidays.length}`);

        // Grouping data by category for easier front-end consumption
        const groupedData: any = {};
        const categories = ['KINAN', 'MANAN', 'JINAN'];

        categories.forEach(cat => {
            const catUniform = uniformDays.filter((u: any) => u.category === cat);
            const catHolidays = holidays.filter((h: any) => h.category === cat);

            // Map uniform days to a simple day boolean map
            const uniformMap: Record<string, boolean> = {};
            catUniform.forEach((u: any) => {
                uniformMap[u.day] = u.is_uniform === 1;
            });

            // Map holidays to a simple day boolean map
            const holidayMap: Record<string, boolean> = {};
            catHolidays.forEach((h: any) => {
                holidayMap[h.day] = h.is_holiday === 1;
            });

            groupedData[cat] = {
                name: cat,
                uniformDays: uniformMap,
                holidays: holidayMap,
                morning: timetables.filter((t: any) => t.category === cat && t.type === 'morning'),
                afternoon: timetables.filter((t: any) => t.category === cat && t.type === 'afternoon')
            };
        });

        return NextResponse.json(groupedData);
    } catch (error) {
        console.error('Failed to fetch timetables:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, type, row_index, sun, mon, tue, wed, thu, uniformDay, is_uniform, holiday, is_holiday } = body;

        if (uniformDay !== undefined && is_uniform !== undefined) {
            db.prepare('UPDATE uniform_days SET is_uniform = ? WHERE category = ? AND day = ?').run(is_uniform ? 1 : 0, category, uniformDay);
        }

        if (holiday !== undefined && is_holiday !== undefined) {
            db.prepare('UPDATE holidays SET is_holiday = ? WHERE category = ? AND day = ?').run(is_holiday ? 1 : 0, category, holiday);
        }

        if (row_index !== undefined) {
            db.prepare(`
        UPDATE timetables 
        SET sun = ?, mon = ?, tue = ?, wed = ?, thu = ?
        WHERE category = ? AND type = ? AND row_index = ?
      `).run(sun, mon, tue, wed, thu, category, type, row_index);
        }

        // Broadcast the update to all connected clients
        timetableEvents.emit('update');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update timetable:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
