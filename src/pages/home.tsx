import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import { Schema } from '../api/Schema.js';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';
import { deepClone, randomId } from '../util.js';
import { AddComponentForm } from '../forms/AddComponentForm.js';
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

export const HomePage = async ({
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
}: PageProps): Promise<JSX.Element> => {
  const { useState } = context;
  const [pageStructure, setPageStructure] = useState<z.infer<typeof Schema['PageSchema']>>(appPost.home);

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

  const handleComponentTypeSelected = (data: { componentType: string }) => {
    const type = data.componentType;
    switch (type) {
      case 'VStack':
      case 'HStack':
      case 'ZStack':
        context.ui.showForm(StackComponentForm(context, type, (data) => handleAddComponent(type, data)));
        break;
      case 'Image':
        context.ui.showForm(ImageComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'Text':
        context.ui.showForm(TextComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'Button':
        context.ui.showForm(ButtonComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'PaginationButton':
        context.ui.showForm(PaginationButtonForm(context, (data) => handleAddComponent(type, data)));
        break;
      default:
        context.ui.showToast('Unknown component type selected');
    }
  };

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

  const handleEditComponent = (component: ComponentType) => {
    switch (component.type) {
      case 'VStack':
      case 'HStack':
      case 'ZStack':
        context.ui.showForm(StackComponentForm(context, component.type, (data) => handleUpdateComponent(component, data)));
        break;
      case 'Image':
        context.ui.showForm(ImageComponentForm(context, (data) => handleUpdateComponent(component, data)));
        break;
      case 'Text':
        context.ui.showForm(TextComponentForm(context, (data) => handleUpdateComponent(component, data)));
        break;
      case 'Button':
        context.ui.showForm(ButtonComponentForm(context, (data) => handleUpdateComponent(component, data)));
        break;
      case 'PaginationButton':
        context.ui.showForm(PaginationButtonForm(context, (data) => handleUpdateComponent(component, data)));
        break;
      default:
        context.ui.showToast('Unknown component type selected');
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
        <vstack alignment="center" lightBackgroundColor="#FFFFFF" darkBackgroundColor="#1A1A1B">
          {pageStructure.children?.map(renderComponent)}
          {isOwner && (
            <vstack gap="small" alignment="center">
              <button onPress={() => context.ui.showForm(AddComponentForm(context, handleComponentTypeSelected))} appearance="primary" size="small">Add Component</button>
              {pageStructure.children?.map((component) => (
                <button
                  key={component.id}
                  onPress={() => handleEditComponent(component)}
                  appearance="secondary"
                  size="small"
                >
                  Edit {component.type}
                </button>
              ))}
            </vstack>
          )}
        </vstack>
      </Page.Content>
    </Page>
  );
};
