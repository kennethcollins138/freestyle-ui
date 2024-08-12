import { Devvit } from '@devvit/public-api';

export interface AddComponentFormProps {
  context: Devvit.Context;
  onSubmit: (data: { componentType: string }) => void;
}

export const AddComponentForm = ({ context, onSubmit }: AddComponentFormProps) => {
  return context.useForm(
    {
      fields: [
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
            { label: 'New Page Button', value: 'PaginationButton' },
          ],
          required: true,
          multiple: false,
        },
      ],
      title: 'Add New Component',
      acceptLabel: 'Add',
    },
    async (data) => {
      const componentType = Array.isArray(data.componentType) ? data.componentType[0] : data.componentType;
      onSubmit({ componentType: componentType as string});
    }
  );
};