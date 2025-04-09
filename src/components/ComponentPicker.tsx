import { Devvit, useForm } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";

export interface ComponentPickerProps {
  setComponentType: (componentType: string | null) => void;
  setFormType: (formType: "add" | "edit" | "delete" | null) => void;
  setComponentId: (componentId: string | null) => void;
  context: Devvit.Context;
  components: ComponentType[];
  onDelete?: (componentId: string) => void;
  title?: string;
  acceptLabel?: string;
}

export const ComponentPicker = ({
  context,
  components,
  setComponentType,
  setComponentId,
  setFormType,
  title = "Select Component",
  acceptLabel = "Select",
  onDelete
}: ComponentPickerProps) => {
  // Create options from components
  const componentOptions = components.map((component) => ({
    label: `${component.type} - ${component.id}`,
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
      const selectedComponent = data.selectedComponent[0] as string;
      const [componentType, componentId] = selectedComponent.split(":");
      if (acceptLabel === "Delete"){
        setFormType("delete");
      } else {
        setFormType("edit");
      }
      setComponentType(componentType);
      setComponentId(componentId);
      if (onDelete) {
        onDelete(componentId);
      }
    },
  );
};
