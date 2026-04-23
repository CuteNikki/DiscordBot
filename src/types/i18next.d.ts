import 'i18next';
import enCommands from 'locales/en-GB/commands.json';
import enMessages from 'locales/en-GB/messages.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enMessages & typeof enCommands;
    };
  }
}
