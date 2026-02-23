const Client = require("../models/client");

const mockStore = [
  { id: "1", nome: "Alice", cognome: "Rossi", dataDiNascita: "1990-05-15", numeroDiTelefono: "+39 333 1234567", email: "alice.rossi@email.it" },
  { id: "2", nome: "Marco", cognome: "Bianchi", dataDiNascita: "1985-11-20", numeroDiTelefono: "+39 320 7654321", email: "marco.bianchi@email.it" },
  { id: "3", nome: "Giulia", cognome: "Verdi", dataDiNascita: "1992-03-08", numeroDiTelefono: "+39 347 1112233", email: "giulia.verdi@email.it" },
];

function nextId() {
  const max = mockStore.reduce((m, c) => Math.max(m, parseInt(c.id, 10) || 0), 0);
  return String(max + 1);
}

async function listClients() {
  const hasMongoUri = !!process.env.MONGO_URI;
  if (!hasMongoUri) return [...mockStore];
  const docs = await Client.find().sort({ cognome: 1, nome: 1 }).lean();
  return docs.map((d) => ({ ...d, id: d._id?.toString() }));
}

async function getClientById(id) {
  const hasMongoUri = !!process.env.MONGO_URI;
  if (!hasMongoUri) {
    const c = mockStore.find((x) => x.id === id);
    return c ? { ...c } : null;
  }
  const doc = await Client.findById(id).lean();
  if (!doc) return null;
  return { ...doc, id: doc._id.toString() };
}

async function createClient(data) {
  const hasMongoUri = !!process.env.MONGO_URI;
  if (!hasMongoUri) {
    const c = { id: nextId(), ...data };
    mockStore.push(c);
    return c;
  }
  const doc = await Client.create(data);
  return { ...doc.toObject(), id: doc._id.toString() };
}

async function updateClient(id, data) {
  const hasMongoUri = !!process.env.MONGO_URI;
  if (!hasMongoUri) {
    const idx = mockStore.findIndex((x) => x.id === id);
    if (idx < 0) return null;
    mockStore[idx] = { ...mockStore[idx], ...data };
    return mockStore[idx];
  }
  const doc = await Client.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!doc) return null;
  return { ...doc, id: doc._id.toString() };
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
};
