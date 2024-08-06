import { Devvit } from '@devvit/public-api';
import { Redis } from './Redis.js';
import type { AppInstance } from './Schema.js';

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
   * Updates the app instance in Redis with the given parameters.
   * @param params - The parameters to update the app instance with.
   * @returns The updated app instance.
   */
  async updateAppInstance(
    params: Parameters<Redis['appInstanceUpdate']>[1]
  ): Promise<AppInstance> {
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
   */
  async deleteNode(nodeId: string): Promise<void> {
    const rdx = new Redis(this.context.redis);
    await rdx.deleteNode(this.postId, nodeId);
  }

  /**
   * Edits an element in the app instance.
   * @param updatedElement - The element to update.
   */
  async editElement(updatedElement: any): Promise<void> {
    const rdx = new Redis(this.context.redis);
    await rdx.editElement(this.postId, updatedElement);
  }

  /**
   * Adds a child element to a parent element in the app instance.
   * @param parentElementId - The ID of the parent element.
   * @param newChild - The new child element to add.
   */
  async addChild(parentElementId: string, newChild: any): Promise<void> {
    const rdx = new Redis(this.context.redis);
    await rdx.addChild(this.postId, parentElementId, newChild);
  }

  /**
   * Reads a whole page or the home page from the app instance.
   * @param pageId - The ID of the page to read. Use 'home' to read the home page.
   * @returns The page data.
   */
  async readWholePage(pageId: string): Promise<any> {
    const rdx = new Redis(this.context.redis);
    return rdx.readWholePage(this.postId, pageId);
  }

  /**
   * Reads the immediate children of a specified parent element.
   * @param parentElementId - The ID of the parent element.
   * @returns The immediate children of the parent element.
   */
  async readImmediateChildren(parentElementId: string): Promise<any[]> {
    const rdx = new Redis(this.context.redis);
    return rdx.readImmediateChildren(this.postId, parentElementId);
  }

  /**
   * Updates the order of the immediate children of a parent element.
   * @param parentElementId - The ID of the parent element.
   * @param newOrder - The new order of the children IDs.
   */
  async updateChildrenOrder(parentElementId: string, newOrder: string[]): Promise<void> {
    const rdx = new Redis(this.context.redis);
    await rdx.updateChildrenOrder(this.postId, parentElementId, newOrder);
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
}
