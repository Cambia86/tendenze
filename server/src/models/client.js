const { mongoose } = require("../db");

const clientSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    dataDiNascita: String,
    numeroDiTelefono: String,
    email: String,
  },
  { timestamps: true }
);

const Client =
  mongoose.models.Client || mongoose.model("Client", clientSchema);

module.exports = Client;
