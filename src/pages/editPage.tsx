import { Devvit, useState } from "@devvit/public-api";
import { PageSchema, ComponentType } from "../api/Schema.js";
import { PageProps, type Route, type RouteParams } from "../types/page.js";
import { Page } from "../components/elements/Page.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";
import { ComponentRenderer } from "../components/ComponentRendererFactory.js";
import { ComponentPreview } from "../components/componentPreview.js";
import { ComponentSelector } from "../components/ComponentSelector.js";


export const EditPage = ({
                             params,
                             navigate,
                             context,
                             appPost,
                             isOwner,
                             postMethods: { updateAppPost },
                         }: PageProps): JSX.Element => {
    // Determine which page structure to use based on isHomePage
    const pageId = params.pageId || "home";
    const isHomePage = pageId === "home";
    const initialStructure = isHomePage ? appPost.home : (pageId ? appPost.pages[pageId] : appPost.home);

    if (!initialStructure) {
        console.error(`Page with ID ${pageId} not found`);
        // Redirect to home if page doesn't exist
        navigate("home");
        return null;
    }

    const [pageStructure, setPageStructure] = useState(initialStructure);
    const [formType, setFormType] = useState<"add" | "edit" | "delete" | null>(null);
    const [componentType, setComponentType] = useState<string | null>(null);
    const [componentId, setComponentId] = useState<string | null>(null);
    const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Setup component operations
    const {
        handleAddComponent,
        handleEditComponent,
        handleDeleteComponent,
        flattenComponents,
        refreshPageData,
    } = useComponentOperations(
        context,
        pageId,
        setPageStructure,
        isHomePage,
        updateAppPost
    );

    const navigateAdapter = (route: string, params?: any) => {
        navigate(route as Route, params as RouteParams);
    };

    const componentRenderer = new ComponentRenderer(context, { navigate: navigateAdapter });
    const flattenedComponents = flattenComponents(pageStructure.children);

    // Toggle component expansion (show/hide children)
    const toggleComponentExpansion = (componentId: string) => {
        setExpandedComponents(prev => {
            const newState = { ...prev };
            newState[componentId] = !prev[componentId];
            return newState;
        });
    };

    // Check if a component is expanded
    const isComponentExpanded = (componentId: string): boolean => {
        return Boolean(expandedComponents[componentId]);
    };

    // Add component selector form
    const addComponentForm = ComponentSelector({
        context,
        setFormType: setFormType,
        setComponentType: setComponentType,
    });

    // Handlers for component operations
    const handleComponentEdit = (component: ComponentType) => {
        setComponentId(component.id);
        setComponentType(component.type);
        setFormType("edit");
        context.ui.showToast(`Editing ${component.type} component: ${component.id}`);
        // TODO: Show the appropriate editor form based on component type
    };

    const handleComponentDelete = (componentId: string) => {
        // Show a confirmation prompt
    };

    const handleComponentDrag = (componentId: string) => {
        context.ui.showToast(`Moving component: ${componentId}`);
        // TODO: Implement drag functionality
    };

    const handleComponentAdd = (parentId: string) => {
        context.ui.showToast(`Adding child to: ${parentId}`);
        context.ui.showForm(addComponentForm);
    };

    const saveChanges = async () => {
        try {
            setIsSaving(true);
            // Get the target ID (home or specific page)
            const targetId = isHomePage ? "home" : pageId;

            // Update the app instance with the current structure
            if (isHomePage) {
                await updateAppPost({ home: pageStructure });
            } else if (pageId) {
                const updatedPages = { ...appPost.pages };
                updatedPages[pageId] = pageStructure;
                await updateAppPost({ pages: updatedPages });
            }

            context.ui.showToast("Changes saved successfully");

            // Navigate back to the page being edited
            if (isHomePage) {
                navigate("home");
            } else {
                navigate("pagination", { pageId });
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            context.ui.showToast("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel editing and go back without saving
    const cancelEditing = () => {
        // Show a confirmation if there are unsaved changes
        // context.ui.useFo({
        //     title: "Discard Changes",
        //     message: "Are you sure you want to discard your changes?",
        //     confirmText: "Discard",
        //     confirmAppearance: "destructive",
        //     onConfirm: () => {
        //         if (isHomePage) {
        //             navigate("home");
        //         } else {
        //             navigate("pagination", { pageId });
        //         }
        //     },
        // });
    };

    return (
        <Page>
            <Page.Content navigate={navigate}>
                <vstack width="100%" height="100%" gap="medium">
                    {/* Header with title and toggle */}
                    <hstack width="100%" padding="small" gap="small" alignment="middle">
                        <text size="xlarge" weight="bold" alignment={"center middle"} grow>
                            {isHomePage ? "Edit Home Page" : `Edit Page: ${pageId}`}
                        </text>

                        <button
                            appearance="secondary"
                            size="small"
                            icon={isPreviewMode ? "edit" : "original"}
                            onPress={() => setIsPreviewMode(!isPreviewMode)}
                        >
                            {isPreviewMode ? "Edit View" : "Preview"}
                        </button>
                    </hstack>

                    {/* Divider */}
                    <hstack width="100%" height="1px" backgroundColor="#000000" />

                    {/* Main content area */}
                    <vstack width="100%" height="100%" gap="medium" padding="small" grow>
                        {isPreviewMode ? (
                            /* Preview mode shows actual rendered components */
                            <vstack width="100%" padding="small">
                                <text size="medium" weight="bold">Preview Mode</text>
                                <vstack
                                    width="100%"
                                    padding="medium"
                                    backgroundColor="#f5f5f5"
                                    cornerRadius="medium"
                                >
                                    {componentRenderer.renderComponents(
                                        pageStructure.children as ComponentType[],
                                        navigateAdapter
                                    )}
                                </vstack>
                            </vstack>
                        ) : (
                            /* Edit mode shows component tree with controls */
                            <vstack width="100%" gap="medium" grow>
                                <hstack width="100%" gap="small">
                                    <button
                                        size="small"
                                        icon="add"
                                        appearance="primary"
                                        onPress={() => context.ui.showForm(addComponentForm)}
                                    >
                                        Add Component
                                    </button>
                                </hstack>

                                <vstack
                                    width="100%"
                                    padding="small"
                                    backgroundColor="#000000"
                                    cornerRadius="medium"
                                    grow
                                >
                                    <text size="small" weight="bold">Component Structure</text>

                                    {/* Component tree */}
                                    <vstack width="100%" padding="small" gap="small">
                                        {pageStructure.children.length > 0 ? (
                                            pageStructure.children.map((component: ComponentType) => (
                                                <ComponentPreview
                                                    key={component.id}
                                                    component={component}
                                                    onDelete={() => handleComponentDelete(component.id)}
                                                    onDrag={() => handleComponentDrag(component.id)}
                                                    onEdit={() => handleComponentEdit(component)}
                                                    onAdd={() => handleComponentAdd(component.id)}
                                                    onDropDown={() => toggleComponentExpansion(component.id)}
                                                />
                                            ))
                                        ) : (
                                            <text size="medium" alignment="center">
                                                No components. Add your first component to get started.
                                            </text>
                                        )}
                                    </vstack>
                                </vstack>
                            </vstack>
                        )}
                    </vstack>

                    {/* Action buttons */}
                    <hstack width="100%" padding="small" gap="medium" alignment="middle center">
                        <button
                            appearance="secondary"
                            size="medium"
                            icon="close"
                            onPress={cancelEditing}
                            grow
                            disabled={isSaving}
                        >
                            Cancel
                        </button>

                        <button
                            appearance="primary"
                            size="medium"
                            icon="save"
                            onPress={saveChanges}
                            grow
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </hstack>
                </vstack>
            </Page.Content>
        </Page>
    );
};
