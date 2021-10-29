import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Player } from '../player';
import { getGuildMember } from '../util';

@Discord()
class VolumeCommand {
  @Slash('volume', { description: 'Get or change volume' })
  async volume(
    @SlashOption('volume', {
      type: 'NUMBER',
      description: 'A number between 0 and 1, omit to get current volume'
    })
    volume: number | undefined,
    command: CommandInteraction
  ) {
    await command.deferReply();
    const member = getGuildMember(command);
    if (!member) return;

    const player = Player.find(member.guild.id);
    if (!player) {
      command.editReply("I'm not playing anything for you right now :).");
      return;
    }
    if (volume === undefined) {
      command.editReply(
        `Volume is set to ${(player.getVolume() * 100).toLocaleString('en-US', {
          maximumFractionDigits: 0
        })}%.`
      );
      return;
    }

    const newVolume = player.setVolume(volume);
    command.editReply(
      `Volume set to ${(newVolume * 100).toLocaleString('en-US', {
        maximumFractionDigits: 0
      })}%!`
    );
  }
}
