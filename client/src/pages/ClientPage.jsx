import { useCallback, useEffect, useState } from "react";
import "./ClientPage.css";

const EMPTY = { nome: "", cognome: "", dataDiNascita: "", numeroDiTelefono: "", email: "" };

export default function ClientPage() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isNew, setIsNew] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (res.ok) setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load clients");
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (selected) {
      setForm({
        nome: selected.nome ?? "",
        cognome: selected.cognome ?? "",
        dataDiNascita: selected.dataDiNascita ?? "",
        numeroDiTelefono: selected.numeroDiTelefono ?? "",
        email: selected.email ?? "",
      });
      setIsNew(false);
    } else if (!isNew) {
      setForm(EMPTY);
    }
  }, [selected, isNew]);

  const handleSelect = (c) => {
    setSelected(c);
    setIsNew(false);
  };

  const handleNewClient = () => {
    setIsNew(true);
    setSelected(null);
    setForm(EMPTY);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    const request = isNew
      ? fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : fetch(`/api/clients/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

    request
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Request failed");
        return data;
      })
      .then((saved) => {
        if (isNew) {
          setClients((prev) => [...prev, saved]);
          setSelected(saved);
          setIsNew(false);
        } else {
          setClients((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
          setSelected(saved);
        }
      })
      .catch((err) => setError(err?.message || (isNew ? "Failed to create client" : "Failed to update")))
      .finally(() => setIsSaving(false));
  };

  return (
    <>
      {isSaving && (
        <div className="screenLoader">
          <div className="screenLoaderInner">
            <div className="screenLoaderSpinner" />
            <span>Salvataggio cliente in corso...</span>
          </div>
        </div>
      )}
      <div className="clientPage">
      <div className="clientList">
        <div className="clientListHeader">
          <h2 className="sectionTitle">Clienti</h2>
          <button type="button" className="clientNewButton" onClick={handleNewClient}>
            + Nuovo
          </button>
        </div>
        {clients.length === 0 ? (
          <p className="emptyMsg">Nessun cliente</p>
        ) : (
          <ul className="clientListUl">
            {clients.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`clientItem ${selected?.id === c.id ? "active" : ""}`}
                  onClick={() => handleSelect(c)}
                >
                  {c.cognome} {c.nome}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="clientDetail">
        {error && <div className="alert">{error}</div>}
        {isNew || selected ? (
          <form onSubmit={handleSave} className="clientForm">
            <h2 className="sectionTitle">{isNew ? "Nuovo cliente" : "Modifica cliente"}</h2>
            <div className="formField">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                className="input"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="formField">
              <label htmlFor="cognome">Cognome</label>
              <input
                id="cognome"
                className="input"
                value={form.cognome}
                onChange={(e) => setForm((f) => ({ ...f, cognome: e.target.value }))}
                required
              />
            </div>
            <div className="formField">
              <label htmlFor="dataDiNascita">Data di nascita</label>
              <input
                id="dataDiNascita"
                className="input"
                type="date"
                value={form.dataDiNascita}
                onChange={(e) => setForm((f) => ({ ...f, dataDiNascita: e.target.value }))}
              />
            </div>
            <div className="formField">
              <label htmlFor="numeroDiTelefono">Numero di telefono</label>
              <input
                id="numeroDiTelefono"
                className="input"
                type="tel"
                value={form.numeroDiTelefono}
                onChange={(e) => setForm((f) => ({ ...f, numeroDiTelefono: e.target.value }))}
              />
            </div>
            <div className="formField">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <button type="submit" className="button" disabled={isSaving}>
              {isSaving ? "Salvataggio..." : isNew ? "Crea cliente" : "Salva modifiche"}
            </button>
          </form>
        ) : (
          <p className="emptyMsg">Seleziona un cliente per modificarlo</p>
        )}
      </div>
      </div>
    </>
  );
}
