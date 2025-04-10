import { Devvit } from "@devvit/public-api";
import { ComponentManager } from "../components/ComponentManager.js";
import { AppController } from "../api/AppController.js";
import { ComponentType, ElementSchema, HomeSchema, PageSchema } from "../api/Schema.js";
import { ComponentRenderer } from "../components/ComponentRendererFactory.js";
import { deepClone } from "../util.js";

export function useComponentOperations(
    context: Devvit.Context,
    pageId: string,
    setPageStructure: (structure: any) => void,
    isHomePage = false,
    updateAppPost: Function,
) {
  const componentManager = new ComponentManager(context, context.postId || "", updateAppPost);

  // Function to refresh page data
  const refreshPageData = async () => {
    try {
      const appController = new AppController(context.postId || "", context);
      let freshData;

      if (isHomePage) {
        freshData = await appController.readWholePage("home");
      } else {
        freshData = await appController.readWholePage(pageId);
      }

      if (freshData) {
        // Force completely new references for the page and its children
        const newReferenceData = JSON.parse(JSON.stringify(freshData));
        console.log("REFRESH: Got fresh data with", newReferenceData.children.length, "components");
        setPageStructure(newReferenceData);
        return newReferenceData;
      }
    } catch (error) {
      console.error("Error refreshing page data:", error);
      context.ui.showToast("Failed to refresh page data");
    }
    return null;
  };

  const handleAddComponent = async (newComponent: ComponentType) => {
    try {
      console.log("Adding component:", newComponent.type);

      // First add the component to the database using updateAppPost
      // instead of direct database update
      const updatedStructure = isHomePage
          ? await componentManager.addComponentToHome(newComponent)
          : await componentManager.addComponentToPage(pageId, newComponent);

      // Explicitly refresh data after the operation
      await refreshPageData();

      context.ui.showToast("Component added successfully!");
      return updatedStructure;
    } catch (error) {
      console.error("Error adding component:", error);
      context.ui.showToast("Failed to add component. Please try again.");
    }
  };

  const handleEditComponent = async (
      updatedComponent: ComponentType,
  ) => {
    try {
      console.log("Editing component:", updatedComponent.id);

      const updatedStructure = isHomePage
          ? await componentManager.updateComponentOnHome(updatedComponent)
          : await componentManager.updateComponentOnPage(
              pageId,
              updatedComponent,
          );

      // Explicitly refresh data after the operation
      await refreshPageData();

      context.ui.showToast("Component updated successfully!");
      return updatedStructure;
    } catch (error) {
      console.error("Error updating component:", error);
      context.ui.showToast("Failed to update component. Please try again.");
    }
  }

  const handleDeleteComponent = async (
      componentId: string,
  ) => {
    try {
      console.log("Deleting component:", componentId);

      const updatedStructure = isHomePage
          ? await componentManager.deleteComponentFromHome(componentId)
          : await componentManager.deleteComponentFromPage(
              pageId,
              componentId,
          );

      // Explicitly refresh data after the operation
      await refreshPageData();

      context.ui.showToast("Component deleted successfully!");
      return updatedStructure;
    } catch (error) {
      console.error("Error deleting component:", error);
      context.ui.showToast("Failed to delete component. Please try again.");
    }
  }

  return {
    componentManager,
    handleAddComponent,
    handleDeleteComponent,
    handleEditComponent,
    flattenComponents: componentManager.flattenStructure,
    refreshPageData,
  };
}
