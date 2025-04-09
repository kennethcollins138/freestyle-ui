import {UploadMediaOptions, useForm} from "@devvit/public-api";
import { ImageElementSchema, Schema } from "../../api/Schema.js";
import { FormProps } from "../../types/component.js";

export const createImageEditor = ({
  context,
  component,
  onSave,
}: FormProps) => {
  const imageComponent = component as ImageElementSchema;
  return useForm(
    {
      fields: [
        {
          name: "uploadUrl",
          label: "Image URL",
          helpText: "Enter a direct image URL (ending with .jpg, .png, etc.)",
          type: "string",
          required: true,
          ...(imageComponent?.url && {
            defaultValue: imageComponent.url,
          }),
        },
        {
          name: "width",
          label: "Width",
          helpText: "Use pixels (e.g., 300) or percentage (e.g., 100%)",
          type: "string",
          required: true,
          ...(imageComponent?.width && {
            defaultValue: String(imageComponent.width),
          }),
        },
        {
          name: "height",
          label: "Height",
          helpText: "Use pixels (e.g., 200) or percentage (e.g., auto)",
          type: "string",
          required: true,
          ...(imageComponent?.height && {
            defaultValue: String(imageComponent.height),
          }),
        },
        {
          name: "resizeMode",
          label: "Resize Mode",
          type: "select",
          options: [
            { label: "Fit (maintain aspect ratio)", value: "fit" },
            { label: "Fill (stretch to fit)", value: "fill" },
            { label: "Cover (crop to fill)", value: "cover" },
          ],
          required: true,
          ...(imageComponent?.resizeMode && {
            defaultValue: [imageComponent.resizeMode],
          }),
        },
        {
          name: "imageWidth",
          label: "Original Image Width",
          helpText: "The actual width of the image in pixels",
          type: "number",
          required: true,
          ...(imageComponent?.imageWidth && {
            defaultValue: Number(imageComponent.imageWidth),
          }),
        },
        {
          name: "imageHeight",
          label: "Original Image Height",
          helpText: "The actual height of the image in pixels",
          type: "number",
          required: true,
          ...(imageComponent?.imageHeight && {
            defaultValue: Number(imageComponent.imageHeight),
          }),
        },
        {
          name: "minWidth",
          label: "Minimum Width (optional)",
          type: "string",
          required: false,
          ...(imageComponent?.minWidth && {
            defaultValue: String(imageComponent.minWidth),
          }),
        },
        {
          name: "minHeight",
          label: "Minimum Height (optional)",
          type: "string",
          required: false,
          ...(imageComponent?.minHeight && {
            defaultValue: String(imageComponent.minHeight),
          }),
        },
        {
          name: "maxWidth",
          label: "Maximum Width (optional)",
          type: "string",
          required: false,
          ...(imageComponent?.maxWidth && {
            defaultValue: String(imageComponent.maxWidth)}),
        },
        {
          name: "maxHeight",
          label: "Maximum Height (optional)",
          type: "string",
          required: false,
          ...(imageComponent?.maxHeight && {
            defaultValue: String(imageComponent.maxHeight)}),
        },
        {
          name: "imageType",
          label: "Type of Image (20MB or less)",
          type: "select",
          options: [
            { label: "Image", value: "image" },
            { label: "Gif", value: "gif" },
            { label: "SVG (data:image...)", value: "svg" },
          ],
          required: true,
        },
      ],
      title: imageComponent ? "Edit Image" : "Add Image",
      acceptLabel: "Save",
    },
    async (values) => {
      // TODO: comeback for type of image handling
      try {
        // Upload the image using the Devvit media API
        // const context = Devvit.getSystemContext();
        const uploadUrl = values.uploadUrl as string;

        // If editing an existing image and URL hasn't changed, skip upload
        if (imageComponent && imageComponent.url === uploadUrl) {
          const formData = {
            id: imageComponent.id,
            type: "Image",
            url: uploadUrl,
            width: values.width as string,
            height: values.height as string,
            resizeMode: values.resizeMode[0] as "fit" | "fill" | "cover",
            imageWidth: values.imageWidth as number,
            imageHeight: values.imageHeight as number,
            minWidth: values.minWidth as string,
            minHeight: values.minHeight as string,
            maxWidth: values.maxWidth as string,
            maxHeight: values.maxHeight as string,
          };

          // Validate with Zod schema
          const result = Schema.ImageElementSchema.safeParse(formData);
          if (!result.success) {
            context.ui.showToast("Not valid values");
            return;
          }

          onSave(result.data);
          return;
        }

        // Show loading message
        context.ui.showToast("Uploading image...");
        const imageType = values.imageType[0] as "image" | "gif" | "video";
        let response;
        if (values.imageType[0] !== "svg") {
          response = await context.media.upload({
            url: uploadUrl,
            type: imageType,
          });
        }

        // Create image data object
        const imageData = {
          id: component?.id || `image-${Date.now()}`,
          type: "Image" as const,
          url: response?.mediaUrl ?? values.uploadUrl,
          width: values.width as string,
          height: values.height as string,
          resizeMode: values.resizeMode[0] as "fit" | "fill" | "cover",
          imageWidth: values.imageWidth as number,
          imageHeight: values.imageHeight as number,
          minWidth: values.minWidth as string,
          minHeight: values.minHeight as string,
          maxWidth: values.maxWidth as string,
          maxHeight: values.maxHeight as string,
        };

        // Validate with Zod schema
        const result = Schema.ImageElementSchema.safeParse(imageData);
        if (!result.success) {
          context.ui.showToast("Not valid values");
          return;
        }

        // Success message
        context.ui.showToast("Image uploaded successfully!");

        onSave(result.data);
      } catch (err) {
        console.error("Error uploading image:", err);
        context.ui.showToast("Error uploading image. Please try again.");
      }
    },
  );
};
