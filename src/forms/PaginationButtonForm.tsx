import { Devvit } from '@devvit/public-api';

export interface PaginationButtonFormData {
  type: string;
  text: string;
  pageId: string;
}

export const PaginationButtonForm = ({ context, onSubmit }: { context: Devvit.Context; onSubmit: (data: PaginationButtonFormData) => void }) => {
  return context.useForm(
    {
      fields: [
        { name: 'text', label: 'Button Text', type: 'string', required: true },
        { name: 'pageId', label: 'Page ID to Link', type: 'string', required: true }
      ],
      title: 'Add New Page Button',
      acceptLabel: 'Add',
    },
    (values) => {
      const formData = {
        type: 'PaginationButton',
        text: values.text as string,
        pageId: values.pageId as string
      };
      onSubmit(formData);
    }
  );
};
