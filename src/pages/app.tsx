import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { AppController } from '../api/AppController.js';
import type { PageProps, Route, RouteParams } from '../types/page.js';
import { Page  } from '../components/Page.js';
import { WelcomePage } from './welcome.js';
import { HomePage } from './home.js';

const getPageForRoute = (route: Route): ((props: PageProps) => JSX.Element) => {
  switch (route) {
    case 'home':
      return HomePage;
    case 'welcome':
      return WelcomePage;
    default:
      throw new Error(`Unhandled route: ${route}`);
  }
};

export const App: Devvit.CustomPostComponent = async (context: Context) => {
  const { useState, postId, reddit } = context;

  if (!postId) {
    console.error('No postId found in context');
    throw new Error(`Cannot find post id from context`);
  }

  console.log('Post ID:', postId);

  const [currentPost, setCurrentPost] = useState<{ 
    status: "draft" | "live"; 
    url: string | null; 
    createdAt: string; 
    createdBy: string; 
    owners: string[]; 
    primaryColor: { light: string; dark: string }; 
    title: string; 
    header: string; 
    subheader: string; 
    home: { light: string; dark: string | null; children: any[] }; 
    pages: Record<string, { light: string; dark: string | null; children: any[]; id: string }>
  } | null>(async () => {
    const svc = new AppController(postId, context);
    const appInstance = await svc.loadAppInstance();
    console.log('Retrieved app instance:', appInstance);
    return appInstance;
  });

  const [[route, routeParams], setRouteConfig] = useState<[Route, RouteParams]>(async () => {
    const post = await currentPost;
    console.log('App instance status:', post?.status);
    if (post?.status === 'draft') {
      return ['welcome', {}];
    }
    return ['home', {}];
  });

  const [currentUserUsername] = useState(async () => {
    const user = await reddit.getCurrentUser();
    return user?.username;
  });

  console.log('Current route:', route);

  const isOwner = currentUserUsername ? (currentPost?.owners.includes(currentUserUsername) ?? false) : false;

  const navigate = (route: Route, params: RouteParams = {}): void => {
    setRouteConfig([route, params]);
  };

  const updateAppPost: AppController['updateAppInstance'] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.updateAppInstance(...args);
    setCurrentPost((prevState) => {
      if (!prevState) return prevState;
      return { ...prevState, ...data };
    });
    return data;
  };

  const updateAppElement: AppController['editElement'] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.editElement(...args);
    setCurrentPost((prevState) => {
      if (!prevState) return prevState;
      const updatedPages = { ...prevState.pages };
      updatedPages[data.id] = data;
      return { ...prevState, pages: updatedPages };
    });
    return data;
  };

  const deleteNode: AppController['deleteNode'] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.deleteNode(...args);
    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;
      const updatedPages = { ...prevState.pages };
      if (data.id in updatedPages) {
        updatedPages[data.id] = data;
      }
      return { ...prevState, pages: updatedPages };
    });
    return data;
  };

  const addElement: AppController['addChild'] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.addChild(...args);
    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;
      const updatedPages = { ...prevState.pages };
      if (data.id in updatedPages) {
        updatedPages[data.id] = data;
      }
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
    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;
      return { ...prevState, home: data };
    });
    return data;
  };

  const PageComponent = getPageForRoute(route);
  console.log('Rendering page for route:', route);

  if (!currentPost) {
    return (
      <blocks>
        <text>Loading...</text>
      </blocks>
    );
  }

  return (
    <blocks>
      <PageComponent
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
};
