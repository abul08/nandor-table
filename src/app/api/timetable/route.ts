import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { timetableEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: timetables, error: tError } = await supabase
            .from('timetables')
            .select('*')
            .order('category', { ascending: true })
            .order('type', { ascending: true })
            .order('row_index', { ascending: true });

        const { data: uniformDays, error: uError } = await supabase
            .from('uniform_days')
            .select('*');

        const { data: holidays, error: hError } = await supabase
            .from('holidays')
            .select('*');

        if (tError || uError || hError) {
            throw tError || uError || hError;
        }

        // Grouping data by category for easier front-end consumption
        const groupedData: any = {};
        const categories = ['KINAN', 'MANAN', 'JINAN'];

        categories.forEach(cat => {
            const catUniform = uniformDays?.filter((u: any) => u.category === cat) || [];
            const catHolidays = holidays?.filter((h: any) => h.category === cat) || [];

            // Map uniform days to a simple day boolean map
            const uniformMap: Record<string, boolean> = {};
            catUniform.forEach((u: any) => {
                uniformMap[u.day] = u.is_uniform === true;
            });

            // Map holidays to a simple day boolean map
            const holidayMap: Record<string, boolean> = {};
            catHolidays.forEach((h: any) => {
                holidayMap[h.day] = h.is_holiday === true;
            });

            groupedData[cat] = {
                name: cat,
                uniformDays: uniformMap,
                holidays: holidayMap,
                morning: timetables?.filter((t: any) => t.category === cat && t.type === 'morning') || [],
                afternoon: timetables?.filter((t: any) => t.category === cat && t.type === 'afternoon') || []
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
            const { error } = await supabase
                .from('uniform_days')
                .update({ is_uniform: !!is_uniform })
                .match({ category, day: uniformDay });
            if (error) throw error;
        }

        if (holiday !== undefined && is_holiday !== undefined) {
            const { error } = await supabase
                .from('holidays')
                .update({ is_holiday: !!is_holiday })
                .match({ category, day: holiday });
            if (error) throw error;
        }

        if (row_index !== undefined) {
            const { error } = await supabase
                .from('timetables')
                .update({ sun, mon, tue, wed, thu })
                .match({ category, type, row_index });
            if (error) throw error;
        }

        // Broadcast the update to all connected clients
        timetableEvents.emit('update');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update timetable:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
