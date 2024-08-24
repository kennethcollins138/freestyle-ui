import type { Devvit } from '@devvit/public-api';
import type { TxClient } from '@devvit/public-api/apis/redis/RedisClient.js';
import { Schema, Config, AppInstance, PageSchema, ElementSchema, HomeSchema } from './Schema.js';
import { z } from 'zod';

type CreateUpdateUpsertContext = {
  txn?: TxClient;
  currentUserId?: string;
};

/**
 * Class responsible for interacting with Redis to manage application data such as configurations,
 * app instances, pages, and elements.
 */
export class Redis {
  #redis: Devvit.Context['redis'];

  /**
   * Initializes an instance of the Redis class.
   * @param redis - The Redis client context from Devvit.
   */
  constructor(redis: Devvit.Context['redis']) {
    this.#redis = redis;
  }

  /**
   * Static keys generator for Redis storage paths.
   */
  static keys = {
    user(userId: string) {
      return `user:${userId}` as const;
    },
    config() {
      return `config` as const;
    },
    appInstance(id: string) {
      return `app_instance:${id}` as const;
    },
  };

  /**
   * Retrieves the global configuration from Redis.
   * @returns The parsed Config object.
   * @throws Error if the config is not found.
   */
  async configGet(): Promise<Config> {
    const maybeState = await this.#redis.get(Redis.keys.config());
    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }
    return Schema.configSchema.parseAsync(maybeState);
  }

  /**
   * Retrieves an AppInstance by its ID from Redis.
   * @param id - The ID of the AppInstance.
   * @returns The parsed AppInstance object.
   * @throws Error if the AppInstance is not found.
   */
  async appInstanceGet(id: string): Promise<AppInstance> {
    const data = await this.#redis.get(Redis.keys.appInstance(id));
    if (!data) {
      throw new Error(`Cannot find app instance with id: ${id}!`);
    }
    return Schema.appInstance.parse(JSON.parse(data));
  }

  /**
   * Creates a new AppInstance in Redis.
   * @param id - The ID for the new AppInstance.
   * @param params - The data for the new AppInstance.
   * @param context - Optional context for transaction handling.
   * @returns The parsed and saved AppInstance.
   * @throws Error if an AppInstance with the given ID already exists.
   */
  async appInstanceCreate(id: string, params: AppInstance, context?: CreateUpdateUpsertContext): Promise<AppInstance> {
    const client = context?.txn ?? this.#redis;
    const data = await this.#redis.get(Redis.keys.appInstance(id));
    if (data) {
      throw new Error(`Cannot create because app instance already exists for id: ${id}`);
    }
    const parsedParams = await Schema.appInstance.parseAsync(params);
    await client.set(Redis.keys.appInstance(id), JSON.stringify(parsedParams));
    return parsedParams;
  }

  /**
   * Updates an existing AppInstance in Redis.
   * @param id - The ID of the AppInstance to update.
   * @param params - The partial data to update the AppInstance with.
   * @param context - Optional context for transaction handling.
   * @returns The updated AppInstance object.
   * @throws Error if the AppInstance is not found.
   */
  async appInstanceUpdate(id: string, params: Partial<AppInstance>, context?: CreateUpdateUpsertContext): Promise<AppInstance> {
    const client = context?.txn ?? this.#redis;
    const data = await this.#redis.get(Redis.keys.appInstance(id));
    if (!data) {
      throw new Error(`Cannot find app instance for id: ${id}`);
    }
    const parsedParams = await Schema.appInstance.parseAsync({
      ...JSON.parse(data),
      ...params,
    });
    await client.set(Redis.keys.appInstance(id), JSON.stringify(parsedParams));
    return parsedParams;
  }

  /**
   * Recursively deletes a node (element) from the app instance.
   * @param appInstanceId - The ID of the AppInstance.
   * @param nodeId - The ID of the node to delete.
   */
  async deleteNode(appInstanceId: string, nodeId: string): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    // Helper function to recursively delete the node from the element tree
    const deleteNodeRecursive = (elements: ElementSchema[]): ElementSchema[] => {
      return elements.filter(element => {
        if (element.id === nodeId) {
          return false;
        }
        if (element.children) {
          element.children = deleteNodeRecursive(element.children);
        }
        return true;
      });
    };

    // Delete node from home page and all other pages
    appInstance.home.children = deleteNodeRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = deleteNodeRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Edits an element within the app instance.
   * @param appInstanceId - The ID of the AppInstance.
   * @param updatedElement - The updated element data.
   */
  async editElement(appInstanceId: string, updatedElement: ElementSchema): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    // Helper function to recursively update the element in the tree
    const editElementRecursive = (elements: ElementSchema[]): ElementSchema[] => {
      return elements.map(element => {
        if (element.id === updatedElement.id) {
          return { ...element, ...updatedElement };
        }
        if (element.children) {
          element.children = editElementRecursive(element.children);
        }
        return element;
      });
    };

    // Update element in home page and all other pages
    appInstance.home.children = editElementRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = editElementRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Adds a child element to a parent element within the app instance.
   * @param appInstanceId - The ID of the AppInstance.
   * @param parentElementId - The ID of the parent element.
   * @param newChild - The child element to add.
   */
  async addChild(appInstanceId: string, parentElementId: string, newChild: ElementSchema): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    // Helper function to recursively add the child element
    const addChildRecursive = (elements: ElementSchema[]): ElementSchema[] => {
      return elements.map(element => {
        if (element.id === parentElementId) {
          if (!element.children) {
            element.children = [];
          }
          element.children.push(newChild);
        } else if (element.children) {
          element.children = addChildRecursive(element.children);
        }
        return element;
      });
    };

    // Add child to home page and all other pages
    appInstance.home.children = addChildRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = addChildRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Reads the entire content of a page or home schema from the app instance.
   * @param appInstanceId - The ID of the AppInstance.
   * @param pageId - The ID of the page to read.
   * @returns The PageSchema or HomeSchema for the specified page.
   */
  async readWholePage(appInstanceId: string, pageId: string): Promise<PageSchema | HomeSchema> {
    const appInstance = await this.appInstanceGet(appInstanceId);
    if (pageId === 'home') {
      return appInstance.home;
    }
    return appInstance.pages[pageId];
  }

  /**
   * Retrieves the immediate children of a specified parent element.
   * @param appInstanceId - The ID of the AppInstance.
   * @param parentElementId - The ID of the parent element.
   * @returns An array of the immediate children ElementSchema objects.
   */
  async readImmediateChildren(appInstanceId: string, parentElementId: string): Promise<ElementSchema[]> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    // Helper function to find immediate children recursively
    const findImmediateChildren = (elements: ElementSchema[]): ElementSchema[] => {
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

    // Search for children in home page and all other pages
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
   * Updates the order of child elements within a specified parent element.
   * @param appInstanceId - The ID of the AppInstance.
   * @param parentElementId - The ID of the parent element.
   * @param newOrder - The new order of child element IDs.
   */
  async updateChildrenOrder(appInstanceId: string, parentElementId: string, newOrder: string[]): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    // Helper function to recursively update the order of children
    const updateOrderRecursive = (elements: ElementSchema[]): ElementSchema[] => {
      return elements.map(element => {
        if (element.id === parentElementId) {
          element.children = newOrder.map(id => element.children?.find((child: ElementSchema) => child.id === id)) as ElementSchema[];
        } else if (element.children) {
          element.children = updateOrderRecursive(element.children);
        }
        return element;
      });
    };

    // Update order in home page and all other pages
    appInstance.home.children = updateOrderRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = updateOrderRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Creates a new post in Redis.
   * @param postId - The ID for the new post.
   * @param newAppInstance - The data for the new AppInstance.
   * @throws Error if a post with the given ID already exists.
   */
  async createNewPost(postId: string, newAppInstance: AppInstance): Promise<void> {
    const existingPost = await this.#redis.get(Redis.keys.appInstance(postId));
    if (existingPost) {
      throw new Error(`Post with ID ${postId} already exists.`);
    }

    await this.#redis.set(Redis.keys.appInstance(postId), JSON.stringify(newAppInstance));
  }
}
