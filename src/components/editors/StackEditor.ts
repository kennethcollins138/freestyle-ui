import { Devvit, useForm } from "@devvit/public-api";
import { ComponentType, StackSchema } from "../../api/Schema.js";
import { FormProps } from "../../types/component.js";
import {randomId} from "../../util.js";

type StackFormProps = FormProps & {
  componentType: "VStack" | "HStack" | "ZStack";
};
export const createStackEditor = ({
  context,
  component,
  componentType,
  onSave,
}: StackFormProps) => {
  const stackComponent = component as StackSchema;
  return useForm(
    {
      fields: [
        {
          name: "gap",
          label: "Gap",
          type: "select",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
          required: false,
          ...(stackComponent?.gap && {
            defaultValue: [stackComponent.gap],
          }),
        },
        {
          name: "alignment",
          label: "Alignment",
          type: "select",
          options: [
            { label: "Center", value: "center" },
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
          ...(stackComponent?.alignment && {
            defaultValue: [stackComponent.alignment],
          }),
        },
        {
          name: "width",
          label: "Width",
          type: "string",
          ...(stackComponent?.width && {
            defaultValue: String(stackComponent.width),
          }),
          required: false,
        },
        {
          name: "height",
          label: "Height",
          type: "string",
          required: false,
          ...(stackComponent?.height && {
            defaultValue: String(stackComponent.height),
          }),
        },
        {
          name: "padding",
          label: "Padding",
          type: "select",
          options: [
            { label: "None", value: "none" },
            { label: "XSmall", value: "xsmall" },
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
          required: false,
          ...(stackComponent?.padding && {
            defaultValue: [stackComponent.padding],
          }),
        },
        {
          name: "backgroundColor",
          label: "Background Color",
          type: "string",
          required: false,
          ...(stackComponent?.backgroundColor && {
            defaultValue: stackComponent.backgroundColor,
          }),
        },
      ],
      title: component ? `Edit ${stackComponent}` : `Add ${stackComponent}`,
      acceptLabel: "Save",
    },
    async (values) => {
      const baseData = {
        id: stackComponent?.id || `${componentType.toLowerCase()}-${randomId()}`,
        gap: Array.isArray(values.gap) && values.gap.length > 0
            ? values.gap[0]
            : undefined,
        alignment: Array.isArray(values.alignment) && values.alignment.length > 0
            ? values.alignment[0]
            : "center",
        children: stackComponent?.children || [],
        width: values.width as string || "100%",
        height: values.height as string,
        padding: Array.isArray(values.padding) && values.padding.length > 0
            ? values.padding[0]
            : undefined,
        backgroundColor: values.backgroundColor as string,
      };

      let formData;
      if (componentType === "ZStack") {
        formData = {
          ...baseData,
          type: "ZStack" as const,
        };
      } else if (componentType === "HStack") {
        formData = {
          ...baseData,
          type: "HStack" as const,
        };
      } else {
        formData = {
          ...baseData,
          type: "VStack" as const,
        };
      }
      const data = formData as StackSchema;
      onSave(data);
    },
  );
};
