import { Redis } from './Redis.js';
import { AppInstance, PageSchema, ElementSchema, HomeSchema, ImageElementSchema } from './Schema.js';
import { Devvit } from '@devvit/public-api';

/**
 * Controller class for managing application instances, pages, and elements.
 * Provides methods to load, save, and manipulate data related to app instances and pages.
 */
export class AppController {
    postId: string;
    context: Devvit.Context;

    /**
     * Initializes an instance of AppController.
     * @param postId - The ID of the post associated with this app instance.
     * @param context - The Devvit context containing environment information.
     */
    constructor(postId: string, context: Devvit.Context) {
        this.postId = postId;
        this.context = context;
    }

    /**
     * Loads the AppInstance associated with the current postId.
     * @returns The loaded AppInstance, or null if not found.
     * Mainly used in updateAppInstance.
     */
    async loadAppInstance(): Promise<AppInstance | null> {
        try {
            const rdx = new Redis(this.context.redis);
            const instance = await rdx.appInstanceGet(this.postId);
            if (!instance) {
                console.error(`No instance found for postId: ${this.postId}`);
                return null;
            }
            return instance;
        } catch (error) {
            console.error('Error loading AppInstance:', error);
            return null;
        }
    }

    /**
     * Saves the given AppInstance to the Redis database.
     * @param instance - The AppInstance to save.
     */
    async saveAppInstance(instance: AppInstance) {
        const rdx = new Redis(this.context.redis);
        await rdx.appInstanceUpdate(this.postId, instance);
    }

    /**
     * Loads a specific page by its ID from the AppInstance.
     * @param pageId - The ID of the page to load.
     * @returns The loaded PageSchema, or null if not found.
     */
    async loadPage(pageId: string): Promise<PageSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            return appInstance.pages[pageId];
        }
        return null;
    }

    /**
     * Saves the given PageSchema to the AppInstance.
     * @param pageId - The ID of the page to save.
     * @param page - The PageSchema to save.
     */
    async savePage(pageId: string, page: PageSchema) {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            appInstance.pages[pageId] = page;
            await this.saveAppInstance(appInstance);
        }
    }

    /**
     * Creates a new page and saves it to the AppInstance.
     * @param inputId - The ID to assign to the new page.
     * @returns The ID of the newly created page.
     */
    async createNewPage(inputId: string): Promise<string> {
        const newPageId = inputId;
        const newPage: PageSchema = {
            id: newPageId,
            light: '#FFFFFF',
            dark: '#1A1A1B',
            children: [],
        };
        await this.savePage(newPageId, newPage);
        return newPageId;
    }

    /**
     * Updates the AppInstance with the given partial updates.
     * @param updates - Partial updates to apply to the AppInstance.
     * @returns The updated AppInstance, or null if the update failed.
     * Main driver for updating home page. Overwrites changes.
     */
    async updateAppInstance(updates: Partial<AppInstance>): Promise<AppInstance | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            const updatedInstance = { ...appInstance, ...updates };
            await this.saveAppInstance(updatedInstance);
            return updatedInstance;
        }
        return null;
    }

    /**
     * Edits an element within a specified page or home page.
     * @param pageId - The ID of the page containing the element to edit.
     * @param elementId - The ID of the element to edit.
     * @param updates - The updates to apply to the element.
     * @returns The updated PageSchema or HomeSchema.
     * @throws Error if the element could not be updated.
     */
    async editElement(pageId: string, elementId: string, updates: Partial<ElementSchema>): Promise<PageSchema | HomeSchema> {
        const appInstance = await this.loadAppInstance();
        
        if (appInstance) {
            const page = pageId === 'home' ? appInstance.home : appInstance.pages[pageId];
            if (page) {
                const elementIndex = page.children.findIndex((el: ElementSchema) => el.id === elementId);
                if (elementIndex !== -1) {
                    page.children[elementIndex] = { ...page.children[elementIndex], ...updates };
                    await this.saveAppInstance(appInstance);
                    return page;
                }
            }
        }
        
        throw new Error("Failed to update the component.");
    }

    /**
     * Deletes a node (element) from a page or home page.
     * @param pageId - The ID of the page containing the element to delete.
     * @param elementId - The ID of the element to delete.
     * @returns The updated PageSchema, HomeSchema, or null if not found.
     */
    async deleteNode(pageId: string, elementId: string): Promise<PageSchema | null | HomeSchema> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            const page = pageId === 'home' ? appInstance.home : appInstance.pages[pageId];
            if (page) {
                page.children = page.children.filter((el: ElementSchema) => el.id !== elementId);
                await this.saveAppInstance(appInstance);
                return page;
            }
        }
        return null;
    }

    /**
     * Adds a child element to a specified page.
     * @param pageId - The ID of the page to add the child element to.
     * @param child - The ElementSchema representing the child element.
     * @returns The updated PageSchema, or null if the page was not found.
     */
    async addChild(pageId: string, child: ElementSchema): Promise<PageSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            const page = appInstance.pages[pageId];
            page.children.push(child);
            await this.saveAppInstance(appInstance);
            return page;
        }
        return null;
    }

    /**
     * Adds or updates image data for a specific component ID.
     * @param componentId - The ID of the component associated with the image data.
     * @param imageData - The ImageElementSchema representing the image data.
     * @throws Error if the AppInstance is not found.
     * Image data needs to be held stored in order for the upload to work properly.
     */
    async addOrUpdateImageData(componentId: string, imageData: ImageElementSchema): Promise<void> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
          appInstance.imageData[componentId] = imageData;
          await this.saveAppInstance(appInstance);
        } else {
          throw new Error('App instance not found');
        }
      }
    
    /**
     * Retrieves image data for a specific component ID.
     * @param componentId - The ID of the component to retrieve the image data for.
     * @returns The ImageElementSchema, or null if not found.
     */
    async getImageDataByComponentId(componentId: string): Promise<ImageElementSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.imageData[componentId]) {
          return appInstance.imageData[componentId];
        }
        return null;
      }
    
    /**
     * Clones the current AppInstance and assigns it a new postId.
     * @param newPostId - The new postId for the cloned AppInstance.
     * @returns The cloned AppInstance, or null if the original instance was not found.
     */
    async clonePost(newPostId: string): Promise<AppInstance | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            const rdx = new Redis(this.context.redis);
            const clonedInstance = { ...appInstance, id: newPostId };
            await rdx.appInstanceCreate(newPostId, clonedInstance);
            return clonedInstance;
        }
        return null;
    }

    /**
     * Retrieves the entire content of a page by its ID.
     * @param pageId - The ID of the page to read.
     * @returns The PageSchema, HomeSchema, or null if not found.
     */
    async readWholePage(pageId: string): Promise<PageSchema | HomeSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            if (pageId === 'home') {
                return appInstance.home;
            }
            return appInstance.pages[pageId];
        }
        return null;
    }

    /**
     * Reorders the elements within a page according to a specified order.
     * Plan on implementing this in future update! Even a drag and drop method would be great.
     * @param pageId - The ID of the page to reorder elements in.
     * @param elementOrder - The new order of element IDs.
     * @returns The updated PageSchema, HomeSchema, or null if not found.
     */
    async reorderElements(pageId: string, elementOrder: string[]): Promise<PageSchema | HomeSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            const page = appInstance.pages[pageId];
            page.children = elementOrder
                .map(id => page.children.find((el: ElementSchema) => el.id === id))
                .filter(el => el !== undefined) as ElementSchema[];
            await this.saveAppInstance(appInstance);
            return page;
        }
        return null;
    }

    /**
     * Creates a new post with the specified details.
     * @param username - The username of the post creator.
     * @param title - The title of the post.
     * @param url - The URL of the post.
     * @param header - The header text of the post.
     */
    async createNewPost({
        username,
        title,
        url,
        header,
    }: {
        username: string;
        title: string;
        url: string;
        header: string;
    }): Promise<void> {
        const newAppInstance: AppInstance = {
            status: 'draft',
            url,
            createdAt: new Date().toISOString(),
            createdBy: username,
            owners: [username],
            color: {
                light: '#FF4500',
                dark: '#1A1A1B',
            },
            title,
            header,
            subheader: '',
            imageData: {},
            home: {
                light: '#FF4500',
                dark: '#1A1A1B',
                children: [],
            },
            pages: {},
        };

        const rdx = new Redis(this.context.redis);
        await rdx.createNewPost(this.postId, newAppInstance);
    }
}
