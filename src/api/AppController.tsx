import { Redis } from './Redis.js';
import { Schema, AppInstance, PageSchema, ElementSchema, HomeSchema } from './Schema.js';
import { randomId } from '../util.js';
import { Devvit } from '@devvit/public-api';

export class AppController {
    postId: string;
    context: Devvit.Context;

    constructor(postId: string, context: Devvit.Context) {
        this.postId = postId;
        this.context = context;
    }

    async loadAppInstance(): Promise<AppInstance | null> {
        try {
            const rdx = new Redis(this.context.redis);
            const instance = await rdx.appInstanceGet(this.postId);
            if (!instance) {
                console.error(`No instance found for postId: ${this.postId}`);
                return null;
            }
            console.log('Loaded AppInstance:', instance);
            return instance;
        } catch (error) {
            console.error('Error loading AppInstance:', error);
            return null;
        }
    }

    async saveAppInstance(instance: AppInstance) {
        const rdx = new Redis(this.context.redis);
        await rdx.appInstanceUpdate(this.postId, instance);
    }

    async loadPage(pageId: string): Promise<PageSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            return appInstance.pages[pageId];
        }
        return null;
    }

    async savePage(pageId: string, page: PageSchema) {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            appInstance.pages[pageId] = page;
            await this.saveAppInstance(appInstance);
        }
    }

    async createNewPage(): Promise<string> {
        const newPageId = randomId();
        const newPage: PageSchema = {
            id: newPageId,
            light: '#FFFFFF',
            dark: '#1A1A1B',
            children: [],
        };
        await this.savePage(newPageId, newPage);
        return newPageId;
    }

    async createHomePage() {
        const homePage: HomeSchema = {
            light: '#FFFFFF',
            dark: '#1A1A1B',
            children: [],
        };
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            appInstance.home = homePage;
            await this.saveAppInstance(appInstance);
        }
    }

    async updateAppInstance(updates: Partial<AppInstance>): Promise<AppInstance | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance) {
            const updatedInstance = { ...appInstance, ...updates };
            await this.saveAppInstance(updatedInstance);
            return updatedInstance;
        }
        return null;
    }

    async editElement(pageId: string, elementId: string, updates: Partial<ElementSchema>): Promise<ElementSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            const page = appInstance.pages[pageId];
            const elementIndex = page.children.findIndex((el: ElementSchema) => el.id === elementId);
            if (elementIndex !== -1) {
                page.children[elementIndex] = { ...page.children[elementIndex], ...updates };
                await this.saveAppInstance(appInstance);
                return page.children[elementIndex];
            }
        }
        return null;
    }

    async deleteNode(pageId: string, elementId: string): Promise<PageSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            const page = appInstance.pages[pageId];
            page.children = page.children.filter((el: ElementSchema) => el.id !== elementId);
            await this.saveAppInstance(appInstance);
            return page;
        }
        return null;
    }

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

    async reorderElements(pageId: string, elementOrder: string[]): Promise<PageSchema | null> {
        const appInstance = await this.loadAppInstance();
        if (appInstance && appInstance.pages[pageId]) {
            const page = appInstance.pages[pageId];
            page.children = elementOrder.map(id => page.children.find((el: ElementSchema) => el.id === id)).filter(el => el !== undefined) as ElementSchema[];
            await this.saveAppInstance(appInstance);
            return page;
        }
        return null;
    }

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
            primaryColor: {
                light: '#FF4500',
                dark: '#1A1A1B',
            },
            title,
            header,
            subheader: '',
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
