import { Devvit } from '@devvit/public-api';

export interface DeleteComponentFormProps {
  context: Devvit.Context;
  components: Array<{ id: string; type: string }>;
  onSubmit: (data: { componentId: string }) => void;
}

export const DeleteComponentForm = ({ context, components, onSubmit }: DeleteComponentFormProps) => {
  const componentOptions = components.map(component => ({
    label: `${component.type} (${component.id})`,
    value: `${component.type}:${component.id}`,
  }));
  
  console.log("About to set up the form...");

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
    (data) => {
      console.log(`Delete FORM DATA: ${data}`);
      const selectedComponent = data.selectedComponent as string | string[];
      console.log(selectedComponent);

      // Check if selectedComponent is an array and handle accordingly
      const [componentType, componentId] = Array.isArray(selectedComponent) 
        ? selectedComponent[0].split(':') 
        : selectedComponent.split(':');
      
      onSubmit({ componentId });
    }
  );
};