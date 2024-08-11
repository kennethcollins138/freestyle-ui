import { Devvit } from '@devvit/public-api';

export interface EditComponentFormProps {
  context: Devvit.Context;
  components: Array<{ id: string; type: string }>;
  onSubmit: (data: { componentType: string; componentId: string }) => void;
}

export const EditComponentForm = ({ context, components, onSubmit }: EditComponentFormProps) => {
  const componentOptions = components.map(component => ({
    label: `${component.type} (${component.id})`,
    value: `${component.type}:${component.id}`,
  }));

  return context.useForm(
    {
      fields: [
        {
          name: 'selectedComponent',
          label: 'Select Component to Edit',
          type: 'select',
          options: componentOptions,
          required: true,
          multiple: false,
        },
      ],
      title: 'Edit Component',
      acceptLabel: 'Next',
    },
    async (data) => {
      // Fix: Shouldn't be unknown but ill elave it for now
      const selectedComponent = data.selectedComponent as unknown as string;
      const [componentType, componentId] = Array.isArray(selectedComponent) 
        ? selectedComponent[0].split(':') 
        : selectedComponent.split(':');

      onSubmit({ componentType, componentId });
    }
  );
};
