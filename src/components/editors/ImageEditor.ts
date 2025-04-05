import { Devvit, useForm } from "@devvit/public-api";
import { ImageElementSchema, Schema } from "../../api/Schema.js";

export const createImageEditor = (
  context: Devvit.Context,
  component: ImageElementSchema,
  onSave: (data: ImageElementSchema) => void,
) => {
  return useForm(
    {
      fields: [
        {
          name: "uploadUrl",
          label: "Image URL",
          helpText: "Enter a direct image URL (ending with .jpg, .png, etc.)",
          type: "string",
          required: true,
          defaultValue: component?.url,
        },
        {
          name: "width",
          label: "Width",
          helpText: "Use pixels (e.g., 300) or percentage (e.g., 100%)",
          type: "string",
          required: true,
          defaultValue: String(component?.width) || "100%",
        },
        {
          name: "height",
          label: "Height",
          helpText: "Use pixels (e.g., 200) or percentage (e.g., auto)",
          type: "string",
          required: true,
          defaultValue: String(component?.height) || "auto",
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
          // Note comeback to this as well
          defaultValue: component?.resizeMode
            ? [component?.resizeMode]
            : ["fit"],
        },
        {
          name: "imageWidth",
          label: "Original Image Width",
          helpText: "The actual width of the image in pixels",
          type: "number",
          required: true,
          defaultValue: Number(component?.imageWidth) || 1024,
        },
        {
          name: "imageHeight",
          label: "Original Image Height",
          helpText: "The actual height of the image in pixels",
          type: "number",
          required: true,
          defaultValue: Number(component?.imageHeight) || 768,
        },
        {
          name: "minWidth",
          label: "Minimum Width (optional)",
          type: "string",
          required: false,
          defaultValue: String(component?.minWidth),
        },
        {
          name: "minHeight",
          label: "Minimum Height (optional)",
          type: "string",
          required: false,
          defaultValue: String(component?.minHeight) ?? undefined,
        },
        {
          name: "maxWidth",
          label: "Maximum Width (optional)",
          type: "string",
          required: false,
          defaultValue: String(component?.maxWidth) ?? undefined,
        },
        {
          name: "maxHeight",
          label: "Maximum Height (optional)",
          type: "string",
          required: false,
          defaultValue: String(component?.maxHeight),
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
      title: component ? "Edit Image" : "Add Image",
      acceptLabel: "Save",
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

        let response;
        if (values.imageType[0] !== "svg") {
          response = await context.media.upload({
            url: uploadUrl,
            type: "image",
          })
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
