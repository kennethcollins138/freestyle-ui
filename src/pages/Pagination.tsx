import { Devvit, useForm, useState } from "@devvit/public-api";
import { Page } from "../components/elements/Page.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { ComponentType, PageSchema } from "../api/Schema.js";
import { PersonalPlug } from "../components/elements/PersonalPlug.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";

export const PaginationPage = ({
  params,
  navigate,
  context,
  appPost,
  isOwner,
}: PageProps): JSX.Element => {
  const { pageId } = params;
  const [pageStructure, setPageStructure] = useState<PageSchema>(
    appPost.pages[pageId],
  );

  const { componentManager, componentRenderer, flattenComponents } =
    useComponentOperations(context, pageId, setPageStructure, false);

  // Create a sub-page with a pagination button that links to it
  const handleCreateSubPage = async () => {
    // Show a form to get the page name
    const pageNameForm = useForm(
      {
        fields: [
          {
            name: "pageName",
            label: "Page Name",
            type: "string",
            required: true,
          },
        ],
        title: "Create Sub-Page",
        acceptLabel: "Create",
      },
      async (data) => {
        try {
          const pageName = data.pageName as string;
          const newPageId = await componentManager.createNewPageWithButton(
            pageId,
            pageName,
          );

          // Navigate to the new page
          navigate("pagination", { pageId: newPageId });
          context.ui.showToast(`New page "${pageName}" created!`);
        } catch (error) {
          console.error("Error creating new page:", error);
          context.ui.showToast("Failed to create new page. Please try again.");
        }
      },
    );

    context.ui.showForm(pageNameForm);
  };

  // Action handlers
  const goToHome = () => navigate("home");
  const settingsPage = () => navigate("admin");

  const navigateAdapter = (route: string, params?: any) => {
    navigate(route as Route, params as RouteParams);
  };

  // Page not found handler
  if (!pageStructure) {
    return (
      <Page>
        <Page.Content navigate={navigate} showHomeButton={true}>
          <vstack
            alignment="center middle"
            width={100}
            height={100}
            gap="medium"
          >
            <text size="xlarge" weight="bold">
              Page Not Found
            </text>
            <text size="medium" wrap>
              The page you're looking for doesn't exist or has been deleted.
            </text>
            <button
              onPress={goToHome}
              appearance="primary"
              size="medium"
              icon="home"
            >
              Return to Home
            </button>
          </vstack>
        </Page.Content>
      </Page>
    );
  }

  // const flattenedComponents = flattenComponents(pageStructure.children);

  // Render the page
  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={true}>
        <vstack
          alignment="center"
          width={100}
          height={100}
          gap="medium"
          padding="medium"
        >
          <zstack width={100} alignment="top">
            {isOwner && (
              <vstack gap="medium" padding="small" width={100}>
                <hstack gap="small" alignment="start">
                  <button
                    onPress={settingsPage}
                    icon="settings"
                    size="small"
                    appearance="primary"
                  />
                  {/*<button*/}
                  {/*    icon="add"*/}
                  {/*    onPress={() => showAddComponentSelector()}*/}
                  {/*    appearance="primary"*/}
                  {/*    size="small"*/}
                  {/*/>*/}
                  {/*<button*/}
                  {/*    icon="edit"*/}
                  {/*    onPress={() => showEditComponentPicker(flattenedComponents)}*/}
                  {/*    appearance="primary"*/}
                  {/*    size="small"*/}
                  {/*/>*/}
                  {/*<button*/}
                  {/*    icon="delete"*/}
                  {/*    onPress={() => showDeleteComponentPicker(flattenedComponents)}*/}
                  {/*    appearance="primary"*/}
                  {/*    size="small"*/}
                  {/*/>*/}
                  <button
                    icon="view-compact"
                    onPress={handleCreateSubPage}
                    appearance="primary"
                    size="small"
                  />
                </hstack>
                <text size="xsmall" wrap>
                  Admin controls: Settings, Add, Edit, Delete, Create Page
                </text>
              </vstack>
            )}
          </zstack>

          {pageStructure.children?.length > 0 ? (
            componentRenderer.renderComponents(
              pageStructure.children as ComponentType[],
              navigateAdapter,
            )
          ) : (
            <vstack alignment="center middle" width={80} gap="medium">
              <text size="large" weight="bold">
                Empty Page
              </text>
              <text size="medium" wrap>
                This page is currently empty. Click the "+" button above to add
                your first component.
              </text>
              {/*{isOwner && (*/}
              {/*    <button*/}
              {/*        onPress={() => showAddComponentSelector()}*/}
              {/*        appearance="primary"*/}
              {/*        size="medium"*/}
              {/*        icon="add"*/}
              {/*    >*/}
              {/*      Add Component*/}
              {/*    </button>*/}
              {/*)}*/}
            </vstack>
          )}
          <PersonalPlug context={context} />
        </vstack>
      </Page.Content>
    </Page>
  );
};
