const { ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { Types } = require("../constants/problem");
const { MenuCreator } = require("./problemGens");

module.exports = { hintHandler: async function({
    question,
    options,
    profileData,
    guild,
    embed,
    hintEmoji,
    hintButton,
    hintCollector,
    i,
  }) {
    if (question.type !== Types.MC || options.hint) return;
    // Check if the user has a hint.
    const hintInvHandler = require("../subcommands/use");
    i["item"] = "Hint";
    hintInvHandler.execute(i, profileData);
    const rowHint = new ActionRowBuilder().addComponents(
        MenuCreator({ guild, question, difference: 1, options })
      ),
      hintEmbed = new EmbedBuilder(embed).setTitle(
        `${hintEmoji} ${question.question}`
      );
    // Set the hint as used
    options.hint = true;
    // Reply with the hint
    await i.update({
      embeds: [hintEmbed],
      ephemeral: true,
      components: [rowHint, hintButton(true)],
    });
    hintCollector.stop();
  }
};