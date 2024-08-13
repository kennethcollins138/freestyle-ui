import { Devvit, IconName } from '@devvit/public-api';
import { randomId } from '../util.js';

export interface PaginationButtonFormData {
  type: string;
  text: string;
  pageId: string;
  id?: string; // Optional, since it might not be present in 'edit' mode
  mode: 'edit' | 'add';
  icon?: string;
  size: Devvit.Blocks.ButtonSize;
  appearance: Devvit.Blocks.ButtonAppearance;
  isGrow?: boolean;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
}

export const PaginationButtonForm = ({
  context,
  onSubmit,
  componentId, // Optional, only present in 'edit' mode
}: {
  context: Devvit.Context;
  onSubmit: (data: PaginationButtonFormData) => void;
  componentId?: string;
}) => {
  return context.useForm(
    {
      fields: [
        { name: 'text', label: 'Button Text', type: 'string', required: true },
        { name: 'pageId', label: 'Page ID to Link', type: 'string', defaultValue: randomId(), required: true, disabled: true },
        {
          name: 'icon',
          label: 'Icon',
          type: 'string',
          required: false,
        },
        {
          name: 'size',
          label: 'Size',
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
          required: true,
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
            { label: 'Success', value: 'success' },
          ],
          required: true,
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
          required: false,
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          defaultValue: '50',
          required: false,
        },
      ],
      title: componentId ? 'Edit Page Button' : 'Add New Page Button', // Differentiating between add and edit
      acceptLabel: componentId ? 'Update' : 'Add',
    },
    (values) => {
      const formData: PaginationButtonFormData = {
        id: componentId,
        mode: componentId ? 'edit' : 'add',
        type: 'PaginationButton',
        text: values.text as string,
        pageId: values.pageId as string,
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
