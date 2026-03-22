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

    const refreshFrontEnd = async () => {
        try {
            const res = await fetch('/api/timetable/refresh', { method: 'POST' });
            if (res.ok) {
                setMessage("Front-end refresh signal sent!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error("Refresh failed", err);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-content">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-title">ADMIN CONSOLE</h1>
                        <div className="admin-subtitle">TIMETABLE MANAGEMENT</div>
                    </div>
                    <button onClick={refreshFrontEnd} className="refresh-btn">
                        REFRESH FRONT-END
                    </button>
                </header>

                {message && (
                    <div className="toast-message">
                        {message}
                    </div>
                )}

                {['KINAN', 'MANAN', 'JINAN'].map(cat => (
                    <div key={cat} className="category-section">
                        <div className="category-header">
                            <h2 className="category-title">{cat}</h2>
                            <div className="controls-group">
                                <div className="control-box">
                                    <label className="control-label">UNIFORM DAYS:</label>
                                    <div className="checkbox-grid">
                                        {days.map(d => (
                                            <label key={d} className="checkbox-item">
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

                                <div className="control-box">
                                    <label className="control-label">HOLIDAYS:</label>
                                    <div className="checkbox-grid">
                                        {days.map(d => (
                                            <label key={d} className="checkbox-item">
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
                            <div key={type} className="timetable-section">
                                <h3 className="section-title">
                                    <span className="dot"></span>
                                    {type === 'morning' ? 'before break' : 'after break'}
                                </h3>
                                <div className="table-wrapper">
                                    <table className="timetable">
                                        <thead>
                                            <tr>
                                                <th className="time-col">TIME</th>
                                                {days.map(d => (
                                                    <th key={d} className="day-col">
                                                        {d}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timetableData[cat][type].map((row: any, i: number) => (
                                                <tr key={i} className="table-row">
                                                    <td className="time-cell">
                                                        {row.time_range}
                                                    </td>
                                                    {days.map(d => (
                                                        <td key={d} className="input-cell">
                                                            <input
                                                                type="text"
                                                                defaultValue={row[d]}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== row[d]) {
                                                                        updateCell(cat, type, i, d, e.target.value);
                                                                    }
                                                                }}
                                                                className="cell-input"
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
                .admin-container {
                    padding: 60px 40px;
                    color: #fff;
                    background: linear-gradient(135deg, #0a0a0a 0%, #000 100%);
                    minHeight: 100vh;
                    font-family: 'Hepta Slab', serif;
                    line-height: 1.6;
                }

                .admin-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 40px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 20px;
                    gap: 20px;
                }

                .admin-title {
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: -1px;
                    margin: 0;
                }

                .admin-subtitle {
                    font-size: 18px;
                    color: #888;
                }

                .toast-message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    background: #fff;
                    color: #000;
                    border-radius: 8px;
                    font-weight: 700;
                    box-shadow: 0 10px 30px rgba(255,255,255,0.1);
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }

                .category-section {
                    margin-bottom: 60px;
                    background: #0a0a0a;
                    border: 1px solid #222;
                    padding: 40px;
                    border-left: 4px solid #fff;
                    border-radius: 2px;
                }

                .category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .category-title {
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0;
                }

                .controls-group {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .control-box {
                    background: #111;
                    padding: 10px 20px;
                    border-radius: 4px;
                    border: 1px solid #333;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .control-label {
                    color: #888;
                    font-size: 14px;
                    font-weight: 600;
                }

                .checkbox-grid {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    cursor: pointer;
                }

                .timetable-section {
                    margin-bottom: 40px;
                }

                .section-title {
                    text-transform: uppercase;
                    margin-bottom: 20px;
                    font-size: 18px;
                    color: #555;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    background: #333;
                    border-radius: 50%;
                }

                .table-wrapper {
                    overflow-x: auto;
                    border-radius: 4px;
                    background: #050505;
                }

                .timetable {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 16px;
                    min-width: 600px; /* Ensure table doesn't collapse too much */
                }

                .timetable th {
                    text-align: left;
                    padding: 15px;
                    border-bottom: 2px solid #222;
                    color: #888;
                    fontWeight: 600;
                    text-transform: uppercase;
                }

                .table-row {
                    transition: background 0.2s;
                }

                .table-row:hover {
                    background: #0d0d0d;
                }

                .time-cell {
                    padding: 15px;
                    border-bottom: 1px solid #111;
                    font-weight: 600;
                    width: 120px;
                    background: #050505;
                    position: sticky;
                    left: 0;
                    z-index: 1;
                }

                .input-cell {
                    padding: 10px;
                    border-bottom: 1px solid #111;
                    min-width: 120px;
                }

                .cell-input {
                    width: 100%;
                    padding: 12px;
                    background: #050505;
                    color: #fff;
                    border: 1px solid #1a1a1a;
                    border-radius: 4px;
                    font-family: 'Hepta Slab', serif;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s;
                }

                .cell-input:focus {
                    border-color: #555 !important;
                    background: #111 !important;
                    box-shadow: 0 0 10px rgba(255,255,255,0.02);
                }

                .refresh-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 12px 24px;
                    font-weight: 800;
                    font-family: 'Hepta Slab', serif;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                    letter-spacing: 1px;
                    font-size: 14px;
                }

                .refresh-btn:hover {
                    background: #ccc;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255,255,255,0.1);
                }

                .refresh-btn:active {
                    transform: translateY(0);
                }

                @media (max-width: 1024px) {
                    .admin-container {
                        padding: 40px 20px;
                    }
                }

                @media (max-width: 768px) {
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    .refresh-btn {
                        width: 100%;
                    }
                    .admin-title {
                        font-size: 32px;
                    }
                    .category-section {
                        padding: 20px;
                        margin-bottom: 40px;
                    }
                    .category-title {
                        font-size: 24px;
                    }
                    .control-box {
                        flex-direction: column;
                        align-items: flex-start;
                        width: 100%;
                        gap: 10px;
                    }
                    .checkbox-grid {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                @media (max-width: 480px) {
                    .admin-container {
                        padding: 30px 15px;
                    }
                    .admin-title {
                        font-size: 28px;
                    }
                    .checkbox-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                    }
                    .cell-input {
                        padding: 8px;
                        font-size: 14px;
                    }
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
