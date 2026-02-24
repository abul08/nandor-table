"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
    const [timetableData, setTimetableData] = useState<any>(null);
    const [message, setMessage] = useState("");

    const fetchTimetable = async () => {
        try {
            const res = await fetch('/api/timetable');
            const data = await res.json();
            setTimetableData(data);
        } catch (err) {
        }
    };

    const updateCell = async (category: string, type: string, rowIndex: number, field: string, value: string) => {
        try {
            const row = timetableData[category][type][rowIndex];
            const updatedRow = { ...row, [field]: value };

            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    type,
                    row_index: rowIndex,
                    ...updatedRow
                })
            });

            if (res.ok) {
                setMessage(`Updated ${category} ${type === 'morning' ? 'before break' : 'after break'} row ${rowIndex + 1}`);
                fetchTimetable();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const toggleUniform = async (category: string, day: string, isUniform: boolean) => {
        try {
            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    uniformDay: day,
                    is_uniform: isUniform
                })
            });

            if (res.ok) {
                setMessage(`Updated uniform status for ${category} ${day}`);
                fetchTimetable();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const toggleHoliday = async (category: string, day: string, isHoliday: boolean) => {
        try {
            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    holiday: day,
                    is_holiday: isHoliday
                })
            });

            if (res.ok) {
                setMessage(`Updated holiday status for ${category} ${day}`);
                fetchTimetable();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    if (!timetableData) return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            fontFamily: "'Hepta Slab', serif"
        }}>
            <div className="loading-spinner">Loading Admin Console...</div>
        </div>
    );

    const days = ['sun', 'mon', 'tue', 'wed', 'thu'];

    return (
        <div style={{
            padding: '60px 40px',
            color: '#fff',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #000 100%)',
            minHeight: '100vh',
            fontFamily: "'Hepta Slab', serif",
            lineHeight: 1.6
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '40px',
                    borderBottom: '1px solid #333',
                    paddingBottom: '20px'
                }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1px' }}>ADMIN CONSOLE</h1>
                    <div style={{ fontSize: '18px', color: '#888' }}>TIMETABLE MANAGEMENT</div>
                </header>

                {message && (
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        padding: '15px 25px',
                        background: '#fff',
                        color: '#000',
                        borderRadius: '8px',
                        fontWeight: 700,
                        boxShadow: '0 10px 30px rgba(255,255,255,0.1)',
                        zIndex: 1000,
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {message}
                    </div>
                )}

                {['KINAN', 'MANAN', 'JINAN'].map(cat => (
                    <div key={cat} style={{
                        marginBottom: '60px',
                        background: '#0a0a0a',
                        border: '1px solid #222',
                        padding: '40px',
                        borderLeft: '4px solid #fff',
                        borderRadius: '2px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>{cat}</h2>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ background: '#111', padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <label style={{ color: '#888', fontSize: '14px', fontWeight: 600 }}>UNIFORM DAYS:</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {days.map(d => (
                                            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={timetableData[cat].uniformDays[d]}
                                                    onChange={(e) => toggleUniform(cat, d, e.target.checked)}
                                                />
                                                {d.toUpperCase()}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: '#111', padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <label style={{ color: '#888', fontSize: '14px', fontWeight: 600 }}>HOLIDAYS:</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {days.map(d => (
                                            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={timetableData[cat].holidays[d]}
                                                    onChange={(e) => toggleHoliday(cat, d, e.target.checked)}
                                                />
                                                {d.toUpperCase()}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {['morning', 'afternoon'].map(type => (
                            <div key={type} style={{ marginBottom: '40px' }}>
                                <h3 style={{
                                    textTransform: 'uppercase',
                                    marginBottom: '20px',
                                    fontSize: '18px',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{ width: '8px', height: '8px', background: '#333', borderRadius: '50%' }}></span>
                                    {type === 'morning' ? 'before break' : 'after break'}
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #222', color: '#888', fontWeight: 600 }}>TIME</th>
                                                {days.map(d => (
                                                    <th key={d} style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #222', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
                                                        {d}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timetableData[cat][type].map((row: any, i: number) => (
                                                <tr key={i} style={{ transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '15px', borderBottom: '1px solid #111', fontWeight: 600, width: '150px' }}>
                                                        {row.time_range}
                                                    </td>
                                                    {days.map(d => (
                                                        <td key={d} style={{ padding: '10px', borderBottom: '1px solid #111' }}>
                                                            <input
                                                                type="text"
                                                                defaultValue={row[d]}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== row[d]) {
                                                                        updateCell(cat, type, i, d, e.target.value);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '12px',
                                                                    background: '#050505',
                                                                    color: '#fff',
                                                                    border: '1px solid #1a1a1a',
                                                                    borderRadius: '4px',
                                                                    fontFamily: "'Hepta Slab', serif",
                                                                    fontSize: '15px',
                                                                    outline: 'none',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <style jsx global>{`
                input:focus {
                    border-color: #555 !important;
                    background: #111 !important;
                    box-shadow: 0 0 10px rgba(255,255,255,0.02);
                }
                tr:hover {
                    background: #0d0d0d;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
