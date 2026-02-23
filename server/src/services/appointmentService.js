const Appointment = require("../models/appointment");

// In-memory store when MONGO_URI is not set
const mockStore = [];

async function createAppointment(data) {
  const hasMongoUri = !!process.env.MONGO_URI;

  if (!hasMongoUri) {
    const mock = {
      id: "mock-" + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockStore.push(mock);
    console.log("[appointmentService] Mongo not configured, mock save:", mock);
    return mock;
  }

  const doc = await Appointment.create(data);
  return doc.toObject();
}

async function listAppointments(month) {
  // month = "YYYY-MM"
  const hasMongoUri = !!process.env.MONGO_URI;

  if (!hasMongoUri) {
    const [year, m] = (month || "").split("-").map(Number);
    const dayStart = year && m ? `${year}-${String(m).padStart(2, "0")}-01` : "0000-01-01";
    const lastDay = year && m ? new Date(year, m, 0).getDate() : 31;
    const dayEnd = year && m ? `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}` : "9999-12-31";

    return mockStore.filter((a) => a.day >= dayStart && a.day <= dayEnd);
  }

  const [year, m] = (month || "").split("-").map(Number);
  const dayStart = year && m ? `${year}-${String(m).padStart(2, "0")}-01` : "0000-01-01";
  const lastDay = year && m ? new Date(year, m, 0).getDate() : 31;
  const dayEnd = year && m ? `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}` : "9999-12-31";

  const docs = await Appointment.find({
    day: { $gte: dayStart, $lte: dayEnd },
  })
    .sort({ day: 1, time: 1 })
    .lean();
  return docs;
}

module.exports = {
  createAppointment,
  listAppointments,
};

