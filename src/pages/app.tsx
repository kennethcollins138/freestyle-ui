import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { AppController } from '../api/AppController.js';
import type { PageProps, Route, RouteParams } from '../types/page.js';
import { Page } from '../components/Page.js';
import { WelcomePage } from './welcome.js';

const getPageForRoute = (route: Route): ((props: PageProps) => JSX.Element) => {
  switch (route) {
    case 'home':
      // to-do: this should not be async.
      // @ts-expect-error
      return HomePage;
    // case 'admin':
    //   return AdminPage;
    // case 'admin:configure':
    //   return AdminConfigurePage;
    // case 'frequently_asked_questions':
    //   return FrequentlyAskedQuestionsPage;
    case 'welcome':
      return WelcomePage;
    // case 'pin_detail':
    //   return PinDetailPage;
    default:
      throw new Error(`Unhandled route`);
  }
};

export const App: Devvit.CustomPostComponent = async (context: Context) => {
    const { useState, postId, reddit } = context;

    if (!postId){
        throw new Error(`Cannot find post id from context`);
    }

		// Grabs current instance of this specific post
    const [currentPost, setCurrentPost] = useState(async () => {
        const svc = new AppController(postId, context);
        return await svc.getAppInstance();
    });
		
		// If the post is in draft status, it needs to be instantiated, so it returns welcome route.
		const [[route, routeParams], setRouteConfig] = useState<[Route, RouteParams]>(async () => {
			if (currentPost.status === 'draft') {
				return ['welcome', {}];
			}
			return ['home', {}];
		});

		// Only owners can edit the post
		const [currentUserUsername] = useState(async () => {
			const user = await reddit.getCurrentUser();
			return user?.username;
		});
		const isOwner = currentUserUsername ? currentPost.owners.includes(currentUserUsername) : false;

		const navigate = (route: Route, params: RouteParams = {}): void => {
			setRouteConfig([route, params]);
		};

		const updateAppPost: AppController['updateAppInstance'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.updateAppInstance(...args);
			setCurrentPost(prevState => ({ ...prevState, ...data }));
			return data;
		};
	
		const updateAppElement: AppController['editElement'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.editElement(...args);
			setCurrentPost(prevState => {
				const updatedPages = { ...prevState.pages };
				updatedPages[data.id] = data;
				return { ...prevState, pages: updatedPages };
			});
			return data;
		};
	
		const deleteNode: AppController['deleteNode'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.deleteNode(...args);
			setCurrentPost(prevState => {
				const updatedPages = { ...prevState.pages };
				updatedPages[data.id] = data;
				return { ...prevState, pages: updatedPages };
			});
			return data;
		};
	
		const addElement: AppController['addChild'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.addChild(...args);
			setCurrentPost(prevState => {
				const updatedPages = { ...prevState.pages };
				updatedPages[data.id] = data;
				return { ...prevState, pages: updatedPages };
			});
			return data;
		};
	
		const clonePost: AppController['clonePost'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.clonePost(...args);
			setCurrentPost(data);
			return data;
		};
	
		const readWholePage: AppController['readWholePage'] = async (...args) => {
			const svc = new AppController(postId, context);
			const data = await svc.readWholePage(...args);
			setCurrentPost(prevState => ({ ...prevState, home: data }));
			return data;
		};
		
		// TODO: this method needs to be tweaked for changing order as well.
		// const readImmediateChildren: AppController['readImmediateChildren'] = async (...args) => {
		// 	const svc = new AppController(postId, context);
		// 	const data = await svc.readImmediateChildren(...args);
		// 	setCurrentPost(data);
		// 	return data;
		// };

		// TODO: Need to add updateChildrenOrder functionality
		const Page = getPageForRoute(route);
		return (
			<blocks>
				<Page
					navigate={navigate}
					route={route}
					params={routeParams}
					context={context}
					appPost={currentPost}
					isOwner={isOwner}
					currentUserUsername={currentUserUsername ?? ''}
					postMethods={{
						updateAppPost,
						updateAppElement,
						addElement,
						clonePost,
						deleteNode,
						readWholePage,
					}}
				/>
			</blocks>
		);
}