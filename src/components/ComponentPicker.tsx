import { Devvit, useForm } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";

export interface ComponentPickerProps {
  context: Devvit.Context;
  components: ComponentType[];
  onSelect: (componentId: string, componentType: string) => void;
  title?: string;
  acceptLabel?: string;
}

export const ComponentPicker = ({
  context,
  components,
  onSelect,
  title = "Select Component",
  acceptLabel = "Select",
}: ComponentPickerProps) => {
  // Create options from components
  const componentOptions = components.map((component) => ({
    label: `${component.type} - ${ component.id }`,
    value: `${component.type}:${component.id}`,
  }));

  return useForm(
    {
      fields: [
        {
          name: "selectedComponent",
          label: "Select Component",
          type: "select",
          options: componentOptions,
          required: true,
          multiple: false,
        },
      ],
      title,
      acceptLabel,
    },
    (data) => {
      const selectedComponent = data.selectedComponent as unknown as string;
      const [componentType, componentId] = selectedComponent.split(":");
      onSelect(componentId, componentType);
    },
  );
};
