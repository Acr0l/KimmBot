const mongoose = require("mongoose");
const { SUBJECTS } = require("../constants/subjects");

const challengeSchema = new mongoose.Schema({
  // Subject of the problem.
  subject: { type: String, required: true, enum: SUBJECTS },
  // Tier of the problem.
  tier: { type: Number, required: true, min: 0, max: 10 },
  // Difficulty of the problem.
  difficulty: { type: Number, required: true, min: 0, max: 100 },
  // The question.
  question: { type: String, required: true },
  // The answer.
  correct_answers: { type: [String], required: true },
  // Complementary information (URL)
  image: { type: String, required: false },
  // Type of the question: multiple choice, true/false, etc.
  type: { type: String, required: true, enum: ["SeqInp", "Input", "Sequence"] },
  lang: { type: String, required: true, enum: ["en", "es"] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const model = mongoose.model("Challenges", challengeSchema);

module.exports = model;
