import {Devvit,  FormKey, useForm} from '@devvit/public-api';
import { ComponentType, FormComponentData } from "../../types/component.js";
import { ALL_ICON_NAMES } from '@devvit/public-api';
import SizeString = Devvit.Blocks.SizeString;

export interface ComponentEditorProps {
    context: Devvit.Context;
    componentType?: string;
    component?: ComponentType;
    onSave: (data: FormComponentData) => void;
    onCancel?: () => void;
}

export const ComponentEditor = ({
                                    context,
                                    componentType,
                                    component,
                                    onSave,
                                    onCancel
                                }: ComponentEditorProps): FormKey => {
    const isEditing = !!component;
    const type = component?.type || componentType;

    if (!type) {
        throw new Error('ComponentEditor requires either a component or componentType');
    }

    // Get the appropriate fields based on the component type
    const fields = getFieldsForComponentType(type, component);
    return useForm(
        {
            fields,
            title: isEditing ? `Edit ${type}` : `Add ${type}`,
            acceptLabel: 'Save',
        },
        async (values) => {
            // Process form data based on component type
            const formData = processFormData(type, values, component?.id);
            onSave(formData);
        }
    );
};

function getFieldsForComponentType(type: string, component?: ComponentType): any[] {
    const defaultValues = component || {};

    switch (type) {
        case 'Text':
            return [
                {
                    name: 'text',
                    label: 'Text',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.text,
                },
                {
                    name: 'style',
                    label: 'Style',
                    type: 'select',
                    options: [
                        { label: 'Body', value: 'body' },
                        { label: 'Metadata', value: 'metadata' },
                        { label: 'Heading', value: 'heading' },
                    ],
                    required: false,
                    defaultValue: defaultValues.style,
                },
                {
                    name: 'size',
                    label: 'Size',
                    type: 'select',
                    options: [
                        { label: 'XSmall', value: 'xsmall' },
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                        { label: 'XLarge', value: 'xlarge' },
                        { label: 'XXLarge', value: 'xxlarge' },
                    ],
                    required: false,
                    defaultValue: defaultValues.size,
                },
                {
                    name: 'weight',
                    label: 'Weight',
                    type: 'select',
                    options: [
                        { label: 'Regular', value: 'regular' },
                        { label: 'Bold', value: 'bold' },
                    ],
                    required: false,
                    defaultValue: defaultValues.weight,
                },
                {
                    name: 'color',
                    label: 'Color',
                    type: 'string',
                    required: false,
                    defaultValue: defaultValues.color,
                },
                {
                    name: 'alignment',
                    label: 'Alignment',
                    type: 'select',
                    options: [
                        { label: 'Top Start', value: 'top start' },
                        { label: 'Top Center', value: 'top center' },
                        { label: 'Top End', value: 'top end' },
                        { label: 'Middle Start', value: 'middle start' },
                        { label: 'Middle Center', value: 'middle center' },
                        { label: 'Middle End', value: 'middle end' },
                        { label: 'Bottom Start', value: 'bottom start' },
                        { label: 'Bottom Center', value: 'bottom center' },
                        { label: 'Bottom End', value: 'bottom end' },
                    ],
                    required: false,
                    defaultValue: defaultValues.alignment,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    required: false,
                    defaultValue: defaultValues.width,
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    required: false,
                    defaultValue: defaultValues.height,
                },
                {
                    name: 'wrap',
                    label: 'Wrap Text',
                    type: 'boolean',
                    defaultValue: defaultValues.wrap,
                },
            ];

        case 'Button':
            return [
                {
                    name: 'text',
                    label: 'Button Text',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.text,
                },
                {
                    name: 'url',
                    label: 'Button URL',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.url,
                },
                {
                    name: 'icon',
                    label: 'Icon',
                    type: 'select',
                    options: ALL_ICON_NAMES.map(icon => ({ label: icon, value: icon })),
                    required: false,
                    defaultValue: defaultValues.icon,
                },
                {
                    name: 'size',
                    label: 'Size',
                    type: 'select',
                    options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                    ],
                    required: true,
                    defaultValue: defaultValues.size || 'medium',
                },
                {
                    name: 'appearance',
                    label: 'Appearance',
                    type: 'select',
                    options: [
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Plain', value: 'plain' },
                        { label: 'Bordered', value: 'bordered' },
                        { label: 'Media', value: 'media' },
                        { label: 'Destructive', value: 'destructive' },
                        { label: 'Caution', value: 'caution' },
                        { label: 'Success', value: 'success' }
                    ],
                    required: true,
                    defaultValue: defaultValues.appearance || 'secondary',
                },
                {
                    name: 'isGrow',
                    label: 'Grow',
                    type: 'boolean',
                    defaultValue: defaultValues.isGrow || false,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    defaultValue: defaultValues.width || '50',
                    required: false
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    defaultValue: defaultValues.height || '50',
                    required: false
                }
            ];

        // Add Image component fields
        case 'Image':
            return [
                {
                    name: 'uploadUrl',
                    label: 'Image URL',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.url,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.width || '100%',
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.height || '100%',
                },
                {
                    name: 'resizeMode',
                    label: 'Resize Mode',
                    type: 'select',
                    options: [
                        { label: 'Fit', value: 'fit' },
                        { label: 'Fill', value: 'fill' },
                        { label: 'Cover', value: 'cover' },
                    ],
                    required: true,
                    defaultValue: defaultValues.resizeMode || 'fit',
                },
                {
                    name: 'imageWidth',
                    label: 'Image Width',
                    type: 'number',
                    required: true,
                    defaultValue: defaultValues.imageWidth || 200,
                },
                {
                    name: 'imageHeight',
                    label: 'Image Height',
                    type: 'number',
                    required: true,
                    defaultValue: defaultValues.imageHeight || 200,
                },
            ];

        // Add Stack component fields (common to VStack, HStack, ZStack)
        case 'VStack':
        case 'HStack':
        case 'ZStack':
            return [
                {
                    name: 'gap',
                    label: 'Gap',
                    type: 'select',
                    options: [
                        { label: 'None', value: 'none' },
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                    ],
                    required: false,
                    defaultValue: defaultValues.gap || 'medium',
                },
                {
                    name: 'alignment',
                    label: 'Alignment',
                    type: 'select',
                    options: [
                        { label: 'Center', value: 'center'},
                        { label: 'Top Start', value: 'top start' },
                        { label: 'Top Center', value: 'top center' },
                        { label: 'Top End', value: 'top end' },
                        { label: 'Middle Start', value: 'middle start' },
                        { label: 'Middle Center', value: 'middle center' },
                        { label: 'Middle End', value: 'middle end' },
                        { label: 'Bottom Start', value: 'bottom start' },
                        { label: 'Bottom Center', value: 'bottom center' },
                        { label: 'Bottom End', value: 'bottom end' },
                    ],
                    required: false,
                    defaultValue: defaultValues.alignment || 'center',
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    defaultValue: defaultValues.width || '100%',
                    required: false
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    required: false,
                    defaultValue: defaultValues.height,
                },
                {
                    name: 'padding',
                    label: 'Padding',
                    type: 'select',
                    options: [
                        { label: 'None', value: 'none' },
                        { label: 'XSmall', value: 'xsmall' },
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                    ],
                    required: false,
                    defaultValue: defaultValues.padding,
                },
                {
                    name: 'backgroundColor',
                    label: 'Background Color',
                    type: 'string',
                    required: false,
                    defaultValue: defaultValues.backgroundColor,
                },
            ];

        case 'PaginationButton':
            return [
                {
                    name: 'text',
                    label: 'Button Text',
                    type: 'string',
                    required: true,
                    defaultValue: defaultValues.text,
                },
                {
                    name: 'icon',
                    label: 'Icon',
                    type: 'select',
                    options: ALL_ICON_NAMES.map(icon => ({ label: icon, value: icon })),
                    required: false,
                    defaultValue: defaultValues.icon,
                },
                {
                    name: 'size',
                    label: 'Size',
                    type: 'select',
                    options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                    ],
                    required: true,
                    defaultValue: defaultValues.size || 'medium',
                },
                {
                    name: 'appearance',
                    label: 'Appearance',
                    type: 'select',
                    options: [
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Plain', value: 'plain' },
                        { label: 'Bordered', value: 'bordered' },
                        { label: 'Media', value: 'media' },
                        { label: 'Destructive', value: 'destructive' },
                        { label: 'Caution', value: 'caution' },
                        { label: 'Success', value: 'success' },
                    ],
                    required: true,
                    defaultValue: defaultValues.appearance || 'secondary',
                },
                {
                    name: 'isGrow',
                    label: 'Grow',
                    type: 'boolean',
                    defaultValue: defaultValues.isGrow || false,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    defaultValue: defaultValues.width || '50',
                    required: false,
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    defaultValue: defaultValues.height || '50',
                    required: false,
                },
            ];

        default:
            return [];
    }
}

function processFormData(
    type: string,
    values: Record<string, any>,
    componentId?: string
): FormComponentData {
    switch (type) {
        case 'Text':
            return {
                type: 'Text',
                text: values.text as string,
                style: values.style ? values.style[0] : undefined,
                size: values.size ? values.size[0] : undefined,
                weight: values.weight ? values.weight[0] : undefined,
                color: values.color as string,
                alignment: values.alignment ? values.alignment[0] : undefined,
                wrap: values.wrap as boolean,
                width: values.width as SizeString,
                height: values.height as SizeString,
            };

        case 'Button':
            return {
                type: 'Button',
                text: values.text as string,
                url: values.url as string,
                icon: values.icon ? values.icon[0] : undefined,
                size: values.size[0],
                appearance: values.appearance[0],
                isGrow: values.isGrow as boolean,
                width: values.width as SizeString,
                height: values.height as SizeString,
            };

        case 'Image':
            return {
                type: 'Image',
                url: values.uploadUrl as string,
                width: values.width as SizeString,
                height: values.height as SizeString,
                resizeMode: values.resizeMode ? values.resizeMode[0] : 'fit',
                imageWidth: values.imageWidth as number,
                imageHeight: values.imageHeight as number,
            };

        case 'VStack':
        case 'HStack':
        case 'ZStack':
            return {
                type: type,
                gap: values.gap ? values.gap[0] : undefined,
                alignment: values.alignment ? values.alignment[0] : undefined,
                width: values.width as SizeString,
                height: values.height as SizeString,
                padding: values.padding ? values.padding[0] : undefined,
                backgroundColor: values.backgroundColor as string,
            };

        case 'PaginationButton':
            return {
                type: 'PaginationButton',
                text: values.text as string,
                pageId: `page-${Math.floor(Math.random() * Date.now()).toString()}`,
                icon: values.icon ? values.icon[0] : undefined,
                size: values.size[0],
                appearance: values.appearance[0],
                isGrow: values.isGrow as boolean,
                width: values.width as SizeString,
                height: values.height as SizeString,
            };

        default:
            throw new Error(`Unknown component type: ${type}`);
    }
}