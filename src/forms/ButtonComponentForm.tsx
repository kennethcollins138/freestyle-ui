import { Devvit } from '@devvit/public-api';

export const ButtonComponentForm = (context: Devvit.Context , onSubmit) => {
  return context.useForm(
    {
      fields: [
        { name: 'text', label: 'Button Text', type: 'string', required: true },
        { name: 'url', label: 'Button URL', type: 'string', required: true }
      ],
      title: 'Add Link Button',
      acceptLabel: 'Add',
    },
    onSubmit
  );
};
