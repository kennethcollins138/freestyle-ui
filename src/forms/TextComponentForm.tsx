import { Devvit } from '@devvit/public-api';

interface TextFormData {
  text: string;
  size: 'small' | 'medium' | 'large';
  color: string;
}

export const TextComponentForm = (context: Devvit.Context, onSubmit: (data: TextFormData) => void) => {
  return context.useForm(
    {
      fields: [
        { name: 'text', label: 'Text', type: 'string', required: true },
        {
          name: 'size',
          label: 'Size',
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
        },
        { name: 'color', label: 'Color', type: 'string', defaultValue: 'black' }
      ],
      title: 'Add Text',
      acceptLabel: 'Add',
    },
    onSubmit
  );
};
