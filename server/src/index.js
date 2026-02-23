const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { connectToMongo } = require("./db");
const { createAppointment, listAppointments } = require("./services/appointmentService");
const {
  listClients,
  getClientById,
  createClient,
  updateClient,
} = require("./services/clientService");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const INIT_ROUTE = process.env.INIT_ROUTE || "/";
const clientBuildPath = path.resolve(__dirname, "../../client/dist");

// Initialize Mongo connection if configured
connectToMongo();

// API routes
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

app.get("/api/helloworld", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("/api/appointments", async (req, res) => {
  try {
    const month = req.query.month || "";
    const appointments = await listAppointments(month);
    res.json(appointments);
  } catch (err) {
    console.error("[GET /api/appointments] error", err);
    res.status(500).json({ error: "Failed to list appointments" });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    const clients = await listClients();
    res.json(clients);
  } catch (err) {
    console.error("[GET /api/clients] error", err);
    res.status(500).json({ error: "Failed to list clients" });
  }
});

app.get("/api/clients/:id", async (req, res) => {
  try {
    const client = await getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("[GET /api/clients/:id] error", err);
    res.status(500).json({ error: "Failed to get client" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const client = await createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    console.error("[POST /api/clients] error", err);
    res.status(500).json({ error: "Failed to create client" });
  }
});

app.put("/api/clients/:id", async (req, res) => {
  try {
    const client = await updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("[PUT /api/clients/:id] error", err);
    res.status(500).json({ error: "Failed to update client" });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const appointment = await createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    console.error("[POST /api/appointments] error", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// Serve React build
app.use(INIT_ROUTE, express.static(clientBuildPath));

// SPA fallback to index.html for any unmatched route
// Use a RegExp to avoid path-to-regexp "*" issues
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
