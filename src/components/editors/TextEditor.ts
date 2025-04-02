import { Devvit, useForm } from '@devvit/public-api';
import { ComponentType } from '../../types/component.js';

export const createTextEditor = (
    context: Devvit.Context,
    component?: ComponentType,
    onSave?: (data: any) => void
) => {
    return useForm(
        {
            fields: [
                {
                    name: 'text',
                    label: 'Text',
                    type: 'string',
                    required: true,
                    defaultValue: component?.text,
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
                    defaultValue: component?.style,
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
                    defaultValue: component?.size,
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
                    defaultValue: component?.weight,
                },
                {
                    name: 'color',
                    label: 'Color',
                    type: 'string',
                    required: false,
                    defaultValue: component?.color,
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
                    defaultValue: component?.alignment,
                },
                {
                    name: 'wrap',
                    label: 'Wrap Text',
                    type: 'boolean',
                    defaultValue: component?.wrap || false,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    required: false,
                    defaultValue: component?.width,
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    required: false,
                    defaultValue: component?.height,
                },
            ],
            title: component ? 'Edit Text' : 'Add Text',
            acceptLabel: 'Save',
        },
        async (values) => {
            const formData = {
                type: 'Text',
                text: values.text as string,
                style: values.style ? values.style[0] : undefined,
                size: values.size ? values.size[0] : undefined,
                weight: values.weight ? values.weight[0] : undefined,
                color: values.color as string,
                alignment: values.alignment ? values.alignment[0] : undefined,
                wrap: values.wrap as boolean,
                width: values.width as string,
                height: values.height as string,
            };

            if (onSave) onSave(formData);
        }
    );
};