import { Devvit, useForm, useState } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";
import { Page } from "../components/elements/Page.js";
import type { PageProps, Route, RouteParams } from "../types/page.js";
import { useComponentOperations } from "../hooks/useComponentOperations.js";
import {ComponentSelector} from "../components/ComponentSelector.js";
import {ComponentPicker} from "../components/ComponentPicker.js";


export const HomePage = ({
                            navigate,
                            context,
                            appPost,
                            isOwner,
                            postMethods: { updateAppPost },
                        }: PageProps): JSX.Element => {
    const [pageStructure, setPageStructure] = useState(appPost.home);
    const [formType, setFormType] = useState<"add" | "edit" | "delete" | null>(null);
    const [componentType, setComponentType] = useState<string | null>(null);
    const [componentId, setComponentId] = useState<string | null>(null);

    const {
        componentRenderer,
        handleAddComponent,
        handleDeleteComponent,
        handleEditComponent,
        flattenComponents
    } = useComponentOperations(context, "home", setPageStructure, true);
    const flattenedComponents = flattenComponents(pageStructure.children);

    const settingsPage = () => navigate("admin");
    const navigateAdapter = (route: string, params?: any) => {
        navigate(route as Route, params as RouteParams);
    };

    const addComponentForm = ComponentSelector({
            context,
            setFormType: setFormType,
            setComponentType: setComponentType,
            onSelect: handleAddComponent,
    });

    const editComponentForm = ComponentPicker({
        context,
        setFormType,
        setComponentId,
        setComponentType,
        components: flattenedComponents,
        onSelect: handleEditComponent,
        title: "Edit Component",
        acceptLabel: "Edit",
    })
    if (formType === "add"){
        console.log("Adding form triggered and rendered")
        // TODO: need to setup page as normal, but need to show addComponentForm
        // not sure how to automatically trigger form save logic should be inside of editor
        return (
            <Page>
                <Page.Content navigate={navigate} showHomeButton={false}>
                    <vstack>
                        <text>Filler</text>
                    </vstack>
                </Page.Content>
            </Page>
        )
    } else if ((formType === "edit") && componentId ){
        console.log("Edit form triggered and rendered")
        // might need to fetch some extra stuff here before, maybe grab component and pass to edit form?
        return (
            <Page>
                <Page.Content navigate={navigate} showHomeButton={false}>
                    <vstack>
                        <text>Filler</text>
                    </vstack>
                </Page.Content>
            </Page>
        )
    } else if ((formType === "delete") && componentId ){
        console.log("Delete form triggered and rendered")
        // same as above
        return (
            <Page>
                <Page.Content navigate={navigate} showHomeButton={false}>
                    <vstack>
                        <text>Filler</text>
                    </vstack>
                </Page.Content>
            </Page>
        )
    }
    return (
        <Page>
            <Page.Content navigate={navigate} showHomeButton={false}>
                <vstack alignment="center" width={100} height={100}>
                    <zstack width={100} alignment="middle">
                        <hstack width={100} alignment="center middle">
                            {isOwner && (
                                <hstack gap="small" alignment="start">
                                    <button
                                        onPress={settingsPage}
                                        icon="settings"
                                        size="small"
                                        textColor="green"
                                        appearance="primary"
                                    />
                                    <button
                                        icon="add"
                                        onPress={() => context.ui.showForm(addComponentForm)}
                                        appearance="primary"
                                        size="small"
                                    />
                                    <button
                                        icon="edit"
                                        // onPress={() => showEditForm()}
                                        appearance="primary"
                                        size="small"
                                    />
                                    <button
                                        icon="delete"
                                        // onPress={() => showDeleteForm()}
                                        appearance="primary"
                                        size="small"
                                    />
                                </hstack>
                            )}
                        </hstack>
                    </zstack>
                    {componentRenderer.renderComponents(
                        pageStructure.children as ComponentType[],
                        navigateAdapter
                    )}
                </vstack>
            </Page.Content>
        </Page>
    );
}
