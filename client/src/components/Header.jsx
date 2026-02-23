import "./Header.css";

export default function Header({ currentPage, onPageChange }) {
  return (
    <header className="appHeader">
      <h1 className="appTitle">HairStylist Management</h1>
      <nav className="navTabs">
        <button
          type="button"
          className={`navTab ${currentPage === "appointment" ? "active" : ""}`}
          onClick={() => onPageChange("appointment")}
        >
          Appointment
        </button>
        <button
          type="button"
          className={`navTab ${currentPage === "client" ? "active" : ""}`}
          onClick={() => onPageChange("client")}
        >
          Client
        </button>
      </nav>
    </header>
  );
}
