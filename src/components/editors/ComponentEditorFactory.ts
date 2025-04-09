import { Devvit } from "@devvit/public-api";
import { createTextEditor } from "./TextEditor.js";
import { createButtonEditor } from "./ButtonEditor.js";
import { createImageEditor } from "./ImageEditor.js";
import { createStackEditor } from "./StackEditor.js";
import { createPaginationButtonEditor } from "./PaginationButtonEditor.js";
import {
  ButtonElementSchema,
  ComponentType,
  ImageElementSchema,
  PaginationButtonElementSchema,
  StackSchema,
  TextElementSchema,
} from "../../api/Schema.js";

/**
 * Factory function that returns the appropriate editor based on component type
 */
export const getComponentEditor = (
  context: Devvit.Context,
  componentType: string,
  onSave: (data: any) => void,
  component?: ComponentType | undefined,
) => {
  switch (componentType) {
    case "Text":
      const textComponent = component as TextElementSchema;
      return createTextEditor({context, component: textComponent, onSave});

    case "Button":
      const buttonComponent = component as ButtonElementSchema;
      return createButtonEditor({context, component: buttonComponent, onSave});

    case "Image":
      // FIX: Need to rework
      const imageComponent = component as ImageElementSchema;
      return createImageEditor({context, component: imageComponent, onSave});

    case "VStack":
    case "HStack":
    case "ZStack":
      const stackComponent = component as StackSchema;
      return createStackEditor({context, componentType ,component: stackComponent, onSave});

    case "PaginationButton":
      const paginationButton = component as PaginationButtonElementSchema;
      return createPaginationButtonEditor({context, component: paginationButton , onSave});

    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
};
