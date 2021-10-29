import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Player } from '../player';
import { getGuildMember } from '../util';

@Discord()
class SkipCommand {
  @Slash('skip', { description: 'Skip some songs' })
  async skip(
    @SlashOption('amount', {
      type: 'INTEGER',
      description: 'Amount of songs to skip'
    })
    amount: number | undefined,
    command: CommandInteraction
  ) {
    await command.deferReply();
    const member = getGuildMember(command);
    if (!member) return;

    const player = Player.find(member.guild.id);
    if (!player) {
      command.editReply(`Nothing to skip :)`);
    } else {
      const skipped = player.skip(amount ?? 1);
      command.editReply(
        `Skipped ${skipped.length} song${skipped.length === 1 ? '' : 's'}!`
      );
    }
  }
}
