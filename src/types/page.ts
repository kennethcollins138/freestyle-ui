import type { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import type { Schema } from '../api/Schema.js';
import type { AppController } from '../api/AppController.js';

export type Route = 
  | 'home'
  | 'admin'
  | 'pagination'
  | 'admin:configure'
  | 'welcome';

export type RouteParams = Record<string, string>;

export type PageProps = {
  context: Devvit.Context;
  route: Route;
  navigate: (route: Route, params?: RouteParams) => void;
  params: RouteParams;
  currentUserUsername: string;
  isOwner: boolean;
  appPost: z.infer<(typeof Schema)['appInstance']>;
  postMethods: {
    updateAppPost: AppController['updateAppInstance'];
    updateAppElement: AppController['editElement'];
    addElement: AppController['addChild'];
    clonePost: AppController['clonePost'];
    deleteNode: AppController['deleteNode'];
    readWholePage: AppController['readWholePage'];
    createNewPage: AppController['createNewPage'];
    savePage: AppController['savePage'];
    addOrUpdateImageData: AppController['addOrUpdateImageData'];
    getImageDatabyComponentId: AppController['getImageDataByComponentId'];
    // readImmediateChildren: AppController['readImmediateChildren'];
    // updateChildrenOrder: AppController['updateChildrenOrder'];
  };
};
