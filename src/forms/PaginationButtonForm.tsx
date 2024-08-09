import { Devvit } from '@devvit/public-api';

interface PaginationButtonFormData {
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
    onSubmit
  );
};
