import { Devvit } from '@devvit/public-api';
import { randomId } from '../util.js';
export interface PaginationButtonFormData {
  type: string;
  text: string;
  pageId: string;
  id?: string;  // Optional, since it might not be present in 'add' mode
  mode: 'edit' | 'add';
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
        { name: 'pageId', label: 'Page ID to Link', type: 'string', defaultValue: randomId(), required: true, disabled: true }
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
      };
      onSubmit(formData);
    }
  );
};
