import { Devvit } from '@devvit/public-api';
import { Redis } from './Redis.js';
import type { AppInstance, PageSchema } from './Schema.js';

/**
 * The AppController class provides methods to manage app instances stored in Redis.
 * This includes CRUD operations for elements and pages within an app instance.
 */
export class AppController {
  context: Devvit.Context;
  postId: string;

  /**
   * Constructs an instance of AppController.
   * @param postId - The ID of the app instance.
   * @param context - The context object containing information about the Devvit post.
   */
  constructor(postId: string, context: Devvit.Context) {
    this.context = context;
    this.postId = postId;
  }

  /**
   * Retrieves the app instance from Redis.
   * @returns The app instance.
   */
  async getAppInstance(): Promise<AppInstance> {
    const rdx = new Redis(this.context.redis);
    return rdx.appInstanceGet(this.postId);
  }

  /**
   * Retrieves a page by its ID.
   * @param pageId - The ID of the page to retrieve.
   * @returns The page data.
   */
  async getPage(pageId: string): Promise<PageSchema> {
    const appInstance = await this.getAppInstance();
    if (pageId === 'home') {
      return appInstance.home as PageSchema;
    }
    const page = appInstance.pages[pageId];
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    return page;
  }

  /**
   * Updates the app instance in Redis with the given parameters.
   * @param params - The parameters to update the app instance with.
   * @returns The updated app instance.
   */
  async updateAppInstance(params: Parameters<Redis['appInstanceUpdate']>[1]): Promise<AppInstance> {
    const rdx = new Redis(this.context.redis);
    return rdx.appInstanceUpdate(this.postId, params);
  }

  /**
   * Creates a new app instance in Redis.
   * @param params - The parameters for the new app instance.
   * @param username - The username of the creator.
   * @returns The created app instance.
   */
  async createAppInstance(params: Omit<AppInstance, 'createdBy'>, username: string): Promise<AppInstance> {
    const appInstance: AppInstance = {
      ...params,
      createdBy: username,
    };
    const rdx = new Redis(this.context.redis);
    return rdx.appInstanceCreate(this.postId, appInstance);
  }

  /**
   * Deletes a node by ID from the app instance.
   * @param nodeId - The ID of the node to delete.
   * @returns The page containing the deleted node.
   */
  async deleteNode(nodeId: string): Promise<PageSchema> {
    const appInstance = await this.getAppInstance();
    const page = Object.values(appInstance.pages).find(page => page.children.some(child => child.id === nodeId));
    if (page) {
      page.children = page.children.filter(child => child.id !== nodeId);
      await this.updateAppInstance({ pages: appInstance.pages });
      return page;
    }
    throw new Error('Node not found');
  }

  /**
   * Edits an element in the app instance.
   * @param updatedElement - The element to update.
   * @returns The page containing the updated element.
   */
  async editElement(updatedElement: any): Promise<PageSchema> {
    const appInstance = await this.getAppInstance();
    const page = Object.values(appInstance.pages).find(page => page.children.some(child => child.id === updatedElement.id));
    if (page) {
      page.children = page.children.map(child => child.id === updatedElement.id ? updatedElement : child);
      await this.updateAppInstance({ pages: appInstance.pages });
      return page;
    }
    throw new Error('Element not found');
  }

  /**
   * Adds a child element to a parent element in the app instance.
   * @param parentElementId - The ID of the parent element.
   * @param newChild - The new child element to add.
   * @returns The page containing the parent element.
   */
  async addChild(parentElementId: string, newChild: any): Promise<PageSchema> {
    const appInstance = await this.getAppInstance();
    const page = Object.values(appInstance.pages).find(page => page.children.some(child => child.id === parentElementId));
    if (page) {
      const parentElement = page.children.find(child => child.id === parentElementId);
      if (parentElement) {
        parentElement.children.push(newChild);
        await this.updateAppInstance({ pages: appInstance.pages });
        return page;
      }
    }
    throw new Error('Parent element not found');
  }

  /**
   * Reads a whole page or the home page from the app instance.
   * @param pageId - The ID of the page to read. Use 'home' to read the home page.
   * @returns The page data.
   */
  async readWholePage(pageId: string): Promise<PageSchema> {
    return this.getPage(pageId);
  }

  /**
   * Reads the immediate children of a specified parent element.
   * @param parentElementId - The ID of the parent element.
   * @returns The immediate children of the parent element.
   */
  async readImmediateChildren(parentElementId: string): Promise<any[]> {
    const appInstance = await this.getAppInstance();
    const findImmediateChildren = (elements: any[]): any[] => {
      for (const element of elements) {
        if (element.id === parentElementId) {
          return element.children || [];
        }
        if (element.children) {
          const result = findImmediateChildren(element.children);
          if (result.length) {
            return result;
          }
        }
      }
      return [];
    };

    let children = findImmediateChildren(appInstance.home.children);
    if (children.length === 0) {
      for (const pageKey in appInstance.pages) {
        children = findImmediateChildren(appInstance.pages[pageKey].children);
        if (children.length) {
          break;
        }
      }
    }

    return children;
  }

  /**
   * Updates the order of the immediate children of a parent element.
   * @param pageId - The ID of the page containing the parent element.
   * @param parentElementId - The ID of the parent element.
   * @param newOrder - The new order of the children IDs.
   * @returns The page containing the parent element.
   */
  async updateChildrenOrder(pageId: string, parentElementId: string, newOrder: string[]): Promise<PageSchema> {
    const page = await this.getPage(pageId);
    const updateOrderRecursive = (elements: any[]): any[] => {
      return elements.map(element => {
        if (element.id === parentElementId) {
          element.children = newOrder.map(id => element.children.find((child: any) => child.id === id));
        } else if (element.children) {
          element.children = updateOrderRecursive(element.children);
        }
        return element;
      });
    };

    page.children = updateOrderRecursive(page.children);

    const appInstance = await this.getAppInstance();
    appInstance.pages[pageId] = page;
    await this.updateAppInstance({ pages: appInstance.pages });

    return page;
  }

  /**
   * Clones the app instance and submits a new Reddit post with the given title.
   * @param title - The title of the new cloned post.
   * @returns The original app instance.
   */
  async clonePost(title: string): Promise<AppInstance> {
    const { reddit, ui } = this.context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const currentUser = await reddit.getCurrentUser();
    const cloneCreator = currentUser?.username;
    const subredditName = currentSubreddit.name;
    const appInstance = await this.getAppInstance();
    const cloneCreated = new Date().toISOString();
    const post = await reddit.submitPost({
      title: title,
      subredditName,
      preview: (
        <vstack>
          <text color="black white">Loading...</text>
        </vstack>
      ),
    });

    const newAppParams: AppInstance = {
      ...appInstance,
      createdAt: cloneCreated,
      createdBy: cloneCreator ?? '',
      url: post.url,
      title,
    };

    const rdx = new Redis(this.context.redis);
    const newAppInstance = await rdx.appInstanceCreate(post.id, newAppParams);

    await reddit.sendPrivateMessage({
      to: newAppInstance.createdBy,
      subject: 'Your post has been cloned',
      text: `View your cloned post: ${newAppInstance.url}`,
    });
    ui.showToast('Post successfully cloned! Check your messages.');

    return appInstance;
  }

  /** 
   * Adds a new page for pagination. Can pass base empty page here.
   * @param pageId - generatedId from util.ts for identifying page from PaginationButton.
   * @param newPage - data from new page to fill.
   * @returns The new page.
   */
  async addPage(pageId: string, newPage: PageSchema): Promise<PageSchema> {
    const appInstance = await this.getAppInstance();
    appInstance.pages[pageId] = newPage;

    const rdx = new Redis(this.context.redis);
    await rdx.appInstanceUpdate(this.postId, { pages: appInstance.pages });
    return newPage;
  }
}
