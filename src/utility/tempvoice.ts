import type { VoiceBasedChannel } from 'discord.js';

export async function renameVoiceChannel(channel: VoiceBasedChannel, newName: string): Promise<boolean> {
  try {
    await channel.setName(newName, 'Renamed temporary voice channel');
    return true;
  } catch (error) {
    console.error('Error renaming temporary voice channel:', error);
    return false;
  }
}

export async function setVoiceChannelUserLimit(channel: VoiceBasedChannel, userLimit: number): Promise<boolean> {
  try {
    await channel.setUserLimit(userLimit, 'Set user limit for temporary voice channel');
    return true;
  } catch (error) {
    console.error('Error setting user limit for temporary voice channel:', error);
    return false;
  }
}

export async function setVoiceChannelVisibility(channel: VoiceBasedChannel, isVisible: boolean): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      ViewChannel: isVisible,
    });
    return true;
  } catch (error) {
    console.error('Error setting visibility for temporary voice channel:', error);
    return false;
  }
}

export async function setVoiceChannelAccess(
  channel: VoiceBasedChannel,
  targetId: string,
  canAccess: boolean,
  invited = false,
): Promise<boolean> {
  try {
    const isEveryone = targetId === channel.guild.roles.everyone.id;

    await channel.permissionOverwrites.edit(targetId, {
      Connect: canAccess,
      Speak: isEveryone ? undefined : canAccess,
      SendMessages: isEveryone ? undefined : canAccess,
      ViewChannel: invited ? true : undefined,
    });
    return true;
  } catch (error) {
    console.error('Error setting access for temporary voice channel:', error);
    return false;
  }
}

export async function transferVoiceChannelOwnershipPermissions(channel: VoiceBasedChannel, newOwnerId: string): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(newOwnerId, {
      Connect: true,
      Speak: true,
      ViewChannel: true,
      SendMessages: true,
      ManageChannels: true,
    });
    return true;
  } catch (error) {
    console.error('Error transferring ownership of temporary voice channel:', error);
    return false;
  }
}

export async function kickUserFromVoiceChannel(channel: VoiceBasedChannel, userId: string): Promise<boolean> {
  try {
    const member = channel.members.get(userId);
    if (member) {
      await member.voice.disconnect('Kicked from temporary voice channel');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error kicking user from temporary voice channel:', error);
    return false;
  }
}

export async function banUserFromVoiceChannel(channel: VoiceBasedChannel, userId: string): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(userId, {
      Connect: false,
      Speak: false,
    });

    const member = channel.members.get(userId);
    if (member) {
      await member.voice.disconnect('Banned from temporary voice channel').catch(() => null);
    }

    return true;
  } catch (error) {
    console.error('Error banning user from temporary voice channel:', error);
    return false;
  }
}

export async function unbanUserFromVoiceChannel(channel: VoiceBasedChannel, userId: string): Promise<boolean> {
  try {
    await channel.permissionOverwrites.delete(userId);
    return true;
  } catch (error) {
    console.error('Error unbanning user from temporary voice channel:', error);
    return false;
  }
}

export async function resetVoiceChannelPermissions(channel: VoiceBasedChannel, userId: string): Promise<boolean> {
  try {
    await channel.permissionOverwrites.delete(userId);
    return true;
  } catch (error) {
    console.error('Error resetting permissions for temporary voice channel:', error);
    return false;
  }
}
