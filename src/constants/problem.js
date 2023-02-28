const Types = {
  MC: "MC",
  SEQUENCE: "Sequence",
  SEQINP: "SeqInp",
  INPUT: "Input",
  INPUTS: ["SeqInp", "Input"],
};

/**
 * @type {{ Base: Number }} - Number of alternatives for a basic question.
 */
const Alternatives = {
  Base: 5,
};

const ButtonTypes = {
  GET_HINT: "getHint",
};

module.exports = {
  Types,
  Alternatives,
  ButtonTypes,
};
