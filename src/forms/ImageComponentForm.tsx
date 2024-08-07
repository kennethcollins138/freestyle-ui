import { Devvit } from '@devvit/public-api';

interface ImageFormData {
  url: string;
  width: string;
  height: string;
  resizeMode: 'fit' | 'fill' | 'cover';
}

export const ImageComponentForm = (context: Devvit.Context, onSubmit: (data: ImageFormData) => void) => {
  return context.useForm(
    {
      fields: [
        { name: 'url', label: 'Image URL', type: 'string', required: true },
        { name: 'width', label: 'Width', type: 'string', defaultValue: '100' },
        { name: 'height', label: 'Height', type: 'string', defaultValue: '100' },
        {
          name: 'resizeMode',
          label: 'Resize Mode',
          type: 'select',
          options: [
            { label: 'Fit', value: 'fit' },
            { label: 'Fill', value: 'fill' },
            { label: 'Cover', value: 'cover' }
          ],
        }
      ],
      title: 'Add Image',
      acceptLabel: 'Add',
    },
    onSubmit
  );
};
