import { Devvit } from '@devvit/public-api';
import { ComponentType } from '../../types/component.js';
import { createTextEditor } from "./TextEditor.js";
import { createButtonEditor } from "./ButtonEditor.js";
import { createImageEditor } from "./ImageEditor.js";
import { createStackEditor } from "./StackEditor.js";
import { createPaginationButtonEditor } from "./PaginationButtonEditor.js";

/**
 * Factory function that returns the appropriate editor based on component type
 */
export const getComponentEditor = (
    context: Devvit.Context,
    componentType: string,
    component?: ComponentType,
    onSave?: (data: any) => void
) => {
    switch (componentType) {
        case 'Text':
            return createTextEditor(context, component, onSave);

        case 'Button':
            return createButtonEditor(context, component, onSave);

        case 'Image':
            // FIX: Need to rework
            return createImageEditor(context, component, onSave);

        case 'VStack':
        case 'HStack':
        case 'ZStack':
            return createStackEditor(context, componentType, component, onSave);

        case 'PaginationButton':
            return createPaginationButtonEditor(context, component, onSave);

        default:
            throw new Error(`Unknown component type: ${componentType}`);
    }
};