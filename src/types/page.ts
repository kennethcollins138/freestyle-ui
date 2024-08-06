import type { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import type { Schema } from '../api/Schema.js';
import type { AppController } from '../api/AppController.js';

export type Route = 
| 'home'
| 'admin'
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
pinPost: z.infer<(typeof Schema)['AppInstance']>;
pinPostMethods: {
    updatePinPost: PinPost['updatePinPost'];
    updatePinPostElement: PinPost['updatePinPostElement'];
    clonePost: PinPost['clonePost'];
};
}