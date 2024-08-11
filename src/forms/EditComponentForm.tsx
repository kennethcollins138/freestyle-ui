import { Devvit } from '@devvit/public-api';
import type { ComponentType } from '../types/component.js';
import { TextComponentForm } from './TextComponentForm.js';
import { ImageComponentForm } from './ImageComponentForm.js';
import { StackComponentForm } from './StackComponentForm.js';
import { ButtonComponentForm } from './ButtonComponentForm.js';
import { PaginationButtonForm } from './PaginationButtonForm.js';

interface EditComponentFormProps {
  context: Devvit.Context;
  components: ComponentType[];
  onSubmit: (updatedElement: ComponentType) => Promise<void>;
}

export const EditComponentForm = ({ context, components, onSubmit }: EditComponentFormProps) => {
  const { useState } = context;
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const componentOptions = components.map(component => ({
    label: `${component.type} (${component.id})`,
    value: component.id,
  }));

  console.log("Component options:", componentOptions);

  const selectedComponent = components.find(component => component.id === selectedComponentId);

  console.log("Selected component:", selectedComponent);

  const mainForm = context.useForm(
    {
      fields: [
        {
          name: 'selectedComponentId',
          label: 'Select Component to Edit',
          type: 'select',
          options: componentOptions,
          required: true,
          multiSelect: false,
        },
      ],
      title: 'Edit Component',
      acceptLabel: 'Next',
    },
    async (values) => {
      console.log("Form values on submission:", values);
      const selectedId = Array.isArray(values.selectedComponentId)
        ? values.selectedComponentId[0]
        : values.selectedComponentId;

      console.log("Selected ID after form submission:", selectedId);
      setSelectedComponentId(selectedId);
    }
  );

  if (selectedComponent && selectedComponentId) {
    let form = null;

    console.log("Creating form for component type:", selectedComponent.type);

    const handleSubmit = async (data: any) => {
      console.log("Submitting data for component:", data);
      await onSubmit({ ...selectedComponent, ...data });
      setSelectedComponentId(null); // Reset after submission
      context.ui.showToast('Component updated successfully!');
    };

    switch (selectedComponent.type) {
      case 'Text':
        form = TextComponentForm({
          context,
          onSubmit: handleSubmit,
        });
        break;
      case 'Image':
        form = ImageComponentForm({
          context,
          onSubmit: handleSubmit,
        });
        break;
      case 'VStack':
      case 'HStack':
      case 'ZStack':
        form = StackComponentForm({
          context,
          type: selectedComponent.type,
          onSubmit: handleSubmit,
        });
        break;
      case 'Button':
        form = ButtonComponentForm({
          context,
          onSubmit: handleSubmit,
        });
        break;
      case 'PaginationButton':
        form = PaginationButtonForm({
          context,
          onSubmit: handleSubmit,
        });
        break;
      default:
        console.error("Unknown component type selected:", selectedComponent.type);
        context.ui.showToast('Unknown component type selected');
        return mainForm;
    }

    if (form && selectedComponentId) {
      console.log("Displaying form for component:", selectedComponent.type);
      context.ui.showForm(form);
      setSelectedComponentId(null);
    }
  }

  return mainForm;
};
