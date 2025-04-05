import { Devvit } from "@devvit/public-api";
import { ComponentManager } from "../components/ComponentManager.js";
import { ComponentSelector } from "../components/ComponentSelector.js";
import { ComponentPicker } from "../components/ComponentPicker.js";
import { ElementSchema } from "../api/Schema.js";
import {ComponentRenderer} from "../components/ComponentRendererFactory.js";

export function useComponentOperations(
    context: Devvit.Context,
    pageId: string,
    setPageStructure: (structure: any) => void,
    isHomePage = false
) {
    const componentManager = new ComponentManager(context, context.postId || "");
    const componentRenderer = new ComponentRenderer(context);
    const handleAddComponent = (componentType: string) => {
        componentManager.showComponentCreator(
            componentType,
            async (newComponent) => {
                try {
                    const updatedStructure = isHomePage
                        ? await componentManager.addComponentToHome(newComponent)
                        : await componentManager.addComponentToPage(pageId, newComponent);

                    setPageStructure(updatedStructure);
                    context.ui.showToast("Component added successfully!");
                } catch (error) {
                    console.error("Error adding component:", error);
                    context.ui.showToast("Failed to add component. Please try again.");
                }
            }
        );
    };

    const handleEditComponent = (componentId: string, componentType: string, components: ElementSchema[]) => {
        const component = components.find((c) => c.id === componentId);
        if (!component) {
            context.ui.showToast("Component not found!");
            return;
        }

        componentManager.showComponentEditor(
            component,
            async (updatedComponent) => {
                try {
                    const updatedStructure = isHomePage
                        ? await componentManager.updateComponentOnHome(updatedComponent)
                        : await componentManager.updateComponentOnPage(pageId, updatedComponent);

                    setPageStructure(updatedStructure);
                    context.ui.showToast("Component updated successfully!");
                } catch (error) {
                    console.error("Error updating component:", error);
                    context.ui.showToast("Failed to update component. Please try again.");
                }
            }
        );
    };

    const handleDeleteComponent = async (componentId: string) => {
        try {
            // Use form as confirmation instead of showConfirmation
            const deleteForm = Devvit.createForm(
                () => ({
                    fields: [
                        {
                            name: "confirm",
                            label: "Are you sure you want to delete this component? This cannot be undone.",
                            type: "string",
                            defaultValue: "Type DELETE to confirm",
                        }
                    ],
                    title: "Confirm Delete",
                    acceptLabel: "Delete"
                }),
                async ({ values }) => {
                    if (values.confirm === "DELETE") {
                        const updatedStructure = isHomePage
                            ? await componentManager.deleteComponentFromHome(componentId)
                            : await componentManager.deleteComponentFromPage(pageId, componentId);

                        setPageStructure(updatedStructure);
                        context.ui.showToast("Component deleted successfully!");
                    } else {
                        context.ui.showToast("Delete canceled. You must type DELETE to confirm.");
                    }
                }
            );

            context.ui.showForm(deleteForm);
        } catch (error) {
            console.error("Error deleting component:", error);
            context.ui.showToast("Failed to delete component. Please try again.");
        }
    };

    const showAddComponentSelector = () => {
        const selector = ComponentSelector({
            context,
            onSelect: handleAddComponent,
        });
        context.ui.showForm(selector);
    };

    const showEditComponentPicker = (components: ElementSchema[]) => {
        const picker = ComponentPicker({
            context,
            components,
            onSelect: (componentId, componentType) =>
                handleEditComponent(componentId, componentType, components),
            title: "Edit Component",
            acceptLabel: "Edit",
        });
        context.ui.showForm(picker);
    };

    const showDeleteComponentPicker = (components: ElementSchema[]) => {
        const picker = ComponentPicker({
            context,
            components,
            onSelect: (componentId) => handleDeleteComponent(componentId),
            title: "Delete Component",
            acceptLabel: "Delete",
        });
        context.ui.showForm(picker);
    };

    return {
        componentManager,
        componentRenderer,
        handleAddComponent,
        handleDeleteComponent,
        handleEditComponent,
        showAddComponentSelector,
        showEditComponentPicker,
        showDeleteComponentPicker,
        flattenComponents: componentManager.flattenStructure,
    };
}