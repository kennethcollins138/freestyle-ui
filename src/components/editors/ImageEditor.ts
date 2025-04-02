import { Devvit, useForm } from '@devvit/public-api';
import { ImageElementSchema } from '../../api/Schema.js';
import { z } from 'zod';

interface ImageEditorProps {
    component?: ImageElementSchema;
    onSave: (data: ImageElementSchema) => void;
}

export const createImageEditor = ({ component, onSave }: ImageEditorProps) => {
    return useForm(
        {
            fields: [
                {
                    name: 'uploadUrl',
                    label: 'Image URL',
                    helperText: 'Enter a direct image URL (ending with .jpg, .png, etc.)',
                    type: 'string',
                    required: true,
                    defaultValue: component?.url,
                },
                {
                    name: 'width',
                    label: 'Width',
                    helperText: 'Use pixels (e.g., 300) or percentage (e.g., 100%)',
                    type: 'string',
                    required: true,
                    defaultValue: component?.width || '100%',
                },
                {
                    name: 'height',
                    label: 'Height',
                    helperText: 'Use pixels (e.g., 200) or percentage (e.g., auto)',
                    type: 'string',
                    required: true,
                    defaultValue: component?.height || 'auto',
                },
                {
                    name: 'resizeMode',
                    label: 'Resize Mode',
                    type: 'select',
                    options: [
                        { label: 'Fit (maintain aspect ratio)', value: 'fit' },
                        { label: 'Fill (stretch to fit)', value: 'fill' },
                        { label: 'Cover (crop to fill)', value: 'cover' },
                    ],
                    required: true,
                    defaultValue: component?.resizeMode || 'fit',
                },
                {
                    name: 'imageWidth',
                    label: 'Original Image Width',
                    helperText: 'The actual width of the image in pixels',
                    type: 'number',
                    required: true,
                    defaultValue: component?.imageWidth || 1024,
                },
                {
                    name: 'imageHeight',
                    label: 'Original Image Height',
                    helperText: 'The actual height of the image in pixels',
                    type: 'number',
                    required: true,
                    defaultValue: component?.imageHeight || 768,
                },
                {
                    name: 'minWidth',
                    label: 'Minimum Width (optional)',
                    type: 'string',
                    required: false,
                    defaultValue: component?.minWidth,
                },
                {
                    name: 'minHeight',
                    label: 'Minimum Height (optional)',
                    type: 'string',
                    required: false,
                    defaultValue: component?.minHeight,
                },
                {
                    name: 'maxWidth',
                    label: 'Maximum Width (optional)',
                    type: 'string',
                    required: false,
                    defaultValue: component?.maxWidth,
                },
                {
                    name: 'maxHeight',
                    label: 'Maximum Height (optional)',
                    type: 'string',
                    required: false,
                    defaultValue: component?.maxHeight,
                },
            ],
            title: component ? 'Edit Image' : 'Add Image',
            acceptLabel: 'Save',
        },
        async (values) => {
            try {
                // Upload the image using the Devvit media API
                // const context = Devvit.getSystemContext();
                const uploadUrl = values.uploadUrl as string;

                // If editing an existing image and URL hasn't changed, skip upload
                if (component && component.url === uploadUrl) {
                    const formData = {
                        id: component.id,
                        type: 'Image',
                        url: uploadUrl,
                        width: values.width as string,
                        height: values.height as string,
                        resizeMode: values.resizeMode[0] as 'fit' | 'fill' | 'cover',
                        imageWidth: values.imageWidth as number,
                        imageHeight: values.imageHeight as number,
                        minWidth: values.minWidth as string,
                        minHeight: values.minHeight as string,
                        maxWidth: values.maxWidth as string,
                        maxHeight: values.maxHeight as string,
                    };

                    // Validate with Zod schema
                    const validatedData = z.object({
                        id: z.string(),
                        type: z.literal('Image'),
                        url: z.string(),
                        width: z.string(),
                        height: z.string(),
                        resizeMode: z.enum(['fit', 'fill', 'cover']),
                        imageWidth: z.number(),
                        imageHeight: z.number(),
                        minWidth: z.string().optional(),
                        minHeight: z.string().optional(),
                        maxWidth: z.string().optional(),
                        maxHeight: z.string().optional(),
                    }).parse(formData);

                    onSave(validatedData);
                    return;
                }

                // Show loading message
                context.ui.showToast("Uploading image...");

                // For new image or changed URL, upload the image
                const response = await context.media.upload({
                    url: uploadUrl,
                    type: "image",
                });

                // Create image data object
                const imageData = {
                    id: component?.id || `image-${Date.now()}`,
                    type: 'Image' as const,
                    url: response.mediaUrl,
                    width: values.width as string,
                    height: values.height as string,
                    resizeMode: values.resizeMode[0] as 'fit' | 'fill' | 'cover',
                    imageWidth: values.imageWidth as number,
                    imageHeight: values.imageHeight as number,
                    minWidth: values.minWidth as string,
                    minHeight: values.minHeight as string,
                    maxWidth: values.maxWidth as string,
                    maxHeight: values.maxHeight as string,
                };

                // Validate with Zod schema
                const validatedData = z.object({
                    id: z.string(),
                    type: z.literal('Image'),
                    url: z.string(),
                    width: z.string(),
                    height: z.string(),
                    resizeMode: z.enum(['fit', 'fill', 'cover']),
                    imageWidth: z.number(),
                    imageHeight: z.number(),
                    minWidth: z.string().optional(),
                    minHeight: z.string().optional(),
                    maxWidth: z.string().optional(),
                    maxHeight: z.string().optional(),
                }).parse(imageData);

                // Success message
                context.ui.showToast("Image uploaded successfully!");

                onSave(validatedData);
            } catch (err) {
                console.error("Error uploading image:", err);
                // .ui.showToast("Error uploading image. Please try again.");
            }
        }
    );
};