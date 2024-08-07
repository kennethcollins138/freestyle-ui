import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import type { Schema } from '../api/Schema.js';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';
import { deepClone, randomId } from '../util.js';
import { AddComponentForm } from '../forms/AddComponentForm';
import { ImageComponentForm } from '../forms/ImageComponentForm';
import { TextComponentForm } from '../forms/TextComponentForm';
import { StackComponentForm } from '../forms/StackComponentForm';
import { ButtonComponentForm } from '../forms/ButtonComponentForm';
import { PaginationButtonForm } from '../forms/PaginationButtonForm';

export default Devvit;

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
  const [pageStructure, setPageStructure] = useState(appPost.home);

  const handleAddComponent = async (type: string, data: any) => {
    const newComponent = {
      id: `component-${randomId()}`,
      type,
      children: [],
      ...data,
    };

    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children.push(newComponent);

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });

    context.ui.showToast('Component added successfully!');
  };

  const handleComponentTypeSelected = (type: string) => {
    switch (type) {
      case 'vstack':
      case 'hstack':
      case 'zstack':
        context.ui.showForm(StackComponentForm(context, type, (data) => handleAddComponent(type, data)));
        break;
      case 'image':
        context.ui.showForm(ImageComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'text':
        context.ui.showForm(TextComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'linkbutton':
        context.ui.showForm(ButtonComponentForm(context, (data) => handleAddComponent(type, data)));
        break;
      case 'paginationbutton':
        context.ui.showForm(PaginationButtonForm(context, (data) => handleAddComponent(type, data)));
        break;
      default:
        context.ui.showToast('Unknown component type selected');
    }
  };

  const renderComponent = (component) => {
    switch (component.type) {
      case 'vstack':
        return <vstack>{component.children.map(renderComponent)}</vstack>;
      case 'hstack':
        return <hstack>{component.children.map(renderComponent)}</hstack>;
      case 'zstack':
        return <zstack>{component.children.map(renderComponent)}</zstack>;
      case 'image':
        return <image url={component.url} width={component.width} height={component.height} resizeMode={component.resizeMode} />;
      case 'text':
        return <text size={component.size} color={component.color}>{component.text}</text>;
      case 'linkbutton':
        return <button url={component.url}>{component.text}</button>;
      default:
        return null;
    }
  };

  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={false}>
        <vstack alignment="center" lightBackgroundColor="#FFFFFF" darkBackgroundColor="#1A1A1B">
          {pageStructure.children.map(renderComponent)}
          {isOwner && (
            <vstack gap="small" alignment="center">
              <button onPress={() => context.ui.showForm(AddComponentForm(context, handleComponentTypeSelected))} appearance="primary" size="small">Add Component</button>
              {pageStructure.children.map((component) => (
                <button onPress={() => context.ui.showForm(editComponentForm, component)} appearance="secondary" size="small" key={component.id}>Edit {component.type}</button>
              ))}
            </vstack>
          )}
        </vstack>
      </Page.Content>
    </Page>
  );
};
