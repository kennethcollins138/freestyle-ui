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
// import { PaginationButton, PaginationButtonElement } from '../components/PaginationButton.js';

export default Devvit;

export const HomePage = ({
  navigate,
  context,
  appPost,
  isOwner,
  postMethods: {
    updateAppPost,
    deleteNode,
    createNewPage,
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

  const processAddedImage = async (imageId: string) => {
    const imageComponent = await getImageDatabyComponentId(imageId);
    if (imageComponent) {
      let updatedStructure = deepClone(pageStructure);

      if (selectedComponentId) {
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

        if ((formData as PaginationButtonFormData).type === 'PaginationButton') {
          const newPageId = (formData as PaginationButtonFormData).pageId;
          const basePage = {
            id: newPageId,
            light: '#FFFFFF',
            dark: '#1A1A1B',
            children: [],
          };

          const updatedAppInstance = deepClone(appPost);
          updatedAppInstance.home.children.push(newComponent);

          if (!updatedAppInstance.pages[newPageId]) {
            updatedAppInstance.pages[newPageId] = basePage;
          } else {
            console.error('Page ID already exists:', newPageId);
          }

          setPageStructure(updatedAppInstance.home);
          await updateAppPost(updatedAppInstance);
          context.ui.showToast('Pagination button and new page created successfully!');
          return;
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
  



const handleDeleteComponent = async (componentId: string): Promise<void> => {
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

  // If addChild is selected, show the corresponding form
  const selectedForm = addStackChildrenForms[addChild as keyof typeof addStackChildrenForms];
  if (selectedForm) {
    context.ui.showForm(selectedForm);
  } else {
    context.ui.showToast('Unknown component type selected');
  }
};


  const handleAddChildStackForm = async (formData: FormComponentData) => {
    if ((formData as PaginationButtonFormData).type === 'PaginationButton') {
      const newPageId = (formData as PaginationButtonFormData).pageId;
      await createNewPage(newPageId);
    }
  
    const newComponent: ComponentType = {
      id: `component-${randomId()}`,
      ...formData,
    };
    
    if ((formData as ImageFormData).type === 'Image') {
      setAddedImageId(newComponent.id);
      await addOrUpdateImageData(newComponent.id, newComponent);
    }

    console.log("Selected Stack ID:", selectedComponentId);
    console.log("New Component to Add:", newComponent);
  
    const addComponentToStackRecursive = (elements: ComponentType[]): ComponentType[] => {
      return elements.map((el) => {
        if (el.id === selectedComponentId) {
          console.log("Found matching stack:", el);
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
  
    console.log("Updated Structure after adding child:", updatedStructure);
  
    setPageStructure(updatedStructure);
    await updateAppPost({ home: updatedStructure });
  
    context.ui.showToast('Child component added to stack successfully!');
  };
  
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

  const stackComponentForms = {
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleFormSubmit(data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleFormSubmit(data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleFormSubmit(data) }),
  };

  const componentForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
    PaginationButton: PaginationButtonForm({ context, onSubmit: (data) => handleFormSubmit(data) }),
  };

  const editStackComponentForms = {
    VStack: EditStackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
    HStack: EditStackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
    ZStack: EditStackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleEditStackFormSubmit(data) }),
  };

  const addStackChildrenForms = {
    Image: ImageComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    Text: TextComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    Button: ButtonComponentForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    PaginationButton: PaginationButtonForm({ context, onSubmit: (data) => handleAddChildStackForm(data) }),
    VStack: StackComponentForm({ context, type: 'VStack', onSubmit: (data) => handleAddChildStackForm(data) }),
    HStack: StackComponentForm({ context, type: 'HStack', onSubmit: (data) => handleAddChildStackForm(data) }),
    ZStack: StackComponentForm({ context, type: 'ZStack', onSubmit: (data) => handleAddChildStackForm(data) }),
  };

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

  const deleteComponentForm = DeleteComponentForm({
    context,
    components: flattenStructure(pageStructure.children),
    onSubmit: (data) => handleDeleteComponent(data.componentId),
  });

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
        console.log("Rendering Image Component:", {
          id: component.id,
          url: component.url,
          width: component.width,
          height: component.height,
          resizeMode: component.resizeMode,
          imageWidth: component.imageWidth,
          imageHeight: component.imageHeight
      });
        return (<ImageElement key={component.id} {...component} />);
      case 'Text':
        return (<TextElement key={component.id} {...component} />);
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

  const settingsPage: Devvit.Blocks.OnPressEventHandler = () => navigate('admin');

  const addNewElement: Devvit.Blocks.OnPressEventHandler = () => {
    context.ui.showForm(addComponentForm);
  };

  const editPage: Devvit.Blocks.OnPressEventHandler = () => {
    context.ui.showForm(editComponentForm);
  };

  const deleteElementFromPage: Devvit.Blocks.OnPressEventHandler = () => {
    context.ui.showForm(deleteComponentForm);
  };

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
