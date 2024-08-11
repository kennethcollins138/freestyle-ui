import { Devvit } from '@devvit/public-api';

export interface ImageComponentFormProps {
  context: Devvit.Context;
  onSubmit: (data: ImageFormData) => void;
  componentId?: string;  // Optional, for edit mode
}

export interface ImageFormData {
  type: string;
  url: string;
  width: Devvit.Blocks.SizeString;
  height: Devvit.Blocks.SizeString;
  resizeMode: Devvit.Blocks.ImageResizeMode;
  imageWidth: number;
  imageHeight: number;
  id?: string;  // Optional, for edit mode
  mode: 'edit' | 'add';
}

export const ImageComponentForm = ({
  context,
  onSubmit,
  componentId,  // Optional, passed in for edit mode
}: ImageComponentFormProps) => {
  return context.useForm(
    {
      fields: [
        {
          name: 'url',
          label: 'Image URL',
          type: 'string',
          required: true,
        },
        {
          name: 'width',
          label: 'Width',
          type: 'string',
          required: true,
          defaultValue: '100%',
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          required: true,
          defaultValue: 'auto',
        },
        {
          name: 'resizeMode',
          label: 'Resize Mode',
          type: 'string',
          required: true,
          defaultValue: 'fit',
        },
        {
          name: 'imageWidth',
          label: 'Image Width',
          type: 'number',
          required: true,
          defaultValue: 1024,
        },
        {
          name: 'imageHeight',
          label: 'Image Height',
          type: 'number',
          required: true,
          defaultValue: 150,
        },
      ],
      title: componentId ? 'Edit Image Element' : 'Add Image Element',  // Update title based on mode
      acceptLabel: componentId ? 'Update' : 'Add',  // Update label based on mode
    },
    (values) => {
      const formData: ImageFormData = {
        id: componentId,  // Include componentId if available
        mode: componentId ? 'edit' : 'add',  // Determine mode based on componentId
        type: 'Image',
        url: values.url as string,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
        resizeMode: values.resizeMode as Devvit.Blocks.ImageResizeMode,
        imageWidth: values.imageWidth as number,
        imageHeight: values.imageHeight as number,
      };
      onSubmit(formData);
    }
  );
};
