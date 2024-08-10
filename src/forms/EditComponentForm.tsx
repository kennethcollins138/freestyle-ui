import { Devvit } from '@devvit/public-api';
import type { ComponentType } from '../types/component.js';
import { TextComponentForm } from './TextComponentForm.js';
import { ImageComponentForm } from './ImageComponentForm.js';
import { StackComponentForm } from './StackComponentForm.js';
import { ButtonComponentForm } from './ButtonComponentForm.js';
import { PaginationButtonForm } from './PaginationButtonForm.js';

type FormKey = any; // Placeholder type

interface EditComponentFormProps {
  context: Devvit.Context;
  element: ComponentType;
  onUpdate: (updatedElement: ComponentType) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const EditComponentForm = ({ context, element, onUpdate, onDelete }: EditComponentFormProps): FormKey | undefined => {
  let formKey: FormKey | undefined;

  switch (element.type) {
    case 'Text':
      formKey = TextComponentForm({
        context,
        onSubmit: (data) => {
          onUpdate({ ...element, ...data });
        },
      });
      break;
    case 'Image':
      formKey = ImageComponentForm({
        context,
        onSubmit: (data) => {
          onUpdate({ ...element, ...data });
        },
      });
      break;
    case 'VStack':
    case 'HStack':
    case 'ZStack':
      formKey = StackComponentForm({
        context,
        type: element.type,
        onSubmit: (data) => {
          onUpdate({ ...element, ...data });
        },
      });
      break;
    case 'Button':
      formKey = ButtonComponentForm({
        context,
        onSubmit: (data) => {
          onUpdate({ ...element, ...data });
        },
      });
      break;
    case 'PaginationButton':
      formKey = PaginationButtonForm({
        context,
        onSubmit: (data) => {
          onUpdate({ ...element, ...data });
        },
      });
      break;
    default:
      formKey = undefined;
      break;
  }

  return formKey;
};
