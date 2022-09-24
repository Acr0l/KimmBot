const { Alternatives } = require("../constants/problem");

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

exports.shuffleAlternatives = (number, question) => {
  const options = [];
  let alternatives = [];
  for (let i = 0; i < number; i++) {
    if (i === 0) {
      alternatives.push(question.correct_answer);
    } else {
      alternatives.push(question.incorrect_answers[i - 1]);
    }
  }
  alternatives = shuffle(alternatives);

  for (let i = 0; i < alternatives.length; i++) {
    options[i] = {
      label: alternatives[i],
      value: alternatives[i],
    };
  }

  return options;
};

exports.numberOfAlternatives = (question) => {
  return question.incorrect_answers.length >= Alternatives.Base - 1
    ? Alternatives.Base
    : question.incorrect_answers.length + 1;
};
