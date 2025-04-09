import { Context, Devvit, useState } from "@devvit/public-api";
import { AppController } from "../api/AppController.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { WelcomePage } from "./welcome.js";
import { HomePage } from "./home.js";
import { AdminPage } from "./admin.js";
import { AppInstance, HomeSchema, PageSchema } from "../api/Schema.js";
import { PaginationPage } from "./Pagination.js";

const getPageForRoute = (route: Route): ((props: PageProps) => JSX.Element) => {
  switch (route) {
    case "home":
      return HomePage;
    case "welcome":
      return WelcomePage;
    case "admin":
      return AdminPage;
    case "pagination":
      return PaginationPage;
    default:
      throw new Error(`Unhandled route: ${route}`);
  }
};

export const App: Devvit.CustomPostComponent = (context: Context) => {
  const { postId, reddit } = context;

  if (!postId) {
    console.error("No postId found in context");
    throw new Error(`Cannot find post id from context`);
  }

  const [currentPost, setCurrentPost] = useState<AppInstance | null>(
    async () => {
      const svc = new AppController(postId, context);
      return await svc.loadAppInstance();
    },
  );

  if (!currentPost) {
    console.error("No post found");
    throw new Error("Cannot find post");
  }

  const [[route, routeParams], setRouteConfig] = useState<[Route, RouteParams]>(
    async () => {
      if (currentPost.status === "draft") {
        return ["welcome", {}];
      }
      return ["home", {}];
    },
  );

  //  getUserByUsername(username: string): Promise<User | undefined>;
  const [currentUserUsername] = useState<string | null>(async () => {
    const username = await reddit.getCurrentUsername();
    return username ?? null;
  });
  //
  // const [currentUserName]

  const isOwner = currentUserUsername
    ? (currentPost?.owners.includes(currentUserUsername) ?? false)
    : false;

  const navigate = (route: Route, params: RouteParams = {}): void => {
    setRouteConfig([route, params]);
  };

  const updateAppPost: AppController["updateAppInstance"] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.updateAppInstance(...args);
    setCurrentPost((prevState) => {
      if (!prevState) return prevState;
      return { ...prevState, ...data };
    });
    return data;
  };

  const updateAppElement: AppController["editElement"] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.editElement(...args);

    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;
      if (data.id) {
        const updatedPages = { ...prevState.pages };
        updatedPages[data.id] = data;
        return { ...prevState, pages: updatedPages };
      } else {
        return { ...prevState, home: data };
      }
    });

    return data;
  };

  const deleteNode: AppController["deleteNode"] = async (pageId, elementId) => {
    const svc = new AppController(postId, context);
    const data = await svc.deleteNode(pageId, elementId);

    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;

      if (pageId === "home") {
        return { ...prevState, home: data as HomeSchema };
      }

      const updatedPages = { ...prevState.pages };
      if (pageId in updatedPages) {
        updatedPages[pageId] = data as PageSchema;
      }

      return { ...prevState, pages: updatedPages };
    });

    return data;
  };

  const addElement: AppController["addChild"] = async (...args) => {
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

  const clonePost: AppController["clonePost"] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.clonePost(...args);
    setCurrentPost(data);
    return data;
  };

  const readWholePage: AppController["readWholePage"] = async (...args) => {
    const svc = new AppController(postId, context);
    const data = await svc.readWholePage(...args);
    setCurrentPost((prevState) => {
      if (!prevState || !data) return prevState;
      return { ...prevState, home: data };
    });
    return data;
  };

  const addOrUpdateImageData: AppController["addOrUpdateImageData"] = async (
    ...args
  ) => {
    const svc = new AppController(postId, context);
    return await svc.addOrUpdateImageData(...args);
  };

  const getImageDatabyComponentId: AppController["getImageDataByComponentId"] =
    async (...args) => {
      const svc = new AppController(postId, context);
      return await svc.getImageDataByComponentId(...args);
    };

  const savePage: AppController["savePage"] = async (...args) => {
    const svc = new AppController(postId, context);
    return await svc.savePage(...args);
  };
  const createNewPage: AppController["createNewPage"] = async (...args) => {
    const svc = new AppController(postId, context);
    return await svc.createNewPage(...args);
  };
  const PageComponent = getPageForRoute(route);
  console.log("Rendering page for route:", route);

  if (!currentPost) {
    return (
      <vstack alignment="center">
        <text color="red">
          Failed to load post data. Please try again later.
        </text>
      </vstack>
    );
  }

  return (
    <vstack
      lightBackgroundColor={currentPost.color.light}
      darkBackgroundColor={currentPost.color.dark}
    >
      <PageComponent
        navigate={navigate}
        route={route}
        params={routeParams}
        context={context}
        appPost={currentPost}
        isOwner={isOwner}
        currentUserUsername={currentUserUsername ?? ""}
        postMethods={{
          updateAppPost,
          updateAppElement,
          addElement,
          clonePost,
          deleteNode,
          readWholePage,
          createNewPage,
          savePage,
          addOrUpdateImageData,
          getImageDatabyComponentId,
        }}
      />
    </vstack>
  );
};
