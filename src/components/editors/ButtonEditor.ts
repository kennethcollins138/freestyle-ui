import { Devvit, useForm } from "@devvit/public-api";
import { ALL_ICON_NAMES } from "@devvit/public-api";
import { ButtonElementSchema } from "../../api/Schema.js";

export const createButtonEditor = (
  context: Devvit.Context,
  component?: ButtonElementSchema,
  onSave?: (data: ButtonElementSchema) => void,
) => {
  const buttonComponent = component as ButtonElementSchema;
  return useForm(
    {
      fields: [
        {
          name: "text",
          label: "Button Text",
          type: "string",
          required: true,
          defaultValue: buttonComponent?.text,
        },
        {
          name: "url",
          label: "Button URL",
          type: "string",
          required: true,
          defaultValue: buttonComponent?.url,
        },
        {
          name: "icon",
          label: "Icon",
          type: "select",
          options: ALL_ICON_NAMES.map((icon) => ({ label: icon, value: icon })),
          required: false,
          defaultValue: buttonComponent?.icon
            ? [buttonComponent?.icon]
            : undefined,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
          required: true,
          defaultValue: buttonComponent?.size
            ? [buttonComponent?.size]
            : ["medium"],
        },
        {
          name: "appearance",
          label: "Appearance",
          type: "select",
          options: [
            { label: "Secondary", value: "secondary" },
            { label: "Primary", value: "primary" },
            { label: "Plain", value: "plain" },
            { label: "Bordered", value: "bordered" },
            { label: "Media", value: "media" },
            { label: "Destructive", value: "destructive" },
            { label: "Caution", value: "caution" },
            { label: "Success", value: "success" },
          ],
          required: true,
          defaultValue: buttonComponent?.appearance
            ? [buttonComponent?.appearance]
            : ["plain"],
        },
        {
          name: "isGrow",
          label: "Grow",
          type: "boolean",
          defaultValue: buttonComponent?.isGrow || false,
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          defaultValue: String(buttonComponent?.width) || "50",
          required: false,
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          defaultValue: String(buttonComponent?.height) || "50",
          required: false,
        },
      ],
      title: component ? "Edit Button" : "Add Button",
      acceptLabel: "Save",
    },
    async (values) => {
      const formData = {
        id: values.id,
        type: "Button" as const,
        text: values.text as string,
        url: values.url as string,
        icon: values.icon[0] as ButtonElementSchema["icon"],
        size: (values.size[0] || "medium") as ButtonElementSchema["size"],
        appearance: (values.appearance[0] || "secondary") as ButtonElementSchema["appearance"],
        isGrow: values.isGrow as boolean,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };

      context.ui.showToast("Button Created!")
      if (onSave) onSave(formData);
    },
  );
};
