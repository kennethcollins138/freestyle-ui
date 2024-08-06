import type { Devvit } from '@devvit/public-api';
import type { TxClient } from '@devvit/public-api/apis/redis/RedisClient.js';
import type { Config, AppInstance } from './Schema.js';
import { Schema } from './Schema.js';

type CreateUpdateUpsertContext = {
  txn?: TxClient;
  /**
   * Used for createdAt/updatedAt if applicable
   */
  currentUserId?: string;
};

/**
 * The Redis class provides methods to perform CRUD operations on app instances and configurations stored in Redis.
 */
export class Redis {
  #redis: Devvit.Context['redis'];

  /**
   * Constructs an instance of the Redis class.
   * @param redis - The Redis context from Devvit.
   */
  constructor(redis: Devvit.Context['redis']) {
    this.#redis = redis;
  }

  /**
   * Defines keys used for various operations like storing user data, config, and app instances.
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
   * Fetches and validates configuration data from Redis.
   * @returns The configuration data.
   * @throws Will throw an error if the config cannot be found.
   */
  async configGet(): Promise<Config> {
    const maybeState = await this.#redis.get(Redis.keys.config());

    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }

    return Schema.configSchema.parseAsync(maybeState);
  }

  /**
   * Updates the configuration in Redis by merging old and new configurations.
   * @param params - The new configuration parameters.
   * @param context - Optional context for transaction handling and current user ID.
   */
  async configUpsert(
    params: Config,
    { context }: { context?: CreateUpdateUpsertContext } = {}
  ): Promise<void> {
    const client = context?.txn ?? this.#redis;

    const oldConfig = await this.configGet().catch(() => null);

    const parsedParams = Schema.configSchema.parse(params);
    await client.set(Redis.keys.config(), JSON.stringify({ ...oldConfig, ...parsedParams }));
  }

  /**
   * Fetches an app instance by its ID from Redis.
   * @param id - The ID of the app instance.
   * @returns The app instance.
   * @throws Will throw an error if the app instance cannot be found.
   */
  async appInstanceGet(id: string): Promise<AppInstance> {
    const maybeState = await this.#redis.get(Redis.keys.appInstance(id));

    if (!maybeState) {
      throw new Error(`Could not find app instance with id ${id}!`);
    }

    return Schema.appInstance.parseAsync(maybeState);
  }

  /**
   * Creates a new app instance in Redis.
   * @param id - The ID of the new app instance.
   * @param params - The parameters for the new app instance.
   * @param context - Optional context for transaction handling and current user ID.
   * @returns The created app instance.
   * @throws Will throw an error if an app instance with the given ID already exists.
   */
  async appInstanceCreate(
    id: string,
    params: AppInstance,
    context?: CreateUpdateUpsertContext
  ): Promise<AppInstance> {
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
   * Updates an existing app instance in Redis.
   * @param id - The ID of the app instance to update.
   * @param params - The parameters to update the app instance with.
   * @param context - Optional context for transaction handling and current user ID.
   * @returns The updated app instance.
   * @throws Will throw an error if the app instance cannot be found.
   */
  async appInstanceUpdate(
    id: string,
    params: Partial<AppInstance>,
    context?: CreateUpdateUpsertContext
  ): Promise<AppInstance> {
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
   * Deletes a node by its ID from an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param nodeId - The ID of the node to delete.
   */
  async deleteNode(appInstanceId: string, nodeId: string): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    const deleteNodeRecursive = (elements: any[]): any[] => {
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

    appInstance.home.children = deleteNodeRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = deleteNodeRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Edits an element in an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param updatedElement - The element to update.
   */
  async editElement(appInstanceId: string, updatedElement: any): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    const editElementRecursive = (elements: any[]): any[] => {
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

    appInstance.home.children = editElementRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = editElementRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Adds a child element to a parent element in an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param parentElementId - The ID of the parent element.
   * @param newChild - The new child element to add.
   */
  async addChild(appInstanceId: string, parentElementId: string, newChild: any): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

    const addChildRecursive = (elements: any[]): any[] => {
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

    appInstance.home.children = addChildRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = addChildRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  /**
   * Reads a whole page or the home page from an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param pageId - The ID of the page to read. Use 'home' to read the home page.
   * @returns The page data.
   */
  async readWholePage(appInstanceId: string, pageId: string): Promise<any> {
    const appInstance = await this.appInstanceGet(appInstanceId);
    if (pageId === 'home') {
      return appInstance.home;
    }
    return appInstance.pages[pageId];
  }

  /**
   * Reads the immediate children of a specified parent element in an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param parentElementId - The ID of the parent element.
   * @returns The immediate children of the parent element.
   */
  async readImmediateChildren(appInstanceId: string, parentElementId: string): Promise<any[]> {
    const appInstance = await this.appInstanceGet(appInstanceId);

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
   * Updates the order of the immediate children of a parent element in an app instance.
   * @param appInstanceId - The ID of the app instance.
   * @param parentElementId - The ID of the parent element.
   * @param newOrder - The new order of the children IDs.
   */
  async updateChildrenOrder(
    appInstanceId: string,
    parentElementId: string,
    newOrder: string[]
  ): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

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

    appInstance.home.children = updateOrderRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = updateOrderRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }
}
