import { Devvit } from '@devvit/public-api';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';
import { deepClone, randomId } from '../util.js';
import { AddComponentForm } from '../forms/AddComponentForm.js';
import { EditComponentForm } from '../forms/EditComponentForm.js';
import { DeleteComponentForm } from '../forms/DeleteComponentForm.js';
import { ImageComponentForm, ImageFormData } from '../forms/ImageComponentForm.js';
import { TextComponentForm } from '../forms/TextComponentForm.js';
import { StackComponentForm } from '../forms/StackComponentForm.js';
import { ButtonComponentForm } from '../forms/ButtonComponentForm.js';
import { PaginationButtonForm, PaginationButtonFormData } from '../forms/PaginationButtonForm.js';
import { VStackElement } from '../components/VStackElement.js';
import { HStackElement } from '../components/HStackElement.js';
import { ZStackElement } from '../components/ZStackElement.js';
import { TextElement } from '../components/TextElement.js';
import { ImageElement } from '../components/ImageElement.js';
import { EditStackComponentForm, EditStackFormData } from '../forms/EditStackComponentForm.js';
import { ComponentType, FormComponentData } from '../types/component.js';

export default Devvit;

/**
 * HomePage component that manages and renders the structure of the home page, including adding, editing, and deleting components.
 * 
 * @param {PageProps} props - The properties for the HomePage component, including navigation, context, and appPost data.
 * @returns {JSX.Element} - The rendered HomePage component.
 */
export const HomePage = ({
  navigate,
  context,
  appPost,
  isOwner,
  postMethods: {
    updateAppPost,
    addOrUpdateImageData,
    getImageDatabyComponentId,
  },
}: PageProps): JSX.Element => {
  const { useState } = context;
  const [pageStructure, setPageStructure] = useState(appPost.home);
  const [selectedComponentId, setComponentId] = useState<string | null>(null);
  const [mode, setMode] = useState<'add' | 'edit' | null>(null);
  const [stackStructure, setStackStructure] = useState(appPost.home);
  const [addedImageId, setAddedImageId] = useState<string | null>(null);

  /**
   * Processes an added image by integrating it into the page structure.
   * Image needed to be handled differently from rest of components.
   * @param {string} imageId - The ID of the added image.
   */
  const processAddedImage = async (imageId: string) => {
    const imageComponent = await getImageDatabyComponentId(imageId);
    if (imageComponent) {
      let updatedStructure = deepClone(pageStructure);

      if (selectedComponentId) {
        // Recursively add the image component to the selected stack
        const addComponentToStackRecursive = (elements: ComponentType[]): ComponentType[] => {
          return elements.map((el) => {
            if (el.id === selectedComponentId) {
              return {
                ...el,
                children: [...(el.children || []), imageComponent],
              };
            }
            if (el.children) {
              return {
                ...el,
                children: addComponentToStackRecursive(el.children),
              };
            }
            return el;
          });
        };

        updatedStructure.children = addComponentToStackRecursive(updatedStructure.children);
      } else {
        updatedStructure.children.push(imageComponent);
      }

      setPageStructure(updatedStructure);
      await updateAppPost({ home: updatedStructure });
    }
    setAddedImageId(null); // Reset the state after processing
  };

  // Handle image processing if an image is added
  if (addedImageId) {
    processAddedImage(addedImageId);
  }

  /**
   * Recursively updates a component in the page structure.
   * 
   * @param {ComponentType[]} elements - The current components in the structure.
   * @param {ComponentType} editedComponent - The component with updated data.
   * @returns {ComponentType[]} - The updated components.
   */
  const updateComponentRecursive = (elements: ComponentType[], editedComponent: ComponentType): ComponentType[] => {
    return elements.map((el) => {
      if (el.id === editedComponent.id) {
        return {
          ...el,
          ...editedComponent, // Update the found component
        };
      }
      if (el.children) {
        return {
          ...el,
          children: updateComponentRecursive(el.children, editedComponent), // Recursively update children if needed
        };
      }
      return el;
    });
  };

  /**
   * Handles the form submission for adding or editing components.
   * 
   * @param {FormComponentData} formData - The data submitted from the form.
   */
  const handleFormSubmit = async (formData: FormComponentData) => {
    try {
      if (mode === 'edit' && selectedComponentId) {
        const editedComponent: ComponentType = {
          ...formData,
          id: selectedComponentId,
        };
        const updatedStructure = deepClone(pageStructure);
        updatedStructure.children = updateComponentRecursive(updatedStructure.children, editedComponent);

        setPageStructure(updatedStructure);
        await updateAppPost({ home: updatedStructure });
        context.ui.showToast('Component updated successfully!');
      } else if (mode === 'add') {
        const newComponent: ComponentType = {
          id: `component-${randomId()}`,
          ...formData,
        };

        if ((formData as ImageFormData).type === 'Image') {
          setAddedImageId(newComponent.id);
          await addOrUpdateImageData(newComponent.id, newComponent);
        }

        const updatedStructure = deepClone(pageStructure);
        updatedStructure.children.push(newComponent);
        setPageStructure(updatedStructure);
        await updateAppPost({ home: updatedStructure });
        context.ui.showToast('Component added successfully!');
      }
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      context.ui.showToast('An error occurred while submitting the form.');
    }
  };

  /**
   * Handles the deletion of a component from the page structure.
   * 
   * @param {string} componentId - The ID of the component to delete.
   */
  const handleDeleteComponent = async (componentId: string): Promise<void> => {
    // Recursively delete the component from the structure
    const deleteComponentRecursive = (elements: ComponentType[]): ComponentType[] => {
      return elements
        .map((el) => {
          if (el.children) {
            el.children = deleteComponentRecursive(el.children); // Recursively filter children
          }
          return el;
        })
        .filter((el) => el.id !== componentId); // Remove the component with the matching ID
    };

    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children = deleteComponentRecursive(updatedStructure.children);

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });
    context.ui.showToast('Component deleted successfully!');
  };

  /**
   * Handles the submission of the Edit Stack form.
   * 
   * @param {EditStackFormData} formData - The data submitted from the Edit Stack form.
   */
  const handleEditStackFormSubmit = async (formData: EditStackFormData) => {
    const { addChild, ...restFormData } = formData;
    const selectedStackId = selectedComponentId;

    // Function to update stack properties recursively
    const updateStackPropertiesRecursive = (elements: ComponentType[]): ComponentType[] => {
      return elements.map((el) => {
        if (el.id === selectedStackId) {
          return {
            ...el,
            ...Object.fromEntries(Object.entries(restFormData).filter(([key, value]) => value !== undefined)),
            children: el.children, // Ensure children remain unchanged
          };
        }
        if (el.children) {
          return {
            ...el,
            children: updateStackPropertiesRecursive(el.children),
          };
        }
        return el;
      });
    };

    // Update the stack properties in memory
    const updatedStructure = deepClone(pageStructure);
    updatedStructure.children = updateStackPropertiesRecursive(updatedStructure.children);

    setStackStructure(updatedStructure);

    // If addChild is selected, show the corresponding form
    if (!addChild) {
      setPageStructure(updatedStructure);
      await updateAppPost({ home: updatedStructure });
      context.ui.showToast('Stack properties updated successfully!');
      return; // Exit the function to prevent further execution
    }

    // Show the form for adding a child component to the stack
    const selectedForm = addStackChildrenForms[addChild as keyof typeof addStackChildrenForms];
    if (selectedForm) {
      context.ui.showForm(selectedForm);
    } else {
      context.ui.showToast('Unknown component type selected');
    }
  };

  /**
   * Handles the addition of a child component to a stack.
   * 
   * @param {FormComponentData} formData - The data for the new child component.
   */
  const handleAddChildStackForm = async (formData: FormComponentData) => {
    const newComponent: ComponentType = {
      id: `component-${randomId()}`,
      ...formData,
    };

    if ((formData as ImageFormData).type === 'Image') {
      setAddedImageId(newComponent.id);
      await addOrUpdateImageData(newComponent.id, newComponent);
    }

    // Recursively add the new component to the selected stack
    const addComponentToStackRecursive = (elements: ComponentType[]): ComponentType[] => {
      return elements.map((el) => {
        if (el.id === selectedComponentId) {
          return {
            ...el,
            children: [...(el.children || []), newComponent],
          };
        }
        if (el.children) {
          return {
            ...el,
            children: addComponentToStackRecursive(el.children),
          };
        }
        return el;
      });
    };

    const updatedStructure = deepClone(stackStructure);
    updatedStructure.children = addComponentToStackRecursive(updatedStructure.children);

    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });

    context.ui.showToast('Child component added to stack successfully!');
  };

  /**
   * Flattens the structure of components into a single array.
   * 
   * @param {ComponentType[]} elements - The current components in the structure.
   * @returns {ComponentType[]} - The flattened array of components.
   */
  const flattenStructure = (elements: ComponentType[]): ComponentType[] => {
    let flattened: ComponentType[] = [];

    const traverse = (items: ComponentType[]) => {
      items.forEach((el) => {
        flattened.push(el);
        if (el.children) {
          traverse(el.children); // Recursively add children
        }
      });
    };

    traverse(elements);
    return flattened;
  };

  /**
   * IMPORTANT NOTE:
   * Needed to have forms defined at time of render. Instead of creating multiple forms for edit and add.
   * I created various handlers to handle the data one submitted. I'm new to typescript/app development
   * so I'm not sure if this is the most efficient way to do this. Open to suggestions and will be researching myself.
   */
  // Forms for creating stack components
  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleFormSubmit(data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleFormSubmit(data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleFormSubmit(data) }),
  };

  // Forms for creating basic components
  const componentForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
  };

  // Forms for editing stack components
  const editStackComponentForms = {
    VStack: EditStackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
    HStack: EditStackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
    ZStack: EditStackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
  };

  // Forms for adding children to stack components
  const addStackChildrenForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleAddChildStackForm(data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleAddChildStackForm(data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleAddChildStackForm(data) }),
  };

  // Form for adding a new component
  const addComponentForm = AddComponentForm({
    context,
    onSubmit: (data) => {
      const selectedForm = componentForms[data.componentType as keyof typeof componentForms];
      setMode('add');
      if (selectedForm) {
        context.ui.showForm(selectedForm);
      } else if (data.componentType in stackComponentForms) {
        context.ui.showForm(stackComponentForms[data.componentType as keyof typeof stackComponentForms]);
      } else {
        context.ui.showToast('Unknown component type selected');
      }
    },
  });

  // Form for editing an existing component
  const editComponentForm = EditComponentForm({
    context,
    components: flattenStructure(pageStructure.children),
    onSubmit: (data: { selectedComponent: string | string[] }) => {
      const selectedComponent = data.selectedComponent as string | string[];
      const [componentType, componentId] = Array.isArray(selectedComponent)
        ? selectedComponent[0].split(':')
        : selectedComponent.split(':');
      setMode('edit');
      setComponentId(componentId);

      const selectedForm = componentForms[componentType as keyof typeof componentForms];
      if (selectedForm) {
        context.ui.showForm(selectedForm);
      } else if (componentType in editStackComponentForms) {
        context.ui.showForm(editStackComponentForms[componentType as keyof typeof editStackComponentForms]);
      } else {
        context.ui.showToast('Unknown component type selected');
      }
    },
  });

  // Form for deleting an existing component
  const deleteComponentForm = DeleteComponentForm({
    context,
    components: flattenStructure(pageStructure.children),
    onSubmit: (data) => handleDeleteComponent(data.componentId),
  });

  /**
   * Renders a component based on its type.
   * 
   * @param {ComponentType} component - The component to render.
   * @returns {JSX.Element | null} - The rendered component or null if the type is unknown.
   */
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
      default:
        console.error('Unknown component type encountered during rendering:', component.type);
        return null;
    }
  };

  // Navigation handlers for settings and editing
  const settingsPage: Devvit.Blocks.OnPressEventHandler = () => navigate('admin');
  const addNewElement: Devvit.Blocks.OnPressEventHandler = () => context.ui.showForm(addComponentForm);
  const editPage: Devvit.Blocks.OnPressEventHandler = () => context.ui.showForm(editComponentForm);
  const deleteElementFromPage: Devvit.Blocks.OnPressEventHandler = () => context.ui.showForm(deleteComponentForm);

  // Render the HomePage
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
                <button icon="add" onPress={addNewElement} appearance="primary" size="small"></button>
                <button icon="edit" onPress={editPage} appearance="primary" size="small"></button>
                <button icon="delete" onPress={deleteElementFromPage} appearance="primary" size="small"></button>
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
