import {Devvit, useState} from "@devvit/public-api";
import {PageSchema} from "../api/Schema.js";
import {PageProps, type Route, type RouteParams} from "../types/page.js";
import {Page} from "../components/elements/Page.js";
import {useComponentOperations} from "../hooks/useComponentOperations.js";
import {ComponentRenderer} from "../components/ComponentRendererFactory.js";


type editPageProps = PageProps & {
    isHomePage: boolean;
    pageId?: string;
}
export const EditPage = ({
     navigate,
     context,
     appPost,
     isOwner,
     pageId,
     isHomePage = false,
     postMethods: { updateAppPost },
}: editPageProps): JSX.Element => {
    const [pageStructure, setPageStructure] = useState(appPost.home);
    const [formType, setFormType] = useState<"add" | "edit" | "delete" | null>(null);
    const [componentType, setComponentType] = useState<string | null>(null);
    const [componentId, setComponentId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // if (!isHomePage) {
    //     // TODO: come back when you fix pageId issue
    //     const [pageStructure, setPageStructure] = useState(appPost.home);
    // }

    // TODO conditionally render if page or home page
    const {
        handleAddComponent,
        handleDeleteComponent,
        flattenComponents,
    } = useComponentOperations(context, "home", setPageStructure, true, updateAppPost);

    const navigateAdapter = (route: string, params?: any) => {
        navigate(route as Route, params as RouteParams);
    };
    const componentRenderer = new ComponentRenderer(context, { navigate: navigateAdapter });
    const flattenedComponents = flattenComponents(pageStructure.children);

    /**
     * 1) Get components
     * 2) render components with handlers
     *      - add component option to stacks, drag button up (might just use up down arrows for now), edit specific component, stacks should also have add component option
     * 3) have updates associated
     * 4) navigate back to original page with updated structure on save button
     *      - Button only renders if changes and have back buttons
     */
    // TODO: Create holders that have buttons name of component, edit, add, different handlers

    return (
        <Page>
            <Page.Content navigate={navigate}>
                <text>Edit Page</text>
            </Page.Content>
        </Page>
    )
}
