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

  // Prepare forms outside of event handlers
  const addComponentForm = AddComponentForm({ context, onSubmit: handleComponentTypeSelected });

  const handleEditComponent = (component: ComponentType) => {
    const formKey = EditComponentForm({
      context,
      element: component,
      onUpdate: async (updatedComponent) => {
        const updatedStructure = deepClone(pageStructure);
        const index = updatedStructure.children.findIndex(child => child.id === component.id);
        if (index !== -1) {
          updatedStructure.children[index] = updatedComponent;
        }
        setPageStructure(updatedStructure);
        await updateAppPost({ home: updatedStructure });
        context.ui.showToast('Component updated successfully!');
      },
      onDelete: async () => {
        const updatedStructure = deepClone(pageStructure);
        const index = updatedStructure.children.findIndex(child => child.id === component.id);
        if (index !== -1) {
          updatedStructure.children.splice(index, 1);
        }
        setPageStructure(updatedStructure);
        await updateAppPost({ home: updatedStructure });
        context.ui.showToast('Component deleted successfully!');
      },
    });

    if (formKey) {
      context.ui.showForm(formKey);
    } else {
      context.ui.showToast('Could not open the edit form');
    }
  };


  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleAddComponent('VStack', data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleAddComponent('HStack', data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleAddComponent('ZStack', data) }),
  };

  const imageComponentForm = ImageComponentForm({ context, onSubmit: (data) => handleAddComponent('Image', data) });
  const textComponentForm = TextComponentForm({ context, onSubmit: (data) => handleAddComponent('Text', data) });
  const buttonComponentForm = ButtonComponentForm({ context, onSubmit: (data) => handleAddComponent('Button', data) });
  const paginationButtonForm = PaginationButtonForm({ context, onSubmit: (data) => handleAddComponent('PaginationButton', data) });

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

  function handleComponentTypeSelected(data: { componentType: string }) {
    const type = data.componentType;
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
        context.ui.showToast('Unknown component type selected');
    }
  }

  const renderComponent = (component: ComponentType) => {
    switch (component.type) {
      case 'VStack':
        return <VStackElement key={component.id} {...component}>{component.children?.map(renderComponent)}</VStackElement>;
      case 'HStack':
        return <HStackElement key={component.id} {...component}>{component.children?.map(renderComponent)}</HStackElement>;
      case 'ZStack':
        return <ZStackElement key={component.id} {...component}>{component.children?.map(renderComponent)}</ZStackElement>;
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
        return null;
    }
  };

  const handleUpdateComponent = async (component: ComponentType, data: any) => {
    const updatedStructure = deepClone(pageStructure);
    const index = updatedStructure.children.findIndex(child => child.id === component.id);
    if (index !== -1) {
      updatedStructure.children[index] = { ...component, ...data };
    }

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });

    context.ui.showToast('Component updated successfully!');
  };

  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={false}>
        <zstack alignment="center top">
          {isOwner && (
            <hstack gap="small" alignment="center top">
              <button icon="add" onPress={() => context.ui.showForm(addComponentForm)} appearance="primary" size="small"></button>
              <spacer size='medium'></spacer>
              <button icon="edit" onPress={() => handleEditComponent(pageStructure)} appearance="secondary" size="small"></button>
            </hstack>
          )}
        </zstack>
        <vstack alignment="center" lightBackgroundColor={pageStructure.light} darkBackgroundColor={pageStructure.dark || pageStructure.light}>
          {pageStructure.children?.map(renderComponent)}
        </vstack>
      </Page.Content>
    </Page>
  );
};
