import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: tCount, error: tError } = await supabase.from('timetables').select('id', { count: 'exact', head: true });
        const { data: uCount, error: uError } = await supabase.from('uniform_days').select('category', { count: 'exact', head: true });
        const { data: hCount, error: hError } = await supabase.from('holidays').select('category', { count: 'exact', head: true });

        if (tError || uError || hError) {
            throw tError || uError || hError;
        }

        return NextResponse.json({
            status: 'ok',
            database: {
                type: 'supabase',
                counts: {
                    timetables: tCount,
                    uniform_days: uCount,
                    holidays: hCount
                }
            },
            env: process.env.NODE_ENV
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            error: err.message,
            database: {
                type: 'supabase'
            }
        }, { status: 500 });
    }
}
