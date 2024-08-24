import { Devvit } from '@devvit/public-api';
import { sleep } from '../util.js';
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
  minWidth: Devvit.Blocks.SizeString;
  minHeight: Devvit.Blocks.SizeString;
  maxWidth: Devvit.Blocks.SizeString;
  maxHeight: Devvit.Blocks.SizeString;
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
          defaultValue: 200
        },
        {
          name: 'imageHeight',
          label: 'Image Height',
          type: 'number',
          required: true,
          defaultValue: 200
        },
        {
          name: 'minWidth',
          label: 'Minimum Image Width',
          type: 'string',
        },
        {
          name: 'minHeight',
          label: 'Minimum Image Height',
          type: 'string',
        },
        {
          name: 'maxWidth',
          label: 'Maximum Image Width',
          type: 'string',
        },
        {
          name: 'maxHeight',
          label: 'Maximum Image Height',
          type: 'string',
        },
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
        
        await sleep(3000);

        const formData: ImageFormData = {
          type: 'Image',
          url: response.mediaUrl,
          width: values.width as Devvit.Blocks.SizeString,
          height: values.height as Devvit.Blocks.SizeString,
          resizeMode: values.resizeMode as Devvit.Blocks.ImageResizeMode,
          imageWidth: values.imageWidth as number,
          imageHeight: values.imageHeight as number,
          minWidth: values.minWidth as Devvit.Blocks.SizeString,
          minHeight: values.minHeight as Devvit.Blocks.SizeString,
          maxWidth: values.maxWidth as Devvit.Blocks.SizeString,
          maxHeight: values.maxHeight as Devvit.Blocks.SizeString,
        };
        onSubmit(formData);
      } catch (err) {
        console.error("Error uploading media:", err);
      };
    }
  );
};