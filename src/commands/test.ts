import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';

@Discord()
class TestCommand {
  @SimpleCommand('test')
  test(command: SimpleCommandMessage) {
    command.message.reply(`ät bajs ${command.message.member?.displayName}`);
  }
}
