import { Devvit, useForm } from "@devvit/public-api";
import { ALL_ICON_NAMES } from "@devvit/public-api";
import { ButtonElementSchema } from "../../api/Schema.js";
import { FormProps } from "../../types/component.js";
import {randomId} from "../../util.js";

export const createButtonEditor = ({
  context,
  component,
  onSave,
}: FormProps) => {
  const buttonComponent = component as ButtonElementSchema;
  return useForm(
    {
      fields: [
        {
          name: "text",
          label: "Button Text",
          type: "string",
          required: true,
          ...(buttonComponent?.text && {
            defaultValue: buttonComponent.text,
          }),
        },
        {
          name: "url",
          label: "Button URL",
          type: "string",
          required: false,
          ...(buttonComponent?.url && {
            defaultValue: buttonComponent.url,
          }),
        },
        {
          name: "icon",
          label: "Icon",
          type: "select",
          options: ALL_ICON_NAMES.map((icon) => ({ label: icon, value: icon })),
          ...(buttonComponent?.icon && {
            defaultValue: [buttonComponent.icon],
          }),
          required: false,
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
            : ["primary"],
        },
        {
          name: "isGrow",
          label: "Grow",
          type: "boolean",
          ...(buttonComponent?.isGrow && {
            defaultValue: buttonComponent.isGrow,
          }),
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          ...(buttonComponent?.width && {
            defaultValue: String(buttonComponent.width),
          }),
          required: false,
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          ...(buttonComponent?.height && {
            defaultValue: String(buttonComponent.height),
          }),
          required: false,
        },
      ],
      title: buttonComponent ? "Edit Button" : "Add Button",
      acceptLabel: "Save",
    },
    async (values) => {
      const formData = {
        id: component?.id || `button-${randomId()}`,
        type: "Button" as const,
        text: values.text as string || "Button",
        url: values.url as string || "",
        // Safely access array values with null checks
        icon: Array.isArray(values.icon) && values.icon.length > 0
            ? values.icon[0] as ButtonElementSchema["icon"]
            : undefined,
        size: (Array.isArray(values.size) && values.size.length > 0
            ? values.size[0]
            : "medium") as ButtonElementSchema["size"],
        appearance: (Array.isArray(values.appearance) && values.appearance.length > 0
            ? values.appearance[0]
            : "primary") as ButtonElementSchema["appearance"],
        isGrow: Boolean(values.isGrow),
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };

      context.ui.showToast("Button Created!");
      onSave(formData);
    },
  );
};
