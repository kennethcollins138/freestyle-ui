import { Devvit } from "@devvit/public-api";
import { ComponentType, StackSchema } from "../api/Schema.js";

type ComponentPreviewProps = {
    key: string;
    component: ComponentType;
    onDelete: () => void;
    onDrag: () => void;
    onEdit: () => void;
    onAdd?: () => void;
    onDropDown?: () => void;
    depth?: number;
};

export const ComponentPreview = (props: ComponentPreviewProps): JSX.Element => {
    const depth = props.depth || 0;
    const indentPadding = `${depth * 8}px`; // Increase indent based on depth

    function isStackComponent(component: ComponentType): component is StackSchema {
        return (
            component.type === "VStack" ||
            component.type === "HStack" ||
            component.type === "ZStack"
        );
    }

    // Get a color based on component type for visual identification
    // FIX: colors are currently too distracting find a better method
    // Makes text hard to read
    function getComponentColor(componentType: string): string {
        switch(componentType) {
            case "VStack": return "#f0e68c"; // Light yellow
            case "HStack": return "#add8e6"; // Light blue
            case "ZStack": return "#98fb98"; // Light green
            case "Text": return "#d8bfd8";   // Light purple
            case "Button": return "#ffa07a"; // Light salmon
            case "Image": return "#87cefa";  // Light sky blue
            default: return "#d3d3d3";       // Light gray
        }
    }

    return (
        <vstack width="100%" padding={`small`}>
            <hstack
                width="100%"
                padding="xsmall"
                gap="small"
                backgroundColor={getComponentColor(props.component.type)}
                cornerRadius="medium"
            >
                {/* Component type indicator */}
                <text size="small" weight="bold" color={"black"}>{props.component.type}</text>

                {/* Component ID */}
                <text size="small" weight="regular" color={"black"} grow>{props.component.id}</text>

                {/* Action buttons group */}
                <hstack gap="small">
                    <button onPress={props.onDrag} size="small" icon="drag" appearance="plain" />
                    <button onPress={props.onEdit} size="small" icon="edit" appearance="plain" />
                    <button onPress={props.onDelete} size="small" icon="delete" appearance="plain" />

                    {isStackComponent(props.component) && (
                        <>
                            <button onPress={props.onAdd} size="small" icon="add" appearance="plain" />
                            <button onPress={props.onDropDown} size="small" icon="caret-down" appearance="plain" />
                        </>
                    )}
                </hstack>
            </hstack>

            {/* Children section with connection lines */}
            {isStackComponent(props.component) && props.component.children.length > 0 && (
                <vstack width="100%" padding="small">
                    {/* Visual connector line */}
                    {props.component.children.length > 0 && (
                        <vstack width="2px" height="8px" backgroundColor="#000000" alignment="start" />
                    )}

                    {/* Render children */}
                    {props.component.children.map((child) => (
                        <ComponentPreview
                            key={child.id}
                            component={child}
                            onDelete={props.onDelete}
                            onDrag={props.onDrag}
                            onEdit={props.onEdit}
                            onAdd={props.onAdd}
                            onDropDown={props.onDropDown}
                            depth={depth + 1}
                        />
                    ))}
                </vstack>
            )}
        </vstack>
    );
};
