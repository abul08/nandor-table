import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbPath = path.resolve(process.cwd(), 'timetable.db');
    const exists = fs.existsSync(dbPath);
    let stats = null;
    if (exists) {
        stats = fs.statSync(dbPath);
    }

    try {
        const counts = {
            timetables: db.prepare('SELECT COUNT(*) as c FROM timetables').get() as any,
            uniform_days: db.prepare('SELECT COUNT(*) as c FROM uniform_days').get() as any,
            holidays: db.prepare('SELECT COUNT(*) as c FROM holidays').get() as any,
        };

        return NextResponse.json({
            status: 'ok',
            database: {
                path: dbPath,
                exists,
                size: stats ? stats.size : 0,
                counts
            },
            env: process.env.NODE_ENV
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            error: err.message,
            database: {
                path: dbPath,
                exists
            }
        }, { status: 500 });
    }
}
