import { Devvit } from '@devvit/public-api';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';
import { deepClone, randomId } from '../util.js';
import { AddComponentForm } from '../forms/AddComponentForm.js';
import { EditComponentForm } from '../forms/EditComponentForm.js';
import { ImageComponentForm, ImageFormData } from '../forms/ImageComponentForm.js';
import { TextComponentForm, TextFormData } from '../forms/TextComponentForm.js';
import { StackComponentForm, StackFormData } from '../forms/StackComponentForm.js';
import { ButtonComponentForm, ButtonFormData } from '../forms/ButtonComponentForm.js';
import { PaginationButtonForm, PaginationButtonFormData } from '../forms/PaginationButtonForm.js';
import { VStackElement } from '../components/VStackElement.js';
import { HStackElement } from '../components/HStackElement.js';
import { ZStackElement } from '../components/ZStackElement.js';
import { TextElement } from '../components/TextElement.js';
import { ImageElement } from '../components/ImageElement.js';
import { ComponentType, FormComponentData } from '../types/component.js';

export default Devvit;

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

  const handleFormSubmit = async (
    formData: FormComponentData, 
    mode: 'edit' | 'add', 
    componentType?: string, 
    componentId?: string
  ) => {
    console.log("Form submission data:", formData, "Mode:", mode, "Component Type:", componentType);

    if (mode === 'edit' && componentType && componentId) {
      const editedComponent: ComponentType = {
        ...formData,
        id: componentId,
      };

      const updatedStructure = await updateAppElement('home', editedComponent.id, editedComponent);
      setPageStructure(updatedStructure);
      context.ui.showToast('Component updated successfully!');
    } else if (mode === 'add') {
      const newComponent: ComponentType = {
        id: `component-${randomId()}`,
        ...formData,
      };

      const updatedStructure = deepClone(pageStructure);
      updatedStructure.children.push(newComponent);
      setPageStructure(updatedStructure);
      await updateAppPost({ home: updatedStructure });
      context.ui.showToast('Component added successfully!');
    }
  };

  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleFormSubmit(data, 'add') }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleFormSubmit(data, 'add') }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleFormSubmit(data, 'add') }),
  };

  const componentForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleFormSubmit(data, 'add') }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleFormSubmit(data, 'add') }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleFormSubmit(data, 'add') }),
    PaginationButton: PaginationButtonForm({ context, onSubmit: (data) => handleFormSubmit(data, 'add') }),
  };

  const addComponentForm = AddComponentForm({ 
    context, 
    onSubmit: (data) => {
      const selectedForm = componentForms[data.componentType as keyof typeof componentForms];
      if (selectedForm) {
        context.ui.showForm(selectedForm);
      } else if (data.componentType in stackComponentForms) {
        context.ui.showForm(stackComponentForms[data.componentType as keyof typeof stackComponentForms]);
      } else {
        context.ui.showToast('Unknown component type selected');
      }
    }
  });

  const editComponentForm = EditComponentForm({
    context,
    components: pageStructure.children,
    onSubmit: (data) => {
      const selectedForm = componentForms[data.componentType as keyof typeof componentForms];
      if (selectedForm) {
        context.ui.showForm(selectedForm, data); // passing data to be used in the form
      } else if (data.componentType in stackComponentForms) {
        context.ui.showForm(stackComponentForms[data.componentType as keyof typeof stackComponentForms], data);
      } else {
        context.ui.showToast('Unknown component type selected');
      }
    },
  });

  const handleDeleteComponent = async (componentId: string): Promise<void> => {
    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children = updatedStructure.children.filter(child => child.id !== componentId);

    setPageStructure(updatedStructure);
    await deleteNode('home', componentId);
    context.ui.showToast('Component deleted successfully!');
  };

  const renderComponent = (component: ComponentType) => {
    console.log("Rendering component:", component);
    if (!component.type) {
      console.error("Component type is undefined for component:", component);
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

  const addNewElement: Devvit.Blocks.OnPressEventHandler = () => {
    context.ui.showForm(addComponentForm);
  };

  const editPage: Devvit.Blocks.OnPressEventHandler = () => {
    context.ui.showForm(editComponentForm);
  };

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
