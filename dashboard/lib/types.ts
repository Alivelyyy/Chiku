export interface BotStats {
  username: string;
  avatar: string;
  guilds: number;
  users: number;
  players: number;
  commands: number;
  aliases: number;
  memory: number;
  uptime: number;
  ping: number;
  shards: number;
  readyAt: string | null;
}

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  prefix?: string;
  hasPlayer: boolean;
  voiceChannel: string | null;
}

export interface Track {
  title: string;
  author: string;
  uri: string;
  length: number;
  thumbnail: string | null;
  isStream: boolean;
  sourceName: string;
  requester: string;
  requesterId: string | null;
  index?: number;
}

export interface PlayerState {
  active?: boolean;
  isPlaying?: boolean;
  playing?: boolean;
  paused?: boolean;
  volume?: number;
  loop?: "none" | "track" | "queue";
  current?: Track | null;
  position?: number;
  shuffle?: boolean;
  currentTrack?: Track | null;
  queueLength?: number;
  autoplay?: boolean;
  alwaysOn?: boolean;
  voiceChannelId?: string;
  voiceChannelName?: string | null;
  listenerCount?: number;
  textChannelId?: string;
  effects?: string;
  hasPrevious?: boolean;
}

export interface QueueData {
  tracks: Track[];
  total: number;
}

export interface GuildSettings {
  guildId: string;
  prefix: string;
  djRole: string | null;
  musicChannel: string | null;
  alwaysOn: boolean;
  autoplay: boolean;
  defaultVolume: number;
  announceSongs: boolean;
  deleteNPAfter: number;
  language: string;
}

export interface Role { id: string; name: string; color: number; }
export interface Channel { id: string; name: string; }

export interface SettingsData {
  settings: GuildSettings;
  roles: Role[];
  channels: Channel[];
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}
