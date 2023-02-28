const express = require("express"),
  router = express.Router(),
  { createItem, createQuiz, createChallenge } = require("../util/constructors"),
  { subjects } = require("../../util/subjects.json");

const options = {
  item: [
    {
      name: "itemName",
      placeholder: "Item Name",
      type: "text",
      required: true,
    },
    {
      name: "itemType",
      label: "Item Type",
      placeholder: "Item Type",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: 0,
          value: "Equipment",
        },
        {
          name: 1,
          value: "Consumable",
        },
        {
          name: 2,
          value: "Special Consumable",
        },
        {
          name: 3,
          value: "Quest",
        },
      ],
    },
    {
      name: "itemTier",
      label: "Item Tier",
      placeholder: "Item Tier",
      type: "number",
      required: true,
      dropdown: true,
      options: [
        {
          name: 0,
          value: "Common",
        },
        {
          name: 1,
          value: "Uncommon",
        },
        {
          name: 2,
          value: "Rare",
        },
        {
          name: 3,
          value: "Epic",
        },
        {
          name: 4,
          value: "Legendary",
        },
        {
          name: 5,
          value: "Mythic",
        },
      ],
    },
    {
      name: "itemPrice",
      placeholder: "Item Price",
      type: "number",
      required: true,
    },
    {
      name: "itemUse",
      placeholder: "<required> [optional]",
      type: "text",
      required: false,
    },
    {
      name: "itemPath",
      placeholder: "dir/file.js",
      type: "text",
      required: true,
    },
    {
      name: "itemUnique",
      placeholder: "Item Unique",
      type: "checkbox",
      required: false,
    },
  ],
  quiz: [
    {
      name: "quizSubject",
      label: "Subject",
      placeholder: "Subject",
      type: "text",
      required: true,
      dropdown: true,
      options: Object.keys(subjects).map((key) => {
        return {
          name: key,
          value: key,
        };
      }),
    },
    {
      name: "quizDifficulty",
      placeholder: "Difficulty",
      type: "number",
      min: "1",
      step: "0.01",
      required: true,
    },
    {
      name: "quizQuestion",
      placeholder: "? for English and ¿? for Spanish",
      type: "text",
      required: true,
    },
    {
      name: "answerCorrect",
      placeholder: "Correct answer",
      type: "text",
      required: true,
    },
    {
      name: "answerIncorrect",
      placeholder: "Incorrect answers separated by a comma ','",
      type: "text",
      required: true,
    },
    {
      name: "quizImage",
      placeholder: "Imgur image link",
      type: "url",
      required: false,
    },
    {
      name: "quizType",
      label: "Type",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: "MC",
          value: "Multiple Choice",
        },
        {
          name: "T/F",
          value: "True/False",
        },
        {
          name: "Fill",
          value: "Fill in the blank",
        },
      ],
    },
    {
      name: "quizCategory",
      label: "Category",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: "Warmup",
          value: "Warmup",
        },
        {
          name: "Workout",
          value: "Workout",
        },
        {
          name: "Challenge",
          value: "Challenge",
        },
        {
          name: "Other",
          value: "Other",
        },
      ],
    },
    {
      name: "quizLang",
      label: "Language",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: "en",
          value: "English",
        },
        {
          name: "es",
          value: "Spanish",
        },
      ],
    },
  ],
  challenge: [
    {
      name: "subject",
      label: "Subject",
      placeholder: "Subject",
      type: "text",
      required: true,
      dropdown: true,
      options: Object.keys(subjects).map((key) => {
        return {
          name: key,
          value: key,
        };
      }),
    },
    {
      name: "tier",
      placeholder: "Tier",
      type: "number",
      min: "0",
      max: 10,
      step: "1",
      required: true,
    },
    {
      name: "difficulty",
      placeholder: "Difficulty",
      type: "number",
      min: "1",
      step: "0.01",
      max: 100,
      required: true,
    },
    {
      name: "question",
      placeholder: "? for English and ¿? for Spanish",
      type: "text",
      required: true,
    },
    {
      name: "correct_answers",
      placeholder: 'Correct answer as an array, separated by ":"',
      type: "text",
      required: true,
    },
    {
      name: "image",
      placeholder: "Imgur image link",
      type: "url",
      required: false,
    },
    {
      name: "type",
      label: "Type",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: "Input",
          value: "Input",
        },
        {
          name: "Sequence",
          value: "Sequence",
        },
        {
          name: "SeqInp",
          value: "Input Sequence",
        },
      ],
    },
    {
      name: "lang",
      label: "Language",
      type: "text",
      required: true,
      dropdown: true,
      options: [
        {
          name: "en",
          value: "English",
        },
        {
          name: "es",
          value: "Spanish",
        },
      ],
    },
  ],
};
let formResponse = {};

// Main menu -> display requests and create items.
router.get("/", async (req, res) => {
  if (req.query.submit == "Yes") {
    // Create item
    if (formResponse.item) {
      delete formResponse.item;
      if (await createItem(formResponse)) res.redirect("/");
      else res.send("Error creating item");
    } else if (formResponse.quiz) {
      // Create quiz
      delete formResponse.quiz;
      if (await createQuiz(formResponse)) res.redirect("/");
      else res.send("Error creating quiz");
    } else if (formResponse.challenge) {
      // Create Challenge
      delete formResponse.challenge;
      // @ts-ignore
      if (await createChallenge(formResponse)) res.redirect("/");
      else res.send("Error creating quiz");
    } else res.send("Error");
  } else if (req.query.submit == "No") {
    // Cancel
    console.log("Item Creation Cancelled");
    res.redirect("/");
  } else res.render("menu");
});

router.get("/item", async (req, res) => {
  res.render("creator", {
    items: options["item"],
    title: "Item Creator",
    type: "item",
  });
});

router.get("/quiz", async (req, res) => {
  res.render("creator", {
    items: options["quiz"],
    title: "Quiz Creator",
    type: "quiz",
  });
});

router.get("/challenge", async (req, res) => {
  res.render("creator", {
    items: options["challenge"],
    title: "Challenge Creator",
    type: "challenge",
  });
});

router.get("/create", (req, res) => {
  formResponse = req.query;
  if (formResponse.item) {
    const nameToDesc = formResponse.itemName.replace(/\s/g, "_");
    formResponse["itemDescription"] = `ITEM_${nameToDesc.toUpperCase()}`;
    if (formResponse["itemUnique"]) formResponse["itemUnique"] = true;
    else formResponse["itemUnique"] = false;
  } else if (formResponse.quiz) {
    formResponse["answerIncorrect"] =
      formResponse["answerIncorrect"].split(":");
    if (!formResponse["quizImage"]) delete formResponse["quizImage"];
  } else if (formResponse.challenge) {
    formResponse["correct_answers"] =
      formResponse["correct_answers"].split(":");
  }
  console.log(formResponse);
  res.render("confirmation", { values: formResponse });
});

module.exports = router;
