import { Devvit, useForm } from "@devvit/public-api";

export interface ComponentSelectorProps {
  setComponentType: (componentType: string | null) => void;
  setFormType: (formType: "add" | "edit" | "delete" | null) => void;
  context: Devvit.Context;
  onSelect?: (componentType: string) => void;
}

export const ComponentSelector = ({
  context,
  setComponentType,
  setFormType,
  onSelect,
}: ComponentSelectorProps) => {
  return useForm(
    {
      fields: [
        {
          name: "componentType",
          label: "Select Component Type",
          type: "select",
          options: [
            { label: "VStack (Vertical Layout)", value: "VStack" },
            { label: "HStack (Horizontal Layout)", value: "HStack" },
            { label: "ZStack (Overlapping Layout)", value: "ZStack" },
            { label: "Button", value: "Button" },
            { label: "Image", value: "Image" },
            { label: "Text", value: "Text" },
            { label: "New Page Button", value: "PaginationButton" },
            // { label: "Developer Credit", value: "PersonalPlug" },
          ],
          required: true,
          multiple: false,
        },
      ],
      title: "Add New Component",
      acceptLabel: "Next",
    },
    async (data) => {
      const componentType = Array.isArray(data.componentType)
        ? data.componentType[0]
        : data.componentType;
      setFormType("add");
      setComponentType(componentType);
      // onSelect(componentType as string);
      context.ui.showToast(`Component ${componentType}`);
    },
  );
};
