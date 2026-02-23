const { mongoose } = require("../db");

const appointmentSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    location: { type: String, enum: ["Segrate", "Milan"], required: true },
    client: {
      id: String,
      name: String,
    },
    note: String,
  },
  {
    timestamps: true,
  }
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

