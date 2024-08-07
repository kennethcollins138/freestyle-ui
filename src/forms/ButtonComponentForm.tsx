import { Devvit, IconName } from '@devvit/public-api';

interface ButtonFormData {
  icon?: string;
  size: Devvit.Blocks.ButtonSize;
  appearance: Devvit.Blocks.ButtonAppearance;
  isGrow?: boolean;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  text: string;
  url: string;
}

export const ButtonComponentForm = (context: Devvit.Context, onSubmit: (data: ButtonFormData) => void) => {
  return context.useForm(
    {
      fields: [
        {
          name: 'text',
          label: 'Button Text',
          type: 'string',
          required: true
        },
        {
          name: 'url',
          label: 'Button URL',
          type: 'string',
          required: true
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'string',
          required: false
        },
        {
          name: 'size',
          label: 'Size',
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
          required: true
        },
        {
          name: 'appearance',
          label: 'Appearance',
          type: 'select',
          options: [
            { label: 'Secondary', value: 'secondary' },
            { label: 'Primary', value: 'primary' },
            { label: 'Plain', value: 'plain' },
            { label: 'Bordered', value: 'bordered' },
            { label: 'Media', value: 'media' },
            { label: 'Destructive', value: 'destructive' },
            { label: 'Caution', value: 'caution' },
            { label: 'Success', value: 'success' }
          ],
          required: true
        },
        {
          name: 'isGrow',
          label: 'Grow',
          type: 'boolean',
          defaultValue: false,
        },
        {
          name: 'width',
          label: 'Width',
          type: 'string',
          defaultValue: '50',
          required: false
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          defaultValue: '50',
          required: false
        }
      ],
      title: 'Add Link Button',
      acceptLabel: 'Add',
    },
    (values) => {
      const formData: ButtonFormData = {
        text: values.text as string,
        url: values.url as string,
        icon: values.icon ? values.icon[0] as string : undefined,
        size: values.size[0] as Devvit.Blocks.ButtonSize,
        appearance: values.appearance[0] as Devvit.Blocks.ButtonAppearance,
        isGrow: values.isGrow as boolean,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };
      onSubmit(formData);
    }
  );
};
