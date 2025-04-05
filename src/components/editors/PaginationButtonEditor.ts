import { Devvit, useForm } from "@devvit/public-api";
import { ALL_ICON_NAMES } from "@devvit/public-api";
import { randomId } from "../../util.js";
import { PaginationButtonElementSchema } from "../../api/Schema.js";

export const createPaginationButtonEditor = (
  context: Devvit.Context,
  component?: PaginationButtonElementSchema,
  onSave?: (data: PaginationButtonElementSchema) => void,
) => {
  return useForm(
    {
      fields: [
        {
          name: "text",
          label: "Button Text",
          type: "string",
          required: true,
          defaultValue: component?.text,
        },
        {
          name: "icon",
          label: "Icon",
          type: "select",
          options: ALL_ICON_NAMES.map((icon) => ({ label: icon, value: icon })),
          required: false,
          defaultValue: component?.icon
              ? [component?.icon]
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
          defaultValue: component?.size
          ? [component?.size]
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
          defaultValue: component?.appearance
            ? [component?.appearance]
            : ["secondary"],
        },
        {
          name: "isGrow",
          label: "Grow",
          type: "boolean",
          defaultValue: component?.isGrow || false,
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          defaultValue: String(component?.width) || "50",
          required: false,
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          defaultValue: String(component?.height) || "50",
          required: false,
        },
      ],
      title: component ? "Edit Pagination Button" : "Add Pagination Button",
      acceptLabel: "Save",
    },
    async (values) => {
      const formData = {
        id: values.id,
        type: "PaginationButton" as const,
        text: values.text as string,
        // TODO: Fix should be able to backlink other pages as well
        pageId: `page-${randomId()}`,
        icon: values.icon[0] as PaginationButtonElementSchema["icon"],
        size: (values.size[0] || "medium") as PaginationButtonElementSchema["size"],
        appearance: (values.appearance?.[0] || "secondary") as PaginationButtonElementSchema["appearance"],
        isGrow: values.isGrow as boolean,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };

      if (onSave) onSave(formData);
    },
  );
};
