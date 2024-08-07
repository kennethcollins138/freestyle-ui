import { Devvit } from '@devvit/public-api';

interface StackFormData {
  width: string;
  height: string;
}

export const StackComponentForm = (context: Devvit.Context, type: string, onSubmit: (data: StackFormData) => void) => {
  return context.useForm(
    {
      fields: [
        { name: 'width', label: 'Width', type: 'string', defaultValue: '100' },
        { name: 'height', label: 'Height', type: 'string', defaultValue: '100' }
      ],
      title: `Add ${type}`,
      acceptLabel: 'Add',
    },
    onSubmit
  );
};
