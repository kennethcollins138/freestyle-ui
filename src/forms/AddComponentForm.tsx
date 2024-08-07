import { Devvit } from '@devvit/public-api';

export const AddComponentForm = (context: Devvit.Context, onComponentTypeSelected: (componentType: string) => void) => {
  return context.useForm(
    {
      fields: [
        {
          name: 'componentType',
          label: 'Select Component Type to Add',
          type: 'select',
          options: [
            { label: 'VStack', value: 'vstack' },
            { label: 'HStack', value: 'hstack' },
            { label: 'ZStack', value: 'zstack' },
            { label: 'LinkButton', value: 'linkbutton' },
            { label: 'Image', value: 'image' },
            { label: 'Text', value: 'text' },
            { label: 'New Page Button', value: 'paginationbutton' },
            // TODO: add more components like spacers, etc..
          ],
          required: true,
          multiple: false
        },
      ],
      title: 'Add New Component',
      acceptLabel: 'Next',
    },
    async (data) => {
      onComponentTypeSelected(data.componentType);
    }
  );
};
