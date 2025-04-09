import { Devvit } from "@devvit/public-api";
import { ComponentManager } from "../components/ComponentManager.js";
import { ComponentSelector } from "../components/ComponentSelector.js";
import { ComponentPicker } from "../components/ComponentPicker.js";
import { ComponentType, ElementSchema } from "../api/Schema.js";
import { ComponentRenderer } from "../components/ComponentRendererFactory.js";

export function useComponentOperations(
  context: Devvit.Context,
  pageId: string,
  setPageStructure: (structure: any) => void,
  isHomePage = false,
) {
  const componentManager = new ComponentManager(context, context.postId || "");
  const componentRenderer = new ComponentRenderer(context);

  const handleAddComponent = async (newComponent: ComponentType) => {
    try {
      const updatedStructure = isHomePage
        ? await componentManager.addComponentToHome(newComponent)
        : await componentManager.addComponentToPage(pageId, newComponent);

      setPageStructure(updatedStructure); // ✅ This updates the state with the new structure
      context.ui.showToast("Component added successfully!");
    } catch (error) {
      console.error("Error adding component:", error);
      context.ui.showToast("Failed to add component. Please try again.");
    }
  };

  const handleEditComponent = async (
    componentId: string,
    componentType: string,
    updatedComponent: ComponentType,
  ) => {
    try {
      const updatedStructure = isHomePage
          ? await componentManager.updateComponentOnHome(updatedComponent)
          : await componentManager.updateComponentOnPage(
              pageId,
              updatedComponent,
          );

      setPageStructure(updatedStructure);
      context.ui.showToast("Component updated successfully!");
    } catch (error) {
      console.error("Error updating component:", error);
      context.ui.showToast("Failed to update component. Please try again.");
    }
  }

  const handleDeleteComponent = async (
      componentId: string,
  ) => {
      const updatedStructure = isHomePage
                  ? await componentManager.deleteComponentFromHome(componentId)
                  : await componentManager.deleteComponentFromPage(
                      pageId,
                      componentId,
                    );
      setPageStructure(updatedStructure);
      context.ui.showToast("Component deleted successfully!");
  }

  // const handleDeleteComponent = async (componentId: string) => {
  //   try {
  //     // Use form as confirmation instead of showConfirmation
  //     const deleteForm = Devvit.createForm(
  //       () => ({
  //         fields: [
  //           {
  //             name: "confirm",
  //             label:
  //               "Are you sure you want to delete this component? This cannot be undone.",
  //             type: "string",
  //             defaultValue: "Type DELETE to confirm",
  //           },
  //         ],
  //         title: "Confirm Delete",
  //         acceptLabel: "Delete",
  //       }),
  //       async ({ values }) => {
  //         if (values.confirm === "DELETE") {
  //           const updatedStructure = isHomePage
  //             ? await componentManager.deleteComponentFromHome(componentId)
  //             : await componentManager.deleteComponentFromPage(
  //                 pageId,
  //                 componentId,
  //               );
  //
  //           setPageStructure(updatedStructure);
  //           context.ui.showToast("Component deleted successfully!");
  //         } else {
  //           context.ui.showToast(
  //             "Delete canceled. You must type DELETE to confirm.",
  //           );
  //         }
  //       },
  //     );
  //
  //     context.ui.showForm(deleteForm);
  //   } catch (error) {
  //     console.error("Error deleting component:", error);
  //     context.ui.showToast("Failed to delete component. Please try again.");
  //   }
  // };

  return {
    componentManager,
    componentRenderer,
    handleAddComponent,
    handleDeleteComponent,
    handleEditComponent,
    flattenComponents: componentManager.flattenStructure,
  };
}
