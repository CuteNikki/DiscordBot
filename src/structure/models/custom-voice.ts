import mongoose, { Model, model, Schema } from 'mongoose';

import type { CustomVoiceDocument } from 'types/custom-voice';

export const customVoiceModel: Model<CustomVoiceDocument> =
  mongoose.models['custom_voice'] ||
  model<CustomVoiceDocument>(
    'custom_voice',
    new Schema<CustomVoiceDocument>({
      guildId: { type: String, required: true },
      channelId: { type: String, required: true },
      parentId: { type: String, required: true }
    })
  );
