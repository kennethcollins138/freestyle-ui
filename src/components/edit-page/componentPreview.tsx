import { Devvit } from "@devvit/public-api";
import { ComponentType, StackSchema } from "../../api/Schema.js";

type ComponentPreviewProps = {
    key : string;
    component: ComponentType;
    onDelete: () => void;
    onDrag: () => void;
    onEdit: () => void;
    onAdd?: () => void;
    onDropDown?: () => void;
};

export const ComponentPreview = (props: ComponentPreviewProps): JSX.Element => {
    function isStackComponent(component: ComponentType): component is StackSchema {
        return (
            component.type === "VStack" ||
            component.type === "HStack" ||
            component.type === "ZStack"
        );
    }

    return (
        <vstack width="100%">
            <hstack width="100%">
                {/* drag and drop*/}
                <button onPress={props.onDrag} size="small" icon="drag" />
                {/* edit specific component*/}
                <button onPress={props.onEdit} size="small" icon="edit" />
                {/* TODO: add nicknames to component*/}
                <text>{props.component.id}</text>

                {isStackComponent(props.component) && (
                    <>
                        <button onPress={props.onAdd} size="small" icon="add" />
                        <button onPress={props.onDropDown} size="small" icon="caret-down" />
                    </>
                )}

                <button onPress={props.onDelete} size="small" icon="delete" />
            </hstack>
            {/* Layer the children further out*/}
            <vstack width="90%">
                {isStackComponent(props.component) &&
                    props.component.children.map((child) => (
                        <ComponentPreview
                            key={child.id}
                            component={child}
                            onDelete={props.onDelete}
                            onDrag={props.onDrag}
                            onEdit={props.onEdit}
                            onAdd={props.onAdd}
                            onDropDown={props.onDropDown}
                        />
                    ))}
            </vstack>
        </vstack>
    );
};
