import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import { Schema } from '../api/Schema.js';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';
import { deepClone, randomId } from '../util.js';
import { AddComponentForm } from '../forms/AddComponentForm.js';
import { EditComponentForm } from '../forms/EditComponentForm.js';
import { ImageComponentForm } from '../forms/ImageComponentForm.js';
import { TextComponentForm } from '../forms/TextComponentForm.js';
import { StackComponentForm } from '../forms/StackComponentForm.js';
import { ButtonComponentForm } from '../forms/ButtonComponentForm.js';
import { PaginationButtonForm } from '../forms/PaginationButtonForm.js';
import { VStackElement } from '../components/VStackElement.js';
import { HStackElement } from '../components/HStackElement.js';
import { ZStackElement } from '../components/ZStackElement.js';
import { TextElement } from '../components/TextElement.js';
import { ImageElement } from '../components/ImageElement.js';

export default Devvit;

type ComponentType = z.infer<typeof Schema.ElementSchema>;

export const HomePage = ({
  navigate,
  context,
  appPost,
  isOwner,
  currentUserUsername,
  postMethods: {
    updateAppPost, updateAppElement,
    addElement, clonePost,
    deleteNode, readWholePage
  },
}: PageProps): JSX.Element => {
  const { useState } = context;
  const [pageStructure, setPageStructure] = useState<z.infer<typeof Schema['HomeSchema']>>(appPost.home);

  console.log("Initial page structure:", pageStructure);

  // Prepare forms outside of event handlers
  const addComponentForm = AddComponentForm({ context, onSubmit: handleComponentTypeSelected });

  // Stack component forms initialized at the top
  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleAddComponent('VStack', data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleAddComponent('HStack', data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleAddComponent('ZStack', data) }),
  };

  const imageComponentForm = ImageComponentForm({ context, onSubmit: (data) => handleAddComponent('Image', data) });
  const textComponentForm = TextComponentForm({ context, onSubmit: (data) => handleAddComponent('Text', data) });
  const buttonComponentForm = ButtonComponentForm({ context, onSubmit: (data) => handleAddComponent('Button', data) });
  const paginationButtonForm = PaginationButtonForm({ context, onSubmit: (data) => handleAddComponent('PaginationButton', data) });

  // Handle adding a new component to the page
  const handleAddComponent = async (type: string, data: any) => {
    const newComponent: ComponentType = {
      id: `component-${randomId()}`,
      type,
      ...(type === 'VStack' || type === 'HStack' || type === 'ZStack' ? { children: [] } : {}),
      ...data,
    };

    console.log("Adding new component:", newComponent);

    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children.push(newComponent);

    console.log("Updated structure after adding component:", updatedStructure);

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });

    context.ui.showToast('Component added successfully!');
  };

  // Handle editing a component on the page
  // TODO: Editing this to work properly. I like my implementation. Since updateAppElemnet returns the page
  const handleEditComponent = async ({ componentType, componentId }: { componentType: string; componentId: string }): Promise<void> => {
    console.log("Editing component:", { componentType, componentId });

    // Function to handle the form submission and capture the updated component data
    const handleFormSubmit = async (formData: any) => {
        console.log("Form data submitted:", formData);

        // Ensure the component is correctly formed before updating
        const editedComponent: ComponentType = {
            ...formData,
            id: componentId, // Ensure the correct id is set
            type: componentType,
            ...(componentType === 'VStack' || componentType === 'HStack' || componentType === 'ZStack'
                ? { children: formData.children || [] }
                : {}),
        };

        // Update the structure and refresh the state
        const updatedStructure = await updateAppElement('home', editedComponent.id, editedComponent);

        console.log("Updated structure after editing component:", updatedStructure);

        setPageStructure(updatedStructure);

        context.ui.showToast('Component updated successfully!');
    };

    // Display the appropriate form based on the selected component type
    switch (componentType) {
        case 'VStack':
        case 'HStack':
        case 'ZStack':
            context.ui.showForm(StackComponentForm({ context, type: componentType, onSubmit: handleFormSubmit }));
            break;
        case 'Image':
            context.ui.showForm(ImageComponentForm({ context, onSubmit: handleFormSubmit }));
            break;
        case 'Text':
            context.ui.showForm(TextComponentForm({ context, onSubmit: handleFormSubmit }));
            break;
        case 'Button':
            context.ui.showForm(ButtonComponentForm({ context, onSubmit: handleFormSubmit }));
            break;
        case 'PaginationButton':
            context.ui.showForm(PaginationButtonForm({ context, onSubmit: handleFormSubmit }));
            break;
        default:
            context.ui.showToast('Unknown component type selected');
            console.error("Unknown component type:", componentType);
            return;
    }
};



  // Handle deleting a component from the page
  const handleDeleteComponent = async (componentId: string): Promise<void> => {
    console.log("Deleting component with ID:", componentId);

    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children = updatedStructure.children.filter(child => child.id !== componentId);

    console.log("Updated structure after deleting component:", updatedStructure);

    setPageStructure(updatedStructure);
    await deleteNode('home', componentId);

    context.ui.showToast('Component deleted successfully!');
  };

  // Component to edit elements
  const editComponentForm = EditComponentForm({
    context,
    components: pageStructure.children,
    onSubmit: handleEditComponent,
  });

  function handleComponentTypeSelected(data: { componentType: string }) {
    const type = data.componentType;
    console.log("Component type selected:", type);

    switch (type) {
      case 'VStack':
      case 'HStack':
      case 'ZStack':
        context.ui.showForm(stackComponentForms[type]);
        break;
      case 'Image':
        context.ui.showForm(imageComponentForm);
        break;
      case 'Text':
        context.ui.showForm(textComponentForm);
        break;
      case 'Button':
        context.ui.showForm(buttonComponentForm);
        break;
      case 'PaginationButton':
        context.ui.showForm(paginationButtonForm);
        break;
      default:
        console.error("Unknown component type selected:", type);
        context.ui.showToast('Unknown component type selected');
    }
  }

  const renderComponent = (component: ComponentType) => {
    console.log("Rendering component:", component);
    
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
        return <ImageElement key={component.id} {...component} />;
      case 'Text':
        return <TextElement key={component.id} {...component} />;
      case 'Button':
        return (
          <button
            key={component.id}
            icon={component.icon}
            size={component.size}
            appearance={component.appearance}
            onPress={async () => {
              context.ui.navigateTo(component.url);
            }}
            {...(component.width ? { width: component.width } : {})}
            {...(component.height ? { height: component.height } : {})}
            {...(component.isGrow ? { grow: true } : {})}
          >
            {component.text}
          </button>
        );
      default:
        console.error("Unknown component type encountered during rendering:", component.type);
        return null;
    }
  };
  const settingsPage: Devvit.Blocks.OnPressEventHandler = async () => {
    navigate('admin');
  };

  const addNewElement: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(addComponentForm);
  }
  const editPage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(editComponentForm);
  }
  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={false}>
        <zstack width={100} alignment="middle">
          <hstack width={100} alignment="center middle">
            {isOwner && (
              <hstack gap="small" alignment="start">
                <hstack >
                <button onPress={settingsPage} icon="settings" size="small" textColor="green" appearance="primary"></button>
                </hstack>
                <hstack>
                  <button icon="add" onPress={addNewElement} appearance="primary" size="small"></button>
                </hstack>
                <hstack>
                  <button icon="edit" onPress={editPage} appearance="primary" size="small"></button>
                </hstack>
              </hstack>
            )}
          </hstack>
        </zstack>
        <vstack alignment="center">
          {pageStructure.children?.map(renderComponent)}
        </vstack>
      </Page.Content>
    </Page>
  );
};
