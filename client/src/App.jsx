import { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import ClientPage from "./pages/ClientPage";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("appointment");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("Segrate");
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (res.ok) setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  }, []);

  const selectedClient = useMemo(() => {
    const c = clients.find((x) => x.id === clientId);
    return c ? { id: c.id, name: `${c.cognome} ${c.nome}` } : null;
  }, [clients, clientId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (clients.length > 0 && !clientId) setClientId(clients[0].id);
  }, [clients, clientId]);

  useEffect(() => {
    // When built and served by Express, this hits the same origin
    fetch("/api/helloworld")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message ?? JSON.stringify(data));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load hello world from API");
      });
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    const appointment = {
      day,
      time,
      duration,
      location,
      client: selectedClient,
      note,
    };
    fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointment),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Request failed");
        return data;
      })
      .then((saved) => {
        setSubmitted(saved);
        setIsModalOpen(false);
        fetchAppointments();
      })
      .catch((err) => {
        console.error("Failed to save appointment", err);
        setError(err?.message || "Failed to save appointment");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="page">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />

      {currentPage === "client" ? (
        <ClientPage />
      ) : (
        <>
      <div className="topbar">
        <div>
          <p className="subtitle">Appointments</p>
        </div>
      </div>

      <main className="container">
        {error && <div className="alert">{error}</div>}

        <section className="card">
          <Calendar appointments={appointments} />
        </section>
      </main>

      <button
        className="fab"
        type="button"
        aria-label="Create appointment"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>

      {isModalOpen && (
        <div
          className="modalOverlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modalHeader">
              <div>
                <h2 className="modalTitle">New appointment</h2>
                <p className="modalSubtitle">
                  Set day, time, duration, location and client.
                </p>
              </div>
              <button
                type="button"
                className="iconButton"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="grid2">
                <div className="field">
                  <label className="label" htmlFor="day">
                    Day
                  </label>
                  <input
                    className="input"
                    id="day"
                    type="date"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="time">
                    Time
                  </label>
                  <input
                    className="input"
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label className="label" htmlFor="duration">
                    Duration (minutes)
                  </label>
                  <input
                    className="input"
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="location">
                    Location
                  </label>
                  <select
                    className="input"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="Segrate">Segrate</option>
                    <option value="Milan">Milan</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="client">
                  Client
                </label>
                <select
                  className="input"
                  id="client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="">— Seleziona cliente —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cognome} {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="note">
                  Note (optional)
                </label>
                <textarea
                  className="input textarea"
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional information..."
                />
              </div>

              <div className="modalActions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default App;
