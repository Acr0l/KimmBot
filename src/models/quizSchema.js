const mongoose = require("mongoose");

/**
 * @typedef Question
 * @property { import('mongoose').Types.ObjectId } _id
 * @property {String} subject
 * @property { Number } difficulty
 * @property {String} question
 * @property { String } correct_answer
 * @property { String[] } incorrect_answers
 * @property { String } [image]
 * @property { ('MC'|'TF'|'INPUT') } type
 * @property { ('Warmup'|'Workout'|'Challenge') } category
 * @property { ('es'|'en')} lang
 * @property { Date } created_at
 * @property { Date } updated_at
 */
const quizSchema = new mongoose.Schema({
  // Subject of the problem.
  subject: { type: String, required: true },
  // Difficulty of the problem.
  difficulty: { type: Number, required: true },
  // The question.
  question: { type: String, required: true },
  // The answer.
  correct_answer: { type: String, required: true },
  // The incorrect answers.
  incorrect_answers: { type: [String], required: true, default: [] },
  // Complementary information (URL)
  image: { type: String, required: false },
  // Type of the question: multiple choice, true/false, etc.
  type: { type: String, required: true },
  // The category of the question: Warmup, Workout, etc.
  category: { type: String, required: true },
  lang: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const model = mongoose.model("QuizModel", quizSchema);

module.exports = model;
