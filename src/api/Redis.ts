import type { Devvit } from '@devvit/public-api';
import type { TxClient } from '@devvit/public-api/apis/redis/RedisClient.js';
import { Schema, Config, AppInstance, PageSchema, ElementSchema, HomeSchema } from './Schema.js';
import { z } from 'zod';

type CreateUpdateUpsertContext = {
  txn?: TxClient;
  currentUserId?: string;
};

export class Redis {
  #redis: Devvit.Context['redis'];

  constructor(redis: Devvit.Context['redis']) {
    this.#redis = redis;
  }

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

  async configGet(): Promise<Config> {
    const maybeState = await this.#redis.get(Redis.keys.config());
    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }
    return Schema.configSchema.parseAsync(maybeState);
  }

  async appInstanceGet(id: string): Promise<AppInstance> {
    const data = await this.#redis.get(Redis.keys.appInstance(id));
    if (!data) {
      throw new Error(`Cannot find app instance with id: ${id}!`);
    }
    return Schema.appInstance.parse(JSON.parse(data));
  }

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

  async deleteNode(appInstanceId: string, nodeId: string): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

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

    appInstance.home.children = deleteNodeRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = deleteNodeRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  async editElement(appInstanceId: string, updatedElement: ElementSchema): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);
  
    const editElementRecursive = (elements: ElementSchema[]): ElementSchema[] => {
      return elements.map(element => {
        console.log(`Checking element with ID: ${element.id}`); // Log element being checked
        if (element.id === updatedElement.id) {
          console.log(`Found matching element with ID: ${element.id}. Updating...`); // Log match
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
  
    console.log(`Saving updated appInstance with ID: ${appInstanceId}`);
    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }
  

  async addChild(appInstanceId: string, parentElementId: string, newChild: ElementSchema): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);

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

    appInstance.home.children = addChildRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = addChildRecursive(appInstance.pages[pageKey].children);
    }

    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }

  async readWholePage(appInstanceId: string, pageId: string): Promise<PageSchema | HomeSchema> {
    const appInstance = await this.appInstanceGet(appInstanceId);
    if (pageId === 'home') {
      return appInstance.home;
    }
    return appInstance.pages[pageId];
  }

  async readImmediateChildren(appInstanceId: string, parentElementId: string): Promise<ElementSchema[]> {
    const appInstance = await this.appInstanceGet(appInstanceId);

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

  async updateChildrenOrder(appInstanceId: string, parentElementId: string, newOrder: string[]): Promise<void> {
    const appInstance = await this.appInstanceGet(appInstanceId);
  
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
  
    appInstance.home.children = updateOrderRecursive(appInstance.home.children);
    for (const pageKey in appInstance.pages) {
      appInstance.pages[pageKey].children = updateOrderRecursive(appInstance.pages[pageKey].children);
    }
  
    await this.#redis.set(Redis.keys.appInstance(appInstanceId), JSON.stringify(appInstance));
  }
  
  async createNewPost(postId: string, newAppInstance: AppInstance): Promise<void> {
    const existingPost = await this.#redis.get(Redis.keys.appInstance(postId));
    if (existingPost) {
       throw new Error(`Post with ID ${postId} already exists.`);
    }
 
    await this.#redis.set(Redis.keys.appInstance(postId), JSON.stringify(newAppInstance));
 }
}
