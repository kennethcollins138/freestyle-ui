import { Devvit, useAsync, useState } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";
import { Page } from "../components/elements/Page.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";
import { ComponentSelector } from "../components/ComponentSelector.js";
import { ComponentPicker } from "../components/ComponentPicker.js";
import { createButtonEditor } from "../components/editors/ButtonEditor.js";
import { getComponentEditor } from "../components/editors/ComponentEditorFactory.js";
import { createPaginationButtonEditor } from "../components/editors/PaginationButtonEditor.js";
import { createTextEditor } from "../components/editors/TextEditor.js";
import {createStackEditor} from "../components/editors/StackEditor.js";
import {sleep} from "../util.js";
import {createImageEditor} from "../components/editors/ImageEditor.js";

export const HomePage = ({
  navigate,
  context,
  appPost,
  isOwner,
  postMethods: { updateAppPost },
}: PageProps): JSX.Element => {
  const [pageStructure, setPageStructure] = useState(appPost.home);
  const [formType, setFormType] = useState<"add" | "edit" | "delete" | null>(
    null,
  );
  const [componentType, setComponentType] = useState<string | null>(null);
  const [componentId, setComponentId] = useState<string | null>(null);

  const {
    componentRenderer,
    handleAddComponent,
    handleDeleteComponent,
    handleEditComponent,
    flattenComponents,
  } = useComponentOperations(context, "home", setPageStructure, true);
  const flattenedComponents = flattenComponents(pageStructure.children);

  const settingsPage = () => navigate("admin");
  const navigateAdapter = (route: string, params?: any) => {
    navigate(route as Route, params as RouteParams);
  };

  //  ADD FORMS
  const addComponentForm = ComponentSelector({
    context,
    setFormType: setFormType,
    setComponentType: setComponentType,
  });

  const addButtonForm = createButtonEditor({
    context: context,
    onSave: handleAddComponent,
  });
  const addPaginationButtonForm = createPaginationButtonEditor({
    context: context,
    onSave: handleAddComponent,
  });
  const addTextForm = createTextEditor({
    context: context,
    onSave: handleAddComponent,
  });
  const addImageForm = createImageEditor({
    context: context,
    onSave: handleAddComponent,
  })
  const addVStackEditor = createStackEditor({
    context: context,
    componentType: "VStack",
    onSave: handleAddComponent,
  })
  const addHStackEditor = createStackEditor({
    context: context,
    componentType: "HStack",
    onSave: handleAddComponent,
  })
  const addZStackEditor = createStackEditor({
    context: context,
    componentType: "ZStack",
    onSave: handleAddComponent,
  })


  const deleteComponentForm = ComponentPicker({
    context: context,
    components: flattenedComponents,
    setComponentId: setComponentId,
    setComponentType: setComponentType,
    setFormType: setFormType,
    onDelete: handleDeleteComponent,
    title: "Delete Component",
    acceptLabel: "Delete"
  })


  const { data, loading, error } = useAsync(
    async () => {
      if (formType === "add") {
        // Trigger the add form when formType is "add"
        switch (componentType) {
          case "Button":
            console.log("adding button component: useAsync triggered");
            context.ui.showForm(addButtonForm);
            await sleep(5)
            break;
          case "PaginationButton":
            context.ui.showForm(addPaginationButtonForm);
            break;
          case "Image":
            context.ui.showForm(addImageForm);
            break;
          case "Text":
            context.ui.showForm(addTextForm);
            break
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
        return { data: "ok" };
      } else if (formType === "edit" && componentId) {
        // context.ui.showForm(editComponentForm);
        setFormType(null);
        setComponentType(null);
        setComponentId(null);
        return { data: "ok" };
      } else if (formType === "delete" && componentId) {
        // Trigger the delete form when formType is "delete".
        // await context.ui.showForm(deleteComponentForm);
        setFormType(null);
        setComponentType(null);
        setComponentId(null);
        return { data: "ok" };
      }
      return null;
    },
    { depends: [formType, componentId, componentType] },
  );

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
                    onPress={() => context.ui.showForm(addComponentForm)}
                    appearance="primary"
                    size="small"
                  />
                  <button
                    icon="edit"
                    // onPress={() => showEditForm()}
                    appearance="primary"
                    size="small"
                  />
                  <button
                    icon="delete"
                    onPress={() => context.ui.showForm(deleteComponentForm)}
                    appearance="primary"
                    size="small"
                  />
                </hstack>
              )}
            </hstack>
          </zstack>
          {componentRenderer.renderComponents(
            pageStructure.children as ComponentType[],
            navigateAdapter,
          )}
        </vstack>
      </Page.Content>
    </Page>
  );
};
