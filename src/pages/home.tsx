import { Devvit, useState, } from "@devvit/public-api";

import { Page } from "../components/elements/Page.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";
import {ComponentType} from "../api/Schema.js";
import {ComponentSelector} from "../components/ComponentSelector.js";
import {ComponentRenderer} from "../components/ComponentRendererFactory.js";
import {ComponentPicker} from "../components/ComponentPicker.js";

export const HomePage = ({
                           navigate,
                           context,
                           appPost,
                           isOwner,
                           postMethods: { updateAppPost },
                         }: PageProps): JSX.Element => {
  const [pageStructure, setPageStructure] = useState(appPost.home);

  const {
    componentManager,
    componentRenderer,
    handleAddComponent,
    handleDeleteComponent,
    handleEditComponent,
    showEditComponentPicker,
    showDeleteComponentPicker,
    flattenComponents
  } = useComponentOperations(context, "home", setPageStructure, true);
  const flattenedComponents = flattenComponents(pageStructure.children);

  const addComponentForm = ComponentSelector({
      context,
      onSelect: handleAddComponent,
  });

    const createEditForm = () => {
        return ComponentPicker({
            context,
            components: flattenedComponents,
            onSelect: (componentId, componentType) =>
                handleEditComponent(componentId, componentType, flattenedComponents),
            title: "Edit Component",
            acceptLabel: "Edit",
        });
    };

    // For delete component
    const createDeleteForm = () => {
        return ComponentPicker({
            context,
            components: flattenedComponents,
            onSelect: (componentId) => handleDeleteComponent(componentId),
            title: "Delete Component",
            acceptLabel: "Delete",
        });
    };

    const showAddForm = () => {
        context.ui.showForm(addComponentForm);
    };
    const showEditForm = () => {
        // Create the form right before showing it to ensure it has the latest components
        const editForm = createEditForm();
        context.ui.showForm(editForm);
    };

    const showDeleteForm = () => {
        const deleteForm = createDeleteForm();
        context.ui.showForm(deleteForm);
    };

  const settingsPage = () => navigate("admin");
  const navigateAdapter = (route: string, params?: any) => {
    navigate(route as Route, params as RouteParams);
  };

  return (
      <Page>
        <Page.Content navigate={navigate} showHomeButton={false}>
          <vstack alignment="center" width={100} height={100}>
            <zstack width={100} alignment="middle">
              <hstack width={100} alignment="center middle">
                {isOwner && (
                    <hstack gap="small" alignment="start">
                      <button
                          onPress={settingsPage}
                          icon="settings"
                          size="small"
                          textColor="green"
                          appearance="primary"
                      />
                      <button
                          icon="add"
                          onPress={showAddForm}
                          appearance="primary"
                          size="small"
                      />
                      <button
                          icon="edit"
                          onPress={() => showEditForm()}
                          appearance="primary"
                          size="small"
                      />
                      <button
                          icon="delete"
                          onPress={() => showDeleteForm()}
                          appearance="primary"
                          size="small"
                      />
                    </hstack>
                )}
              </hstack>
            </zstack>
              {componentRenderer.renderComponents(
                  pageStructure.children as ComponentType[],
                  navigateAdapter
              )}
          </vstack>
        </Page.Content>
      </Page>
  );
};