"use client";

import { useEffect, useState } from "react";

const LATITUDE = 6.2847;
const LONGITUDE = 73.2433;
const OFFSETS = "0,-2,-1,5,3,3,0,9,0";

type Timings = {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
};

type PrayerData = {
    timings: Timings;
    date: {
        hijri: {
            day: string;
            month: { number: number; en: string };
            year: string;
        };
    };
};

const TimetableCard = ({ name, data, uniformDays, holidays }: { name: string; data: any; uniformDays: Record<string, boolean>; holidays: any }) => {
    const activeUniformDays = Object.entries(uniformDays || {})
        .filter(([_, isActive]) => isActive)
        .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1))
        .join(', ');

    return (
        <div className="card">
            <div className="card-header">{name}</div>
            <table className="timetable-table">
                <thead>
                    <tr>
                        <th className="top-left">Time</th>
                        <th className={holidays?.sun ? "holiday-cell" : ""}>Sun</th>
                        <th className={holidays?.mon ? "holiday-cell" : ""}>Mon</th>
                        <th className={holidays?.tue ? "holiday-cell" : ""}>Tue</th>
                        <th className={holidays?.wed ? "holiday-cell" : ""}>Wed</th>
                        <th className={`top-right ${holidays?.thu ? "holiday-cell" : ""}`}>Thu</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.morning.map((row: any, i: number) => (
                        <tr key={i}>
                            <td className="table-time">{row.time_range}</td>
                            <td className={holidays?.sun ? "holiday-cell" : ""}>{row.sun}</td>
                            <td className={holidays?.mon ? "holiday-cell" : ""}>{row.mon}</td>
                            <td className={holidays?.tue ? "holiday-cell" : ""}>{row.tue}</td>
                            <td className={holidays?.wed ? "holiday-cell" : ""}>{row.wed}</td>
                            <td className={holidays?.thu ? "holiday-cell" : ""}>{row.thu}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="break-row">BREAK</div>
            <table className="timetable-table">
                <tbody>
                    {data?.afternoon.map((row: any, i: number) => (
                        <tr key={i}>
                            <td className={`table-time ${i === data.afternoon.length - 1 ? "bottom-left" : ""}`}>{row.time_range}</td>
                            <td className={holidays?.sun ? "holiday-cell" : ""}>{row.sun}</td>
                            <td className={holidays?.mon ? "holiday-cell" : ""}>{row.mon}</td>
                            <td className={holidays?.tue ? "holiday-cell" : ""}>{row.tue}</td>
                            <td className={holidays?.wed ? "holiday-cell" : ""}>{row.wed}</td>
                            <td className={`${i === data.afternoon.length - 1 ? "bottom-right" : ""} ${holidays?.thu ? "holiday-cell" : ""}`}>{row.thu}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="uniform">Second Uniform Days: <span>{activeUniformDays || 'None'}</span></div>
        </div>
    );
};

export default function DisplayBoard() {
    const [currentTime, setCurrentTime] = useState("");
    const [ampm, setAmpm] = useState("");
    const [gregorianDate, setGregorianDate] = useState("");
    const [hijriDate, setHijriDate] = useState<{ day: string; month: string; year: string } | null>(null);
    const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [timetableData, setTimetableData] = useState<any>(null);

    const updateClock = () => {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Indian/Maldives" }));
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const amp = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        setCurrentTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        setAmpm(amp);

        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        setGregorianDate(now.toLocaleDateString('en-US', options));
    };

    const getDhivehiHijriDate = (hijri: any) => {
        const hijriMonths: Record<number, string> = {
            1: "މުޙައްރަމް", 2: "ޞަފަރު", 3: "ރަބީޢުލްއައްވަލް", 4: "ރަބީޢުލްއާޚިރު",
            5: "ޖުމާދަލްއޫލާ", 6: "ޖުމާދަލްއާޚިރާ", 7: "ރަޖަބު", 8: "ޝަޢުބާން",
            9: "ރަމަޟާން", 10: "ޝައްވާލް", 11: "ޛުލްޤަޢިދާ", 12: "ޛުލްޙިއްޖާ"
        };
        return {
            day: hijri.day,
            month: hijriMonths[hijri.month.number] || hijri.month.en,
            year: hijri.year
        };
    };

    const fetchPrayerTimes = async () => {
        try {
            const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=3&tune=${OFFSETS}`);
            const json = await res.json();
            if (json.code === 200) {
                setPrayerData(json.data);
                const hijri = json.data.date.hijri;
                setHijriDate(getDhivehiHijriDate(hijri));
                highlightNextPrayer(json.data.timings);
            }
        } catch (err) {
            console.error("Failed to fetch prayer times", err);
        }
    };

    const fetchTimetable = async () => {
        try {
            const res = await fetch('/api/timetable');
            const data = await res.json();
            setTimetableData(data);
        } catch (err) {
            console.error("Failed to fetch timetable", err);
        }
    };

    const highlightNextPrayer = (timings: Timings) => {
        const now = new Date();
        const cur = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const order = [
            { id: "Fajr", time: timings.Fajr },
            { id: "Sunrise", time: timings.Sunrise },
            { id: "Dhuhr", time: timings.Dhuhr },
            { id: "Asr", time: timings.Asr },
            { id: "Maghrib", time: timings.Maghrib },
            { id: "Isha", time: timings.Isha },
        ].map(p => ({ ...p, time: p.time.split(" ")[0] }));

        let next = order.find(p => cur < p.time);
        setNextPrayer(next ? next.id : "Fajr");
    };

    useEffect(() => {
        updateClock();
        fetchPrayerTimes();
        fetchTimetable();

        const clockInterval = setInterval(updateClock, 1000);
        const prayerInterval = setInterval(fetchPrayerTimes, 3600000); // 1 hour

        // Real-time updates via Server-Sent Events
        const eventSource = new EventSource('/api/timetable/watch');
        eventSource.onmessage = (event) => {
            if (event.data === 'update') {
                console.log("Timetable update received via SSE");
                fetchTimetable();
            }
        };

        eventSource.onerror = () => {
            console.error("SSE connection lost. Reconnecting...");
            eventSource.close();
            // Optional: fallback to polling if SSE fails
        };

        return () => {
            clearInterval(clockInterval);
            clearInterval(prayerInterval);
            eventSource.close();
        };
    }, []);

    const format12H = (t: string) => {
        if (!t) return "--:--";
        const [h24, m] = t.split(" ")[0].split(":");
        const h = parseInt(h24) % 12 || 12;
        return `${String(h).padStart(2, '0')}:${m}`;
    };

    return (
        <div className="container">
            <div className="clock-section">
                <div className="time">{currentTime} <span>{ampm}</span></div>
                <div className="date-row">
                    <span>{gregorianDate}</span>
                    <span style={{ color: '#fff' }}>|</span>
                    <span className="hijri-container">
                        {hijriDate ? (
                            <>
                                <span className="hijri-num">{hijriDate.day}</span>
                                <span className="hijri-month"> {hijriDate.month} </span>
                                <span className="hijri-num">{hijriDate.year}</span>
                            </>
                        ) : "..."}
                    </span>
                </div>
            </div>

            <div className="bottom-grid">
                <div className="timetable-wrapper">
                    <div className="timetable-title">TIME TABLES</div>
                    <div className="timetable-grid">
                        {timetableData ? (
                            ['KINAN', 'MANAN', 'JINAN'].map(cat => (
                                <TimetableCard
                                    key={cat}
                                    name={cat}
                                    data={timetableData[cat]}
                                    uniformDays={timetableData[cat].uniformDays}
                                    holidays={timetableData[cat].holidays}
                                />
                            ))
                        ) : (
                            <div className="loading">Loading Timetables...</div>
                        )}
                    </div>
                </div>

                <div className="prayer-panel">
                    <div className="prayer-header">PRAYER TIMES</div>
                    <div className="prayer-body">
                        {[
                            { id: "Fajr", name: "ފަތިސް" },
                            { id: "Dhuhr", name: "މެންދުރު" },
                            { id: "Asr", name: "ޢަޞްރު" },
                            { id: "Maghrib", name: "މަޣްރިބް" },
                            { id: "Isha", name: "ޢިޝާ" }
                        ].map(p => (
                            <div key={p.id} className={`prayer-time-row ${nextPrayer === p.id ? "next-prayer-highlight" : ""}`}>
                                <span className="prayer-val">{prayerData ? format12H(prayerData.timings[p.id as keyof Timings]) : "--:--"}</span>
                                <span className="prayer-lbl">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
