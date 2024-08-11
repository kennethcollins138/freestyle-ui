import { Devvit } from '@devvit/public-api';

export interface TextFormData {
  id?: string;  // Optional, since it might not be present in 'add' mode
  mode: 'edit' | 'add';
  type: string;
  text: string;
  style?: Devvit.Blocks.TextStyle;
  size?: Devvit.Blocks.TextSize;
  weight?: Devvit.Blocks.TextWeight;
  color?: string;
  alignment?: Devvit.Blocks.Alignment;
  outline?: Devvit.Blocks.Thickness;
  selectable?: boolean;
  wrap?: boolean;
  overflow?: Devvit.Blocks.TextOverflow;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
}

export const TextComponentForm = ({
  context,
  onSubmit,
  componentId, // Accept componentId as a prop
}: {
  context: Devvit.Context;
  onSubmit: (data: TextFormData) => void;
  componentId?: string; // Optional, only present in 'edit' mode
}) => {
  const form = context.useForm(
    {
      fields: [
        {
          name: 'text',
          label: 'Text',
          type: 'string',
          required: true,
        },
        {
          name: 'style',
          label: 'Style',
          type: 'select',
          options: [
            { label: 'Body', value: 'body' },
            { label: 'Metadata', value: 'metadata' },
            { label: 'Heading', value: 'heading' },
          ],
          required: false,
        },
        {
          name: 'size',
          label: 'Size',
          type: 'select',
          options: [
            { label: 'XSmall', value: 'xsmall' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
            { label: 'XLarge', value: 'xlarge' },
            { label: 'XXLarge', value: 'xxlarge' },
          ],
          required: false,
        },
        {
          name: 'weight',
          label: 'Weight',
          type: 'select',
          options: [
            { label: 'Regular', value: 'regular' },
            { label: 'Bold', value: 'bold' },
          ],
          required: false,
        },
        {
          name: 'color',
          label: 'Color',
          type: 'string',
          required: false,
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
          required: false,
        },
        {
          name: 'outline',
          label: 'Outline',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Thin', value: 'thin' },
            { label: 'Thick', value: 'thick' },
          ],
          required: false,
        },
        {
          name: 'selectable',
          label: 'Selectable',
          type: 'boolean',
          defaultValue: false,
        },
        {
          name: 'wrap',
          label: 'Wrap',
          type: 'boolean',
          defaultValue: false,
          required: false,
        },
        {
          name: 'overflow',
          label: 'Overflow',
          type: 'select',
          options: [
            { label: 'Ellipsis', value: 'ellipsis' },
            { label: 'Clip', value: 'clip' },
          ],
          required: false,
        },
        {
          name: 'width',
          label: 'Width',
          type: 'string',
          required: false,
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          required: false,
        },
      ],
      title: componentId ? 'Edit Text Element' : 'Add Text Element',
      acceptLabel: componentId ? 'Update' : 'Add',
    },
    (values) => {
      const formData: TextFormData = {
        id: componentId,
        mode: componentId ? 'edit' : 'add',
        type: 'Text',
        text: values.text as string,
        style: values.style ? (values.style[0] as Devvit.Blocks.TextStyle) : undefined,
        size: values.size ? (values.size[0] as Devvit.Blocks.TextSize) : undefined,
        weight: values.weight ? (values.weight[0] as Devvit.Blocks.TextWeight) : undefined,
        color: values.color as string,
        alignment: values.alignment ? (values.alignment[0] as Devvit.Blocks.Alignment) : undefined,
        outline: values.outline ? (values.outline[0] as Devvit.Blocks.Thickness) : undefined,
        selectable: values.selectable as boolean,
        wrap: values.wrap as boolean,
        overflow: values.overflow ? (values.overflow[0] as Devvit.Blocks.TextOverflow) : undefined,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };
      onSubmit(formData);
    }
  );

  return form; // Return the form key
};
