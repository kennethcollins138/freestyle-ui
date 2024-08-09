import { Devvit } from '@devvit/public-api';
import { StackComponentForm } from '../forms/StackComponentForm.js';
import { ImageComponentForm } from '../forms/ImageComponentForm.js';
import { TextComponentForm } from '../forms/TextComponentForm.js';
import { ButtonComponentForm } from '../forms/ButtonComponentForm.js';
import { PaginationButtonForm } from '../forms/PaginationButtonForm.js';

interface EditComponentFormProps {
  context: Devvit.Context;
  element: any; // This should be typed more specifically based on your schema
  onUpdate: (updatedData: any) => void;
  onDelete: () => void;
}

export const EditComponentForm = ({ context, element, onUpdate, onDelete }: EditComponentFormProps) => {
  // Form for editing metadata of the element (e.g., Stack)
  const metadataForm = StackComponentForm({
    context,
    type: element.type,
    onSubmit: (updatedMetadata) => onUpdate({ ...element, ...updatedMetadata }),
  });

  // Forms for adding children elements to the stack
  const addChildForms = {
    Image: ImageComponentForm({
      context,
      onSubmit: (data) => onUpdate({ ...element, children: [...(element.children || []), data] }),
    }),
    Text: TextComponentForm({
      context,
      onSubmit: (data) => onUpdate({ ...element, children: [...(element.children || []), data] }),
    }),
    Button: ButtonComponentForm({
      context,
      onSubmit: (data) => onUpdate({ ...element, children: [...(element.children || []), data] }),
    }),
    PaginationButton: PaginationButtonForm({
      context,
      onSubmit: (data) => onUpdate({ ...element, children: [...(element.children || []), data] }),
    }),
  };

  // Show the edit metadata form
  context.ui.showForm(metadataForm);

  // Allow adding a new child element
  const handleAddChild = (childType: keyof typeof addChildForms) => {
    context.ui.showForm(addChildForms[childType]);
  };

  // Render buttons for adding different types of child elements
  return (
    <vstack>
      <button onPress={() => handleAddChild('Image')} appearance="primary" size="small">Add Image</button>
      <button onPress={() => handleAddChild('Text')} appearance="primary" size="small">Add Text</button>
      <button onPress={() => handleAddChild('Button')} appearance="primary" size="small">Add Button</button>
      <button onPress={() => handleAddChild('PaginationButton')} appearance="primary" size="small">Add Pagination Button</button>

      <button onPress={onDelete} appearance="destructive" size="small">Delete Element</button>
    </vstack>
  );
};
