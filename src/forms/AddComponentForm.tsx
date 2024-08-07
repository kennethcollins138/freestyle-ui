import { Devvit } from '@devvit/public-api';

interface AddComponentFormProps {
  onComponentTypeSelected: (componentType: string) => void;
}

export const AddComponentForm = (context: Devvit.Context, onSubmit: (data: { componentType: string }) => void) => {
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
      acceptLabel: 'Add',
    },
    (data) => {
      const componentType = Array.isArray(data.componentType) ? data.componentType[0] : data.componentType;
      onSubmit({ componentType });
    }
  );
};
