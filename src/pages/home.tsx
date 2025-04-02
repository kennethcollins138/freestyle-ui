import { Devvit, useState } from '@devvit/public-api';
import { Page } from '../components/elements/Page.js';
import type { PageProps } from '../types/page.js';
import { ComponentType } from '../api/Schema.js';
import { ComponentSelector } from '../components/ComponentSelector.js';
import { ComponentPicker } from '../components/ComponentPicker.js';
import { VStackElement } from "../components/elements/VStackElement.js";
import { HStackElement } from "../components/elements/HStackElement.js";
import { ZStackElement } from "../components/elements/ZStackElement.js";
import { TextElement } from "../components/elements/TextElement.js";
import { ImageElement } from "../components/elements/ImageElement.js";
import { ComponentManager } from '../components/ComponentManager.js';

export const HomePage = ({
                           navigate,
                           context,
                           appPost,
                           isOwner,
                           postMethods: {
                             updateAppPost,
                           },
                         }: PageProps): JSX.Element => {
  const [pageStructure, setPageStructure] = useState(appPost.home);
  const componentManager = new ComponentManager(context, context.postId || '');

  // Flatten the component structure for component selection
  const flattenedComponents = componentManager.flattenStructure(pageStructure.children);

  // Component Actions
  const handleAddComponent = (componentType: string) => {
    componentManager.showComponentCreator(componentType, async (newComponent) => {
      try {
        const updatedHome = await componentManager.addComponentToHome(newComponent);
        setPageStructure(updatedHome);
        context.ui.showToast('Component added successfully!');
      } catch (error) {
        console.error("Error adding component:", error);
        context.ui.showToast('Failed to add component. Please try again.');
      }
    });
  };

  const handleEditComponent = (componentId: string, componentType: string) => {
    const component = flattenedComponents.find(c => c.id === componentId);
    if (!component) {
      context.ui.showToast('Component not found!');
      return;
    }

    componentManager.showComponentEditor(component, async (updatedComponent) => {
      try {
        const updatedHome = await componentManager.updateComponentOnHome(updatedComponent);
        setPageStructure(updatedHome);
        context.ui.showToast('Component updated successfully!');
      } catch (error) {
        console.error("Error updating component:", error);
        context.ui.showToast('Failed to update component. Please try again.');
      }
    });
  };

  const handleDeleteComponent = async (componentId: string) => {
    try {
      const updatedHome = await componentManager.deleteComponentFromHome(componentId);
      setPageStructure(updatedHome);
      context.ui.showToast('Component deleted successfully!');
    } catch (error) {
      console.error("Error deleting component:", error);
      context.ui.showToast('Failed to delete component. Please try again.');
    }
  };

  // Component Display
  const renderComponent = (component: ComponentType) => {
    if (!component.type) {
      console.error('Component type is undefined for component:', component);
      return null;
    }

    switch (component.type) {
      case 'VStack':
        return (
            <VStackElement key={component.id} {...component}>
              {component.children?.map(renderComponent)}
            </VStackElement>
        );
      case 'HStack':
        return (
            <HStackElement key={component.id} {...component}>
              {component.children?.map(renderComponent)}
            </HStackElement>
        );
      case 'ZStack':
        return (
            <ZStackElement key={component.id} {...component}>
              {component.children?.map(renderComponent)}
            </ZStackElement>
        );
      case 'Image':
        return (<ImageElement key={component.id} {...component} />);
      case 'Text':
        return (<TextElement key={component.id} {...component} />);
      case 'Button':
        return (
            <button
                key={component.id}
                icon={component.icon}
                size={component.size}
                appearance={component.appearance}
                onPress={async () => context.ui.navigateTo(component.url)}
                {...(component.width ? { width: component.width } : {})}
                {...(component.height ? { height: component.height } : {})}
                {...(component.isGrow ? { grow: true } : {})}
            >
              {component.text}
            </button>
        );
      case 'PaginationButton':
        return (
            <button
                key={component.id}
                icon={component.icon}
                size={component.size}
                appearance={component.appearance}
                onPress={async () => navigate('pagination', { pageId: component.pageId })}
                {...(component.width ? { width: component.width } : {})}
                {...(component.height ? { height: component.height } : {})}
                {...(component.isGrow ? { grow: true } : {})}
            >
              {component.text}
            </button>
        );
      default:
        console.error('Unknown component type encountered during rendering:', component.type);
        return null;
    }
  };

  // Action handlers
  const settingsPage = () => navigate('admin');

  const addNewElement = () => {
    const selector = ComponentSelector({
      context,
      onSelect: handleAddComponent
    });
    context.ui.showForm(selector);
  };

  const editPage = () => {
    const picker = ComponentPicker({
      context,
      components: flattenedComponents,
      onSelect: handleEditComponent,
      title: 'Edit Component',
      acceptLabel: 'Edit'
    });
    context.ui.showForm(picker);
  };

  const deleteElementFromPage = () => {
    const picker = ComponentPicker({
      context,
      components: flattenedComponents,
      onSelect: (componentId) => handleDeleteComponent(componentId),
      title: 'Delete Component',
      acceptLabel: 'Delete'
    });
    context.ui.showForm(picker);
  };

  // Render the page
  return (
      <Page>
        <Page.Content navigate={navigate} showHomeButton={false}>
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
                    ></button>
                    <button
                        icon="add"
                        onPress={addNewElement}
                        appearance="primary"
                        size="small"
                    ></button>
                    <button
                        icon="edit"
                        onPress={editPage}
                        appearance="primary"
                        size="small"
                    ></button>
                    <button
                        icon="delete"
                        onPress={deleteElementFromPage}
                        appearance="primary"
                        size="small"
                    ></button>
                  </hstack>
              )}
            </hstack>
          </zstack>
          <vstack alignment="center" width={100} height={100}>
            {pageStructure.children?.map(renderComponent)}
          </vstack>
        </Page.Content>
      </Page>
  );
};