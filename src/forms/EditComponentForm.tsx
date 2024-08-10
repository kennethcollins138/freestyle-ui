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
  onUpdate: (updatedElement: ComponentType) => Promise<void>;
}

export const EditComponentForm = ({ context, components, onUpdate }: EditComponentFormProps) => {
  const { useState } = context;
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const componentOptions = components.map(component => ({
    label: `${component.type} (${component.id})`,
    value: component.id,
  }));

  const selectedComponent = components.find(component => component.id === selectedComponentId);

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
      const selectedId = Array.isArray(values.selectedComponentId)
        ? values.selectedComponentId[0]
        : values.selectedComponentId; // Safely extract if it's an array
      setSelectedComponentId(selectedId);
    }
  );

  if (selectedComponent) {
    let form = null;

    switch (selectedComponent.type) {
      case 'Text':
        form = TextComponentForm({
          context,
          onSubmit: (data) => onUpdate({ ...selectedComponent, ...data }),
        });
        break;
      case 'Image':
        form = ImageComponentForm({
          context,
          onSubmit: (data) => onUpdate({ ...selectedComponent, ...data }),
        });
        break;
      case 'VStack':
      case 'HStack':
      case 'ZStack':
        form = StackComponentForm({
          context,
          type: selectedComponent.type,
          onSubmit: (data) => onUpdate({ ...selectedComponent, ...data }),
        });
        break;
      case 'Button':
        form = ButtonComponentForm({
          context,
          onSubmit: (data) => onUpdate({ ...selectedComponent, ...data }),
        });
        break;
      case 'PaginationButton':
        form = PaginationButtonForm({
          context,
          onSubmit: (data) => onUpdate({ ...selectedComponent, ...data }),
        });
        break;
      default:
        context.ui.showToast('Unknown component type selected');
        return mainForm; // Return the main form if no valid component is selected
    }

    // Render the form for the selected component
    context.ui.showForm(form);
  }

  return mainForm;
};
