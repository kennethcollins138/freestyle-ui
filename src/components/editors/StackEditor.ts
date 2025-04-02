import { Devvit, useForm } from '@devvit/public-api';
import { ComponentType } from '../../types/component.js';

export const createStackEditor = (
    context: Devvit.Context,
    stackType: string,
    component?: ComponentType,
    onSave?: (data: any) => void
) => {
    return useForm(
        {
            fields: [
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
                    defaultValue: component?.gap || 'medium',
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
                    defaultValue: component?.alignment || 'center',
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    defaultValue: component?.width || '100%',
                    required: false
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    required: false,
                    defaultValue: component?.height,
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
                    defaultValue: component?.padding,
                },
                {
                    name: 'backgroundColor',
                    label: 'Background Color',
                    type: 'string',
                    required: false,
                    defaultValue: component?.backgroundColor,
                },
            ],
            title: component ? `Edit ${stackType}` : `Add ${stackType}`,
            acceptLabel: 'Save',
        },
        async (values) => {
            const formData = {
                type: stackType,
                gap: values.gap ? values.gap[0] : undefined,
                alignment: values.alignment ? values.alignment[0] : undefined,
                width: values.width as string,
                height: values.height as string,
                padding: values.padding ? values.padding[0] : undefined,
                backgroundColor: values.backgroundColor as string,
            };

            if (onSave) onSave(formData);
        }
    );
};