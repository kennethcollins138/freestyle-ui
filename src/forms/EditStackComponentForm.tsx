import { Devvit } from '@devvit/public-api';

export interface EditStackFormData {
  type: string;
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
  addChild?: string;
}

interface EditStackComponentFormProps {
  context: Devvit.Context;
  type: 'HStack' | 'VStack' | 'ZStack';
  onSubmit: (data: EditStackFormData) => void;
}

export const EditStackComponentForm = ({
  context, 
  type, 
  onSubmit
}: EditStackComponentFormProps) => {
  const typeElement = type;
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
            { label: 'Center', value: 'center'},
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
        },
        {
          name: 'componentType',
          label: 'Select Component Type to Add',
          type: 'select',
          options: [
            { label: 'VStack', value: 'VStack' },
            { label: 'HStack', value: 'HStack' },
            { label: 'ZStack', value: 'ZStack' },
            { label: 'Link Button', value: 'Button' },
            { label: 'Image', value: 'Image' },
            { label: 'Text', value: 'Text' },
            // { label: 'New Page Button', value: 'PaginationButton' },
          ],
          multiple: false,
          required: false
        }
      ],
      title: `Edit ${type.toUpperCase()}`,
      acceptLabel: 'Edit',
    },
    (values) => {
      console.log(`addCHILD VALUE: ${values.componentType}`)
      const formData: EditStackFormData = {
        type: type,
        gap: values.gap ? values.gap[0] as Devvit.Blocks.ContainerGap : undefined,
        alignment: values.alignment ? values.alignment[0] as Devvit.Blocks.Alignment : undefined,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
        padding: values.padding ? values.padding[0] as Devvit.Blocks.ContainerPadding : undefined,
        backgroundColor: values.backgroundColor as string,
        addChild: values.componentType ? values.componentType[0] : undefined,
      };
      onSubmit(formData);
    }
  );
};