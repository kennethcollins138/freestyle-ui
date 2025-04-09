import { Devvit, useForm } from "@devvit/public-api";
import { TextElementSchema } from "../../api/Schema.js";
import { FormProps } from "../../types/component.js";
import {randomId} from "../../util.js";

export const createTextEditor = ({ context, component, onSave }: FormProps) => {
  const textComponent = component as TextElementSchema;
  return useForm(
    {
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string",
          required: true,
          ...(textComponent?.text && {defaultValue: textComponent.text}),
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
          ...(textComponent?.style && {defaultValue: [textComponent.style]}),
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
          ...(textComponent?.size && {defaultValue: [textComponent.size]}),
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
          ...(textComponent?.weight && {defaultValue: [textComponent.weight]}),
        },
        {
          name: "color",
          label: "Color",
          type: "string",
          required: false,
          ...(textComponent?.color && {defaultValue: textComponent.color}),
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
          ...(textComponent?.alignment && {defaultValue: [textComponent.alignment]}),
        },
        {
          name: "wrap",
          label: "Wrap Text",
          type: "boolean",
          ...(textComponent?.wrap && {defaultValue: textComponent.wrap}),
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          required: false,
          ...(textComponent?.width && {defaultValue: String(textComponent.width)}),
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          required: false,
          ...(textComponent?.height && {defaultValue: String(textComponent.height)}),
        },
      ],
      title: component ? "Edit Text" : "Add Text",
      acceptLabel: "Save",
    },
    async (values) => {
      const formData = {
        id: component?.id || `text-${randomId()}`,
        type: "Text" as const,
        text: values.text as string || "Text Element",
        style: Array.isArray(values.style) && values.style.length > 0
            ? values.style[0] as TextElementSchema["style"]
            : undefined,
        size: Array.isArray(values.size) && values.size.length > 0
            ? values.size[0] as TextElementSchema["size"]
            : undefined,
        weight: Array.isArray(values.weight) && values.weight.length > 0
            ? values.weight[0] as TextElementSchema["weight"]
            : undefined,
        color: values.color as string,
        alignment: Array.isArray(values.alignment) && values.alignment.length > 0
            ? values.alignment[0] as TextElementSchema["alignment"]
            : undefined,
        wrap: Boolean(values.wrap),
        width: values.width as Devvit.Blocks.SizeString,
        height: values.height as Devvit.Blocks.SizeString,
      };

      if (onSave) onSave(formData);
    },
  );
};
