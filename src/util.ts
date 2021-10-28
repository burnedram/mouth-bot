import { CommandInteraction, GuildMember } from 'discord.js';

export function getGuildMember(
  command: CommandInteraction
): GuildMember | undefined {
  if (!command.inGuild()) {
    command.editReply(
      "You're not in a guild, or I'm not in your guild? I don't know Discord is confusing"
    );
    return undefined;
  }

  const member = command.member;
  if (!member || !(member instanceof GuildMember)) {
    command.editReply(
      "You're not a member of this guild, or I'm not? I don't know Discord is confusing"
    );
    return undefined;
  }

  return member;
}
