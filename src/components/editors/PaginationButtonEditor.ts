import { Devvit, useForm } from "@devvit/public-api";
import { ALL_ICON_NAMES } from "@devvit/public-api";
import { randomId } from "../../util.js";
import {
  ComponentType,
  PaginationButtonElementSchema,
} from "../../api/Schema.js";
import { FormProps } from "../../types/component.js";

export const createPaginationButtonEditor = ({
  context,
  component,
  onSave,
}: FormProps) => {
  const buttonComponent = component as PaginationButtonElementSchema;
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
          name: "icon",
          label: "Icon",
          type: "select",
          options: ALL_ICON_NAMES.map((icon) => ({ label: icon, value: icon })),
          required: false,
          ...(buttonComponent?.icon && {
            defaultValue: [buttonComponent.icon],
          }),
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
            : ["secondary"],
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
      title: component ? "Edit Pagination Button" : "Add Pagination Button",
      acceptLabel: "Save",
    },
    async (values) => {
      const newPageId = `page-${randomId()}`;

      const formData = {
        id: component?.id || `pagebutton-${randomId()}`,
        type: "PaginationButton" as const,
        text: values.text as string || "Page Button",
        pageId: buttonComponent?.pageId || newPageId,
        icon: Array.isArray(values.icon) && values.icon.length > 0
            ? values.icon[0] as PaginationButtonElementSchema["icon"]
            : undefined,
        size: (Array.isArray(values.size) && values.size.length > 0
            ? values.size[0]
            : "medium") as PaginationButtonElementSchema["size"],
        appearance: (Array.isArray(values.appearance) && values.appearance.length > 0
            ? values.appearance[0]
            : "secondary") as PaginationButtonElementSchema["appearance"],
        isGrow: Boolean(values.isGrow),
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
        action: {
          type: "navigate",
          targetPageId: buttonComponent?.pageId || newPageId,
        },
      } as PaginationButtonElementSchema;

      if (onSave) onSave(formData);
    },
  );
};
