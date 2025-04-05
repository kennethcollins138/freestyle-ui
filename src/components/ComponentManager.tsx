import { Devvit } from "@devvit/public-api";
import {
  Schema,
  ElementSchema,
  HomeSchema,
  PageSchema,
} from "../api/Schema.js";
import { AppController } from "../api/AppController.js";
import { deepClone, randomId } from "../util.js";
import { getComponentEditor } from "./editors/ComponentEditorFactory.js";

export class ComponentManager {
  private readonly context: Devvit.Context;
  private appController: AppController;

  constructor(context: Devvit.Context, postId: string) {
    this.context = context;
    this.appController = new AppController(postId, context);
  }

  /**
   * Flattens a nested component structure for easier component selection
   */
  flattenStructure(elements: ElementSchema[]): ElementSchema[] {
    const flattened: ElementSchema[] = [];

    const traverse = (items: ElementSchema[]) => {
      items.forEach((el) => {
        flattened.push(el);
        if (el.children && el.children.length > 0) {
          traverse(el.children);
        }
      });
    };

    traverse(elements);
    return flattened;
  }

  /**
   * Updates a component in a nested structure
   */
  updateComponentRecursive(
    elements: ElementSchema[],
    editedComponent: ElementSchema,
  ): ElementSchema[] {
    return elements.map((el) => {
      if (el.id === editedComponent.id) {
        // Preserve children if they exist in the original element but not in the edited one
        if (el.children && !editedComponent.children) {
          return {
            ...editedComponent,
            children: el.children,
          };
        }
        return editedComponent;
      }
      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: this.updateComponentRecursive(el.children, editedComponent),
        };
      }
      return el;
    });
  }

  /**
   * Deletes a component from a nested structure
   */
  deleteComponentRecursive(
    elements: ElementSchema[],
    componentId: string,
  ): ElementSchema[] {
    return elements
      .map((el) => {
        if (el.children && el.children.length > 0) {
          el.children = this.deleteComponentRecursive(el.children, componentId);
        }
        return el;
      })
      .filter((el) => el.id !== componentId);
  }

  /**
   * Adds a component to a parent component in a nested structure
   */
  addComponentToParentRecursive(
    elements: ElementSchema[],
    parentId: string,
    newComponent: ElementSchema,
  ): ElementSchema[] {
    return elements.map((el) => {
      if (el.id === parentId) {
        return {
          ...el,
          children: [...(el.children || []), newComponent],
        };
      }
      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: this.addComponentToParentRecursive(
            el.children,
            parentId,
            newComponent,
          ),
        };
      }
      return el;
    });
  }

  /**
   * Generates a new unique component ID
   */
  generateComponentId(prefix = "component"): string {
    return `${prefix}-${randomId()}`;
  }

  /**
   * Finds a component by ID in a nested structure
   */
  findComponentById(
    elements: ElementSchema[],
    componentId: string,
  ): ElementSchema | undefined {
    for (const element of elements) {
      if (element.id === componentId) {
        return element;
      }
      if (element.children && element.children.length > 0) {
        const found = this.findComponentById(element.children, componentId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  /**
   * Show the component editor form for creating a new component
   * @param componentType The type of component to create
   * @param onSave Callback for when the component is saved
   */
  showComponentCreator(
    componentType: string,
    onSave?: (component: ElementSchema) => void,
  ) {
    const editor = getComponentEditor(
      this.context,
      componentType,
      undefined,
      async (formData) => {
        let newComponent: ElementSchema;

        switch (componentType) {
          case "Text":
            newComponent = Schema.TextElementSchema.parse({
              id: this.generateComponentId("text"),
              ...formData,
            });
            break;
          case "Button":
            newComponent = Schema.ButtonElementSchema.parse({
              id: this.generateComponentId("button"),
              ...formData,
            });
            break;
          case "Image":
            newComponent = Schema.ImageElementSchema.parse({
              id: this.generateComponentId("image"),
              ...formData,
            });
            // Handle image uploads specially
            await this.appController.addOrUpdateImageData(
              newComponent.id,
              newComponent,
            );
            break;
          case "VStack":
            newComponent = Schema.VStackSchema.parse({
              id: this.generateComponentId("vstack"),
              ...formData,
              children: [],
            });
            break;
          case "HStack":
            newComponent = Schema.HStackSchema.parse({
              id: this.generateComponentId("hstack"),
              ...formData,
              children: [],
            });
            break;
          case "ZStack":
            newComponent = Schema.ZStackSchema.parse({
              id: this.generateComponentId("zstack"),
              ...formData,
              children: [],
            });
            break;
          case "PaginationButton":
            newComponent = Schema.ButtonElementSchema.parse({
              id: this.generateComponentId("pagebutton"),
              ...formData,
            });
            break;
          case "PersonalPlug":
            newComponent = Schema.PersonalPlugSchema.parse({
              id: this.generateComponentId("plug"),
              content: "Created by /u/TheRepDeveloper",
              ...formData,
            });
            break;
          default:
            console.error("Unknown component type:", componentType);
            this.context.ui.showToast(
              `Unknown component type: ${componentType}`,
            );
            return;
        }

        if (onSave) {
          onSave(newComponent);
        }
      },
    );

    this.context.ui.showForm(editor);
  }

  /**
   * Show the component editor form for editing an existing component
   * @param component The component to edit
   * @param onSave Callback for when the component is saved
   */
  showComponentEditor(
    component: ElementSchema,
    onSave?: (component: ElementSchema) => void,
  ) {
    const editor = getComponentEditor(
      this.context,
      component.type,
      component,
      async (formData) => {
        let editedComponent: ElementSchema;

        // Preserve the component ID and children
        const baseComponent = {
          id: component.id,
          children: component.children,
        };

        switch (component.type) {
          case "Text":
            editedComponent = Schema.TextElementSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "Button":
            editedComponent = Schema.ButtonElementSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "Image":
            editedComponent = Schema.ImageElementSchema.parse({
              ...baseComponent,
              ...formData,
            });
            // Handle image uploads specially
            await this.appController.addOrUpdateImageData(
              editedComponent.id,
              editedComponent,
            );
            break;
          case "VStack":
            editedComponent = Schema.VStackSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "HStack":
            editedComponent = Schema.HStackSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "ZStack":
            editedComponent = Schema.ZStackSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "PaginationButton":
            editedComponent = Schema.ButtonElementSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          case "PersonalPlug":
            editedComponent = Schema.PersonalPlugSchema.parse({
              ...baseComponent,
              ...formData,
            });
            break;
          default:
            console.error("Unknown component type:", component.type);
            this.context.ui.showToast(
              `Unknown component type: ${component.type}`,
            );
            return;
        }

        if (onSave) {
          onSave(editedComponent);
        }
      },
    );

    this.context.ui.showForm(editor);
  }

  /**
   * Add a component to the home page
   * @param component The component to add
   * @returns Promise resolving to the updated home page structure
   */
  async addComponentToHome(component: ElementSchema): Promise<HomeSchema> {
    const home = await this.appController.readWholePage("home");
    if (!home) {
      throw new Error("Home page not found");
    }

    const updatedHome = deepClone(home) as HomeSchema;
    updatedHome.children.push(component);
    await this.appController.updateAppInstance({ home: updatedHome });

    return updatedHome;
  }

  /**
   * Update a component on the home page
   * @param component The component with updated values
   * @returns Promise resolving to the updated home page structure
   */
  async updateComponentOnHome(component: ElementSchema): Promise<HomeSchema> {
    const home = await this.appController.readWholePage("home");
    if (!home) {
      throw new Error("Home page not found");
    }

    const updatedHome = deepClone(home) as HomeSchema;
    updatedHome.children = this.updateComponentRecursive(
      updatedHome.children,
      component,
    );
    await this.appController.updateAppInstance({ home: updatedHome });

    return updatedHome;
  }

  /**
   * Delete a component from the home page
   * @param componentId The ID of the component to delete
   * @returns Promise resolving to the updated home page structure
   */
  async deleteComponentFromHome(componentId: string): Promise<HomeSchema> {
    const home = await this.appController.readWholePage("home");
    if (!home) {
      throw new Error("Home page not found");
    }

    const updatedHome = deepClone(home) as HomeSchema;
    updatedHome.children = this.deleteComponentRecursive(
      updatedHome.children,
      componentId,
    );
    await this.appController.updateAppInstance({ home: updatedHome });

    return updatedHome;
  }

  /**
   * Add a component to a specific page
   * @param pageId The ID of the page to add the component to
   * @param component The component to add
   * @returns Promise resolving to the updated page structure
   */
  async addComponentToPage(
    pageId: string,
    component: ElementSchema,
  ): Promise<PageSchema | HomeSchema> {
    if (pageId === "home") {
      return this.addComponentToHome(component);
    }

    const page = await this.appController.loadPage(pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }

    const updatedPage = deepClone(page) as PageSchema;
    updatedPage.children.push(component);
    await this.appController.savePage(pageId, updatedPage);

    return updatedPage;
  }

  /**
   * Update a component on a specific page
   * @param pageId The ID of the page containing the component
   * @param component The component with updated values
   * @returns Promise resolving to the updated page structure
   */
  async updateComponentOnPage(
    pageId: string,
    component: ElementSchema,
  ): Promise<PageSchema | HomeSchema> {
    if (pageId === "home") {
      return this.updateComponentOnHome(component);
    }

    const page = await this.appController.loadPage(pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }

    const updatedPage = deepClone(page) as PageSchema;
    updatedPage.children = this.updateComponentRecursive(
      updatedPage.children,
      component,
    );
    await this.appController.savePage(pageId, updatedPage);

    return updatedPage;
  }

  /**
   * Delete a component from a specific page
   * @param pageId The ID of the page containing the component
   * @param componentId The ID of the component to delete
   * @returns Promise resolving to the updated page structure
   */
  async deleteComponentFromPage(
    pageId: string,
    componentId: string,
  ): Promise<PageSchema | HomeSchema> {
    if (pageId === "home") {
      return this.deleteComponentFromHome(componentId);
    }

    const page = await this.appController.loadPage(pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }

    const updatedPage = deepClone(page) as PageSchema;
    updatedPage.children = this.deleteComponentRecursive(
      updatedPage.children,
      componentId,
    );
    await this.appController.savePage(pageId, updatedPage);

    return updatedPage;
  }

  /**
   * Add a component as a child of another component
   * @param pageId The ID of the page containing the parent component
   * @param parentId The ID of the parent component
   * @param component The child component to add
   * @returns Promise resolving to the updated page structure
   */
  async addChildComponent(
    pageId: string,
    parentId: string,
    component: ElementSchema,
  ): Promise<PageSchema | HomeSchema> {
    if (pageId === "home") {
      const home = await this.appController.readWholePage("home");
      if (!home) {
        throw new Error("Home page not found");
      }

      const updatedHome = deepClone(home) as HomeSchema;
      updatedHome.children = this.addComponentToParentRecursive(
        updatedHome.children,
        parentId,
        component,
      );
      await this.appController.updateAppInstance({ home: updatedHome });

      return updatedHome;
    }

    const page = await this.appController.loadPage(pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }

    const updatedPage = deepClone(page) as PageSchema;
    updatedPage.children = this.addComponentToParentRecursive(
      updatedPage.children,
      parentId,
      component,
    );
    await this.appController.savePage(pageId, updatedPage);

    return updatedPage;
  }

  /**
   * Create a new page with a pagination button that links to it
   * @param pageId The ID of the page containing the pagination button
   * @param buttonText The text to display on the pagination button
   * @returns Promise resolving to the ID of the new page
   */
  async createNewPageWithButton(
    pageId: string,
    buttonText: string,
  ): Promise<string> {
    // Generate new page ID
    const newPageId = `page-${randomId()}`;

    // Create pagination button component
    const buttonComponent = Schema.ButtonElementSchema.parse({
      id: this.generateComponentId("pagebutton"),
      type: "Button",
      text: buttonText,
      pageId: newPageId,
      size: "medium",
      appearance: "primary",
      action: {
        type: "navigate",
        targetPageId: newPageId,
      },
    });

    // Add button to current page
    await this.addComponentToPage(pageId, buttonComponent);

    // Create new page
    await this.appController.createNewPage(newPageId);

    return newPageId;
  }
}
