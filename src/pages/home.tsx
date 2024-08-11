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
  const [pageStructure, setPageStructure] = useState(appPost.home);

  // Logging for debugging purposes
  console.log("Initial page structure:", pageStructure);

  // Define forms outside of event handlers to avoid re-defining them on every render
  const addComponentForm = AddComponentForm({ context, onSubmit: handleComponentTypeSelected });

  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleAddComponent('VStack', data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleAddComponent('HStack', data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleAddComponent('ZStack', data) }),
  };

  const componentForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleAddComponent('Image', data) }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleAddComponent('Text', data) }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleAddComponent('Button', data) }),
    PaginationButton: PaginationButtonForm({ context, onSubmit: (data) => handleAddComponent('PaginationButton', data) }),
  };

  const handleAddComponent = async (type: string, data: any) => {
    const newComponent: ComponentType = {
      id: `component-${randomId()}`,
      type,
      ...(type === 'VStack' || type === 'HStack' || type === 'ZStack' ? { children: [] } : {}),
      ...data,
    };

    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children.push(newComponent);

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });

    context.ui.showToast('Component added successfully!');
  };

  const handleEditComponent = async ({ componentType, componentId }: { componentType: string; componentId: string }): Promise<void> => {
    const handleFormSubmit = async (formData: any) => {
      const editedComponent: ComponentType = {
        ...formData,
        id: componentId,
        type: componentType,
        ...(componentType === 'VStack' || componentType === 'HStack' || componentType === 'ZStack'
          ? { children: formData.children || [] }
          : {}),
      };

      const updatedStructure = await updateAppElement('home', editedComponent.id, editedComponent);

      setPageStructure(updatedStructure);
      context.ui.showToast('Component updated successfully!');
    };

    if (componentType in stackComponentForms) {
      context.ui.showForm(stackComponentForms[componentType as keyof typeof stackComponentForms]);
    } else if (componentType in componentForms) {
      context.ui.showForm(componentForms[componentType as keyof typeof componentForms]);
    } else {
      context.ui.showToast('Unknown component type selected');
      console.error("Unknown component type:", componentType);
    }
  };

  const handleDeleteComponent = async (componentId: string): Promise<void> => {
    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children = updatedStructure.children.filter(child => child.id !== componentId);

    setPageStructure(updatedStructure);
    await deleteNode('home', componentId);

    context.ui.showToast('Component deleted successfully!');
  };

  const editComponentForm = EditComponentForm({
    context,
    components: pageStructure.children,
    onSubmit: handleEditComponent,
  });

  function handleComponentTypeSelected(data: { componentType: string }) {
    const type = data.componentType;

    if (type in stackComponentForms) {
      context.ui.showForm(stackComponentForms[type as keyof typeof stackComponentForms]);
    } else if (type in componentForms) {
      context.ui.showForm(componentForms[type as keyof typeof componentForms]);
    } else {
      context.ui.showToast('Unknown component type selected');
      console.error("Unknown component type selected:", type);
    }
  }

  const renderComponent = (component: ComponentType) => {
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
            onPress={async () => context.ui.navigateTo(component.url)}
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

  const settingsPage: Devvit.Blocks.OnPressEventHandler = () => navigate('admin');
  const addNewElement: Devvit.Blocks.OnPressEventHandler = () => context.ui.showForm(addComponentForm);
  const editPage: Devvit.Blocks.OnPressEventHandler = () => context.ui.showForm(editComponentForm);

  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={false}>
        <zstack width={100} alignment="middle">
          <hstack width={100} alignment="center middle">
            {isOwner && (
              <hstack gap="small" alignment="start">
                <button onPress={settingsPage} icon="settings" size="small" textColor="green" appearance="primary"></button>
                <button icon="add" onPress={addNewElement} appearance="primary" size="small"></button>
                <button icon="edit" onPress={editPage} appearance="primary" size="small"></button>
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
