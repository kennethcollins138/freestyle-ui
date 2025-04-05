import { Devvit, useForm } from "@devvit/public-api";
import {TextElementSchema} from "../../api/Schema.js";

export const createTextEditor = (
  context: Devvit.Context,
  component?: TextElementSchema,
  onSave?: (data: TextElementSchema) => void,
) => {
  return useForm(
    {
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string",
          required: true,
          defaultValue: component?.text,
        },
        {
          name: "style",
          label: "Style",
          type: "select",
          options: [
            { label: "Body", value: "body" },
            { label: "Metadata", value: "metadata" },
            { label: "Heading", value: "heading" },
          ],
          required: false,
          defaultValue: !component?.style ? undefined : [component.style[0]],
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: [
            { label: "XSmall", value: "xsmall" },
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "XLarge", value: "xlarge" },
            { label: "XXLarge", value: "xxlarge" },
          ],
          required: false,
          defaultValue: !component?.size ? undefined : [component.size[0]],
        },
        {
          name: "weight",
          label: "Weight",
          type: "select",
          options: [
            { label: "Regular", value: "regular" },
            { label: "Bold", value: "bold" },
          ],
          required: false,
          defaultValue: !component?.weight ? undefined : [component.weight[0]],
        },
        {
          name: "color",
          label: "Color",
          type: "string",
          required: false,
          defaultValue: component?.color,
        },
        {
          name: "alignment",
          label: "Alignment",
          type: "select",
          options: [
            { label: "Top Start", value: "top start" },
            { label: "Top Center", value: "top center" },
            { label: "Top End", value: "top end" },
            { label: "Middle Start", value: "middle start" },
            { label: "Middle Center", value: "middle center" },
            { label: "Middle End", value: "middle end" },
            { label: "Bottom Start", value: "bottom start" },
            { label: "Bottom Center", value: "bottom center" },
            { label: "Bottom End", value: "bottom end" },
          ],
          required: false,
          defaultValue: !component?.alignment  ? undefined : [component.alignment[0]],
        },
        {
          name: "wrap",
          label: "Wrap Text",
          type: "boolean",
          defaultValue: component?.wrap || false,
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          required: false,
          defaultValue: String(component?.width),
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          required: false,
          defaultValue: String(component?.height),
        },
      ],
      title: component ? "Edit Text" : "Add Text",
      acceptLabel: "Save",
    },
    async (values) => {
      const formData = {
        id: values?.id,
        type: "Text" as const,
        text: values.text as string,
        style: values.style?.[0] as TextElementSchema["style"],
        size: values.size?.[0] as TextElementSchema["size"],
        weight: values.weight?.[0] as TextElementSchema["weight"],
        color: values.color as string,
        alignment: values.alignment?.[0] as TextElementSchema["alignment"],
        wrap: values.wrap as boolean,
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };

      if (onSave) onSave(formData);
    },
  );
};
