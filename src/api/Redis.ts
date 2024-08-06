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

export class Redis {
	// Contsruct class for CRUD
  #redis: Devvit.Context['redis'];
  constructor(redis: Devvit.Context['redis']) {
    this.#redis = redis;
  }
	// Keys we are storing for various operations like postID as appInstance
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

  // Fetch and Validates config data
  async configGet(): Promise<Config> {
    const maybeState = await this.#redis.get(Redis.keys.config());

    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }

    return Schema.configSchema.parseAsync(maybeState);
  }

	// Updated config by merging old and new config
  async configUpsert(
    params: Config,
    { context }: { context?: CreateUpdateUpsertContext } = {}
  ): Promise<void> {
    const client = context?.txn ?? this.#redis;

    const oldConfig = await this.configGet().catch(() => null);

    const parsedParams = Schema.configSchema.parse(params);
    await client.set(Redis.keys.config(), JSON.stringify({ ...oldConfig, ...parsedParams }));
  }

  // Grabs app data based off its postID
  async appInstanceGet(id: string): Promise<AppInstance> {
    const maybeState = await this.#redis.get(Redis.keys.appInstance(id));

    if (!maybeState) {
      throw new Error(`Could not find app instance with id ${id}!`);
    }

    return Schema.appInstance.parseAsync(maybeState);
  }

	// Creates a new post, used from menu action
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

	// Updates existing app.
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

	// Can use this for deleting a stack or element, 
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
	// Edit an element based on its id number
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

	// Add Element within stack or page
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

	// Grab page for pagination
  async readWholePage(appInstanceId: string, pageId: string): Promise<any> {
    const appInstance = await this.appInstanceGet(appInstanceId);
    if (pageId === 'home') {
      return appInstance.home;
    }
    return appInstance.pages[pageId];
  }

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
