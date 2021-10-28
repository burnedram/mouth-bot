import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  PlayerSubscription,
  VoiceConnection,
  VoiceConnectionStatus
} from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { YoutubeInfo } from './youtube';

export class Player {
  private static BY_GUILD: Map<string, Player> = new Map();

  public static create(guildId: string, info: YoutubeInfo) {
    let player = this.BY_GUILD.get(guildId);
    if (player)
      throw new Error(`[Player] A player for guild ${guildId} already exists`);

    player = new Player(guildId, info);
    this.BY_GUILD.set(guildId, player);
    return player;
  }

  public static find(guildId: string) {
    return this.BY_GUILD.get(guildId);
  }

  private readonly queue: YoutubeInfo[] = [];
  private readonly player: AudioPlayer = createAudioPlayer();

  private voiceSubscription?: PlayerSubscription;

  private constructor(
    public readonly guildId: string,
    public current: YoutubeInfo
  ) {
    const voiceConnection = getVoiceConnection(guildId);
    if (!voiceConnection) {
      console.warn(
        `[Player] Constructor called without a voice connection in guild ${this.guildId}`
      );
    } else this.subscribe(voiceConnection);

    this.player.on('stateChange', (oldState, newState) => {
      if (newState.status === AudioPlayerStatus.Idle) this.next();
    });

    this.play(current);
  }

  public subscribe(voiceConnection: VoiceConnection) {
    if (this.voiceSubscription) this.voiceSubscription.unsubscribe();
    this.voiceSubscription = voiceConnection.subscribe(this.player);
  }

  public getQueue() {
    return this.queue as ReadonlyArray<YoutubeInfo>;
  }

  public enqueue(info: YoutubeInfo) {
    this.queue.push(info);
  }

  public getStatus() {
    return this.player.state.status;
  }

  public isPlaying() {
    const status = this.getStatus();
    return (
      status !== AudioPlayerStatus.Idle && status !== AudioPlayerStatus.Paused
    );
  }

  public next() {
    console.log('next');
    const next = this.queue.shift();
    if (!next) {
      this.stop();
      return;
    }

    this.play(next);
  }

  public skip(amount: number) {
    amount = Math.max(1, Math.min(amount, this.queue.length + 1));
    const skipped = [this.current, ...this.queue.splice(0, amount - 1)];
    this.next();
    return skipped;
  }

  private play(info: YoutubeInfo) {
    this.current = info;
    const resource = createAudioResource(info.chosenFormat.url, {
      metadata: info
    });
    this.player.play(resource);
  }

  public stop() {
    console.log('stop');
    const voiceConnection = getVoiceConnection(this.guildId);
    if (!voiceConnection)
      console.warn(
        `[Player] Tried to stop without a voice connection in guild ${this.guildId}`
      );
    else if (voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
      voiceConnection.destroy();

    Player.BY_GUILD.delete(this.guildId);
    this.player.stop();
  }
}
