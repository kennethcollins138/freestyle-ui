import { Devvit, useAsync, useState } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";
import { Page } from "../components/elements/Page.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";
import { ComponentSelector } from "../components/ComponentSelector.js";
import { ComponentPicker } from "../components/ComponentPicker.js";
import { createButtonEditor } from "../components/editors/ButtonEditor.js";
import { createPaginationButtonEditor } from "../components/editors/PaginationButtonEditor.js";
import { createTextEditor } from "../components/editors/TextEditor.js";
import { createStackEditor } from "../components/editors/StackEditor.js";
import { createImageEditor } from "../components/editors/ImageEditor.js";
import { ComponentRenderer } from "../components/ComponentRendererFactory.js";

export const HomePage = ({
                           navigate,
                           context,
                           appPost,
                           isOwner,
                           postMethods: { updateAppPost, loadAppInstance },
                         }: PageProps): JSX.Element => {
  const [pageStructure, setPageStructure] = useState(appPost.home);
  const [formType, setFormType] = useState<"add" | "edit" | "delete" | null>(null);
  const [componentType, setComponentType] = useState<string | null>(null);
  const [componentId, setComponentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    handleAddComponent,
    handleDeleteComponent,
    flattenComponents,
  } = useComponentOperations(context, "home", setPageStructure, true, updateAppPost);

  const navigateAdapter = (route: string, params?: any) => {
    navigate(route as Route, params as RouteParams);
  };

  const componentRenderer = new ComponentRenderer(context, { navigate: navigateAdapter });
  const flattenedComponents = flattenComponents(pageStructure.children);

  // Modified forceRefresh to avoid infinite loop
  const forceRefresh = async () => {
    // Prevent multiple refresh operations at once
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      const appInstance = await loadAppInstance();

      if (appInstance && appInstance.home) {
        // Create a completely new reference
        const updatedPage = {
          ...appInstance.home,
          children: [...appInstance.home.children]
        };
        console.log("Force refresh with children count:", updatedPage.children.length);
        setPageStructure(updatedPage);
        context.ui.showToast("Page refreshed");
      }
    } catch (error) {
      console.error("Error refreshing:", error);
      context.ui.showToast("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const editPage = () => navigate("edit", {pageId: "home"});
  const settingsPage = () => navigate("admin");

  //  ADD FORMS
  const addComponentForm = ComponentSelector({
    context,
    setFormType: setFormType,
    setComponentType: setComponentType,
  });

  const addButtonForm = createButtonEditor({
    context: context,
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addPaginationButtonForm = createPaginationButtonEditor({
    context: context,
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addTextForm = createTextEditor({
    context: context,
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addImageForm = createImageEditor({
    context: context,
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addVStackEditor = createStackEditor({
    context: context,
    componentType: "VStack",
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addHStackEditor = createStackEditor({
    context: context,
    componentType: "HStack",
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const addZStackEditor = createStackEditor({
    context: context,
    componentType: "ZStack",
    onSave: async (component) => {
      await handleAddComponent(component);
    },
  });

  const deleteComponentForm = ComponentPicker({
    context: context,
    components: flattenedComponents,
    setComponentId: setComponentId,
    setComponentType: setComponentType,
    setFormType: setFormType,
    onDelete: async (componentId) => {
      await handleDeleteComponent(componentId);
    },
    title: "Delete Component",
    acceptLabel: "Delete"
  });

  // Handle form type changes
  useAsync(
      async () => {
        if (formType === "add") {
          // Trigger the add form when formType is "add"
          switch (componentType) {
            case "Button":
              console.log("Showing button form");
              context.ui.showForm(addButtonForm);
              break;
            case "PaginationButton":
              context.ui.showForm(addPaginationButtonForm);
              break;
            case "Image":
              context.ui.showForm(addImageForm);
              break;
            case "Text":
              context.ui.showForm(addTextForm);
              break;
            case "VStack":
              context.ui.showForm(addVStackEditor);
              break;
            case "HStack":
              context.ui.showForm(addHStackEditor);
              break;
            case "ZStack":
              context.ui.showForm(addZStackEditor);
              break;
          }
          setFormType(null); // Reset formType to avoid re-triggering
          setComponentType(null);

          return "form_shown";
        } else if (formType === "edit" && componentId) {
          // Edit form logic would go here
          setFormType(null);
          setComponentType(null);
          setComponentId(null);
          return "edit_handled";
        } else if (formType === "delete" && componentId) {
          // Delete component logic is handled in the onDelete callback
          setFormType(null);
          setComponentType(null);
          setComponentId(null);
          return "delete_handled";
        }
        return null;
      },
      { depends: [formType, componentId, componentType] }
  );

  return (
      <Page>
        <Page.Content navigate={navigate} showHomeButton={false}>
          <vstack alignment="center" width="100%" height="100%">
            <zstack width="100%" alignment="middle">
              <hstack width="100%" alignment="center middle">
                {isOwner && (
                    <hstack gap="small" alignment="start">
                      <button
                          onPress={settingsPage}
                          icon="settings"
                          size="small"
                          appearance="primary"
                      />
                      <button
                          icon="add"
                          onPress={() => context.ui.showForm(addComponentForm)}
                          appearance="primary"
                          size="small"
                      />
                      <button
                          icon="edit"
                          onPress={editPage}
                          appearance="primary"
                          size="small"
                      />
                      <button
                          icon="delete"
                          onPress={() => context.ui.showForm(deleteComponentForm)}
                          appearance="primary"
                          size="small"
                      />
                      <button
                          icon="refresh"
                          onPress={forceRefresh}
                          appearance="primary"
                          size="small"
                          disabled={isRefreshing}
                      />
                    </hstack>
                )}
              </hstack>
            </zstack>

            {/* Render the component tree */}
            <vstack width="100%" height="100%" alignment="center">
              {componentRenderer.renderComponents(
                  [...pageStructure.children] as ComponentType[],
                  navigateAdapter
              )}

              {/* Show empty state if no components */}
              {pageStructure.children.length === 0 && (
                  <vstack alignment="center middle" gap="medium" padding="large">
                    <text size="large" weight="bold">No Components Yet</text>
                    <text alignment="center">Click the + button above to add your first component</text>
                  </vstack>
              )}
            </vstack>
          </vstack>
        </Page.Content>
      </Page>
  );
};
