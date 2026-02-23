import { useState } from "react";
import "./Calendar.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function Calendar({ appointments = [] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(getTodayKey());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = 0; i < startPad; i++) {
    const d = prevMonthDays - startPad + i + 1;
    days.push({ day: d, key: null, isOtherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, key, isOtherMonth: false });
  }
  const remain = 42 - days.length;
  for (let i = 0; i < remain; i++) {
    days.push({ day: i + 1, key: null, isOtherMonth: true });
  }

  const appointmentsByDay = {};
  for (const a of appointments) {
    const k = a.day;
    if (!appointmentsByDay[k]) appointmentsByDay[k] = [];
    appointmentsByDay[k].push(a);
  }

  const selectedAppointments = appointmentsByDay[selectedKey] || [];
  const isToday = (key) => key === getTodayKey();
  const isSelected = (key) => key === selectedKey;

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="calendar">
      <div className="calendarHeader">
        <button type="button" className="navBtn" onClick={goPrev} aria-label="Previous month">
          ‹
        </button>
        <h2 className="calendarTitle">{monthLabel}</h2>
        <button type="button" className="navBtn" onClick={goNext} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="calendarGrid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekdayHead">
            {w}
          </div>
        ))}
        {days.map((cell, i) => {
          const selected = isSelected(cell.key);
          const col = (i % 7) + 1;
          const row = Math.floor(i / 7) + 2;
          const startCol = Math.max(1, Math.min(col, 4));
          const startRow = Math.min(row, 4);
          return (
            <button
              key={i}
              type="button"
              className={`dayCell ${cell.isOtherMonth ? "otherMonth" : ""} ${isToday(cell.key) ? "today" : ""} ${selected ? "selected" : ""}`}
              style={
                selected
                  ? {
                      gridColumn: `${startCol} / span 4`,
                      gridRow: `${startRow} / span 4`,
                    }
                  : undefined
              }
              onClick={() => cell.key && setSelectedKey(cell.key)}
              disabled={!cell.key}
            >
              <span className="dayNum">{cell.day}</span>
              {!selected && cell.key && (appointmentsByDay[cell.key]?.length || 0) > 0 && (
                <span className="dayDots">
                  {appointmentsByDay[cell.key].slice(0, 3).map((_, j) => (
                    <span key={j} className="dot" />
                  ))}
                </span>
              )}
              {selected && (
                <div className="dayContent">
                  <div className="dayLabel">
                    {selectedKey
                      ? new Date(selectedKey + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : null}
                  </div>
                  <div className="dayAppointments">
                    {selectedAppointments.length === 0 ? (
                      <p className="dayEmpty">No appointments</p>
                    ) : (
                      selectedAppointments.map((a) => (
                        <div key={a.id} className="appointmentMini">
                          <span className="miniTime">{a.time}</span>
                          <span className="miniClient">{a.client?.name || "—"}</span>
                          <span className="miniMeta">
                            {a.duration} min • {a.location}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
