import { Devvit, useState } from '@devvit/public-api';
import { Page } from '../components/elements/Page.js';
import type { PageProps } from '../types/page.js';
import { ElementSchema, PageSchema } from '../api/Schema.js';
import { ComponentSelector } from '../components/ComponentSelector.js';
import { ComponentPicker } from '../components/ComponentPicker.js';
import { ComponentManager } from '../components/ComponentManager.js';
import { PersonalPlug } from '../components/elements/PersonalPlug.js';

export const PaginationPage = ({
                                   params,
                                   navigate,
                                   context,
                                   appPost,
                                   isOwner,
                                   postMethods: {
                                       updateAppPost,
                                   },
                               }: PageProps): JSX.Element => {
    const { pageId } = params;
    const [pageStructure, setPageStructure] = useState<PageSchema>(appPost.pages[pageId]);
    const componentManager = new ComponentManager(context, context.postId || '');

    // Component Actions
    const handleAddComponent = (componentType: string) => {
        componentManager.showComponentCreator(componentType, async (newComponent) => {
            try {
                const updatedPage = await componentManager.addComponentToPage(pageId, newComponent);
                setPageStructure(updatedPage as PageSchema);
                context.ui.showToast('Component added successfully!');
            } catch (error) {
                console.error("Error adding component:", error);
                context.ui.showToast('Failed to add component. Please try again.');
            }
        });
    };

    const handleEditComponent = (componentId: string, componentType: string) => {
        if (!pageStructure) {
            context.ui.showToast('Page structure not loaded yet.');
            return;
        }

        const flattenedComponents = componentManager.flattenStructure(pageStructure.children);
        const component = flattenedComponents.find(c => c.id === componentId);

        if (!component) {
            context.ui.showToast('Component not found!');
            return;
        }

        componentManager.showComponentEditor(component, async (updatedComponent) => {
            try {
                const updatedPage = await componentManager.updateComponentOnPage(pageId, updatedComponent);
                setPageStructure(updatedPage as PageSchema);
                context.ui.showToast('Component updated successfully!');
            } catch (error) {
                console.error("Error updating component:", error);
                context.ui.showToast('Failed to update component. Please try again.');
            }
        });
    };

    const handleDeleteComponent = async (componentId: string) => {
        try {
            // Show confirmation dialog
            context.ui.showConfirmation({
                title: 'Delete Component',
                message: 'Are you sure you want to delete this component? This action cannot be undone.',
                confirmLabel: 'Delete',
                cancelLabel: 'Cancel',
                onConfirm: async () => {
                    const updatedPage = await componentManager.deleteComponentFromPage(pageId, componentId);
                    setPageStructure(updatedPage as PageSchema);
                    context.ui.showToast('Component deleted successfully!');
                }
            });
        } catch (error) {
            console.error("Error deleting component:", error);
            context.ui.showToast('Failed to delete component. Please try again.');
        }
    };

    // Create a sub-page with a pagination button that links to it
    const handleCreateSubPage = async () => {
        // Show a form to get the page name
        const pageNameForm = useForm(
            {
                fields: [
                    {
                        name: 'pageName',
                        label: 'Page Name',
                        type: 'string',
                        required: true,
                    }
                ],
                title: 'Create Sub-Page',
                acceptLabel: 'Create',
            },
            async (data) => {
                try {
                    const pageName = data.pageName as string;
                    const newPageId = await componentManager.createNewPageWithButton(pageId, pageName);

                    // Navigate to the new page
                    navigate('pagination', { pageId: newPageId });
                    context.ui.showToast(`New page "${pageName}" created!`);
                } catch (error) {
                    console.error("Error creating new page:", error);
                    context.ui.showToast('Failed to create new page. Please try again.');
                }
            }
        );

        context.ui.showForm(pageNameForm);
    };

    // Action handlers
    const goToHome = () => navigate('home');
    const settingsPage = () => navigate('admin');

    const addNewElement = () => {
        const selector = ComponentSelector({
            onSelect: handleAddComponent
        });
        context.ui.showForm(selector);
    };

    const editPage = () => {
        if (!pageStructure) {
            context.ui.showToast('Page structure not loaded yet.');
            return;
        }

        const flattenedComponents = componentManager.flattenStructure(pageStructure.children);
        const picker = ComponentPicker({
            components: flattenedComponents,
            onSelect: handleEditComponent,
            title: 'Edit Component',
            acceptLabel: 'Edit'
        });
        context.ui.showForm(picker);
    };

    const deleteElementFromPage = () => {
        if (!pageStructure) {
            context.ui.showToast('Page structure not loaded yet.');
            return;
        }

        const flattenedComponents = componentManager.flattenStructure(pageStructure.children);
        const picker = ComponentPicker({
            components: flattenedComponents,
            onSelect: (componentId) => handleDeleteComponent(componentId),
            title: 'Delete Component',
            acceptLabel: 'Delete'
        });
        context.ui.showForm(picker);
    };

    // Page not found handler
    if (!pageStructure) {
        return (
            <Page>
                <Page.Content navigate={navigate} showHomeButton={true}>
                    <vstack alignment="center middle" width={100} height={100} gap="medium">
                        <text size="xlarge" weight="bold">Page Not Found</text>
                        <text size="medium" wrap>The page you're looking for doesn't exist or has been deleted.</text>
                        <button onPress={goToHome} appearance="primary" size="medium" icon="home">
                            Return to Home
                        </button>
                    </vstack>
                </Page.Content>
            </Page>
        );
    }

    // Render the page
    return (
        <Page>
            <Page.Content navigate={navigate} showHomeButton={true}>
                <zstack width={100} alignment="top">
                    {isOwner && (
                        <vstack gap="medium" padding="small" width={100}>
                            <hstack gap="small" alignment="start">
                                <button
                                    onPress={settingsPage}
                                    icon="settings"
                                    size="small"
                                    appearance="primary"
                                ></button>
                                <button
                                    icon="add"
                                    onPress={addNewElement}
                                    appearance="primary"
                                    size="small"
                                ></button>
                                <button
                                    icon="edit"
                                    onPress={editPage}
                                    appearance="primary"
                                    size="small"
                                ></button>
                                <button
                                    icon="delete"
                                    onPress={deleteElementFromPage}
                                    appearance="primary"
                                    size="small"
                                ></button>
                                <button
                                    icon="book"
                                    onPress={handleCreateSubPage}
                                    appearance="primary"
                                    size="small"
                                ></button>
                            </hstack>
                            <text size="xsmall" wrap>Admin controls: Settings, Add, Edit, Delete, Create Page</text>
                        </vstack>
                    )}
                </zstack>

                <vstack alignment="center" width={100} height={100} gap="medium" padding="medium">
                    {pageStructure.children?.length > 0 ? (
                        pageStructure.children.map(component =>
                            componentManager.renderComponent(component, navigate)
                        )
                    ) : (
                        <vstack alignment="center middle" width={80} gap="medium">
                            <text size="large" weight="bold">Empty Page</text>
                            <text size="medium" wrap>This page is currently empty. Click the "+" button above to add your first component.</text>
                            {isOwner && (
                                <button onPress={addNewElement} appearance="primary" size="medium" icon="add">
                                    Add Component
                                </button>
                            )}
                        </vstack>
                    )}
                    <PersonalPlug context={context} />
                </vstack>
            </Page.Content>
        </Page>
    );
};