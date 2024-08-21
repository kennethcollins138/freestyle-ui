import { Devvit } from '@devvit/public-api';

export interface ImageComponentFormProps {
  context: Devvit.Context;
  onSubmit: (data: ImageFormData) => void;
}

export interface ImageFormData {
  type: string;
  url: string;
  width: Devvit.Blocks.SizeString;
  height: Devvit.Blocks.SizeString;
  resizeMode: Devvit.Blocks.ImageResizeMode;
  imageWidth: number;
  imageHeight: number;
}

export const ImageComponentForm = ({ context, onSubmit }: ImageComponentFormProps) => {
  return context.useForm(
    {
      fields: [
        {
          name: 'uploadUrl',
          label: 'Image URL',
          type: 'string',
          required: true
        },
        {
          name: 'width',
          label: 'Width',
          type: 'string',
          required: true,
          defaultValue: '100%'
        },
        {
          name: 'height',
          label: 'Height',
          type: 'string',
          required: true,
          defaultValue: '100%'
        },
        {
          name: 'resizeMode',
          label: 'Resize Mode',
          type: 'string',
          required: true,
          defaultValue: 'fit'
        },
        {
          name: 'imageWidth',
          label: 'Image Width',
          type: 'number',
          required: true,
          defaultValue: 1024
        },
        {
          name: 'imageHeight',
          label: 'Image Height',
          type: 'number',
          required: true,
          defaultValue: 150
        }
      ],
      title: 'Add Image Element',
      acceptLabel: 'Add',
    },
    async (values) => {
      const uploadUrl = values.uploadUrl;
    
      try {
        const response = await context.media.upload({
          url: uploadUrl,
          type: "image",
        });
        
        console.log(`Response Url: ${response.mediaUrl}`);
        console.log(`Response Id: ${response.mediaId}`);

        const formData: ImageFormData = {
          type: 'Image',
          url: response.mediaUrl,
          width: values.width as Devvit.Blocks.SizeString,
          height: values.height as Devvit.Blocks.SizeString,
          resizeMode: values.resizeMode as Devvit.Blocks.ImageResizeMode,
          imageWidth: values.imageWidth as number,
          imageHeight: values.imageHeight as number,
        };
        onSubmit(formData);
      } catch (err) {
        console.error("Error uploading media:", err);
      }
    }
  );
};