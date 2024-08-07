import { Devvit } from '@devvit/public-api';

interface StackFormData {
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
}

export const StackComponentForm = (
  context: Devvit.Context, 
  type: 'hstack' | 'vstack' | 'zstack', 
  onSubmit: (data: StackFormData) => void
) => {
  return context.useForm(
    {
      fields: [
        {
          name: 'gap',
          label: 'Gap',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
          required: false
        },
        {
          name: 'alignment',
          label: 'Alignment',
          type: 'select',
          options: [
            { label: 'Top Start', value: 'top start' },
            { label: 'Top Center', value: 'top center' },
            { label: 'Top End', value: 'top end' },
            { label: 'Middle Start', value: 'middle start' },
            { label: 'Middle Center', value: 'middle center' },
            { label: 'Middle End', value: 'middle end' },
            { label: 'Bottom Start', value: 'bottom start' },
            { label: 'Bottom Center', value: 'bottom center' },
            { label: 'Bottom End', value: 'bottom end' },
          ],
          required: false
        },
        {
          name: 'width',
          label: 'Width',
          type: 'string',
          defaultValue: '100%',
          required: false
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          required: false
        },
        {
          name: 'padding',
          label: 'Padding',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'XSmall', value: 'xsmall' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
          required: false
        },
        {
          name: 'backgroundColor',
          label: 'Background Color',
          type: 'string',
          required: false
        }
      ],
      title: `Add ${type.toUpperCase()}`,
      acceptLabel: 'Add',
    },
    (values) => {
      const formData: StackFormData = {
        gap: values.gap ? values.gap[0] as Devvit.Blocks.ContainerGap : undefined,
        alignment: values.alignment ? values.alignment[0] as Devvit.Blocks.Alignment : undefined,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
        padding: values.padding ? values.padding[0] as Devvit.Blocks.ContainerPadding : undefined,
        backgroundColor: values.backgroundColor as string,
      };
      onSubmit(formData);
    }
  );
};
