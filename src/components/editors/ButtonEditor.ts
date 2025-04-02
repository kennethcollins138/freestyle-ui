import { Devvit, useForm } from '@devvit/public-api';
import { ALL_ICON_NAMES } from '@devvit/public-api';
import { ComponentType } from '../../types/component.js';

export const createButtonEditor = (
    context: Devvit.Context,
    component?: ComponentType,
    onSave?: (data: any) => void
) => {
    return useForm(
        {
            fields: [
                {
                    name: 'text',
                    label: 'Button Text',
                    type: 'string',
                    required: true,
                    defaultValue: component?.text,
                },
                {
                    name: 'url',
                    label: 'Button URL',
                    type: 'string',
                    required: true,
                    defaultValue: component?.url,
                },
                {
                    name: 'icon',
                    label: 'Icon',
                    type: 'select',
                    options: ALL_ICON_NAMES.map(icon => ({ label: icon, value: icon })),
                    required: false,
                    defaultValue: component?.icon,
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
                    defaultValue: component?.size || 'medium',
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
                    defaultValue: component?.appearance || 'secondary',
                },
                {
                    name: 'isGrow',
                    label: 'Grow',
                    type: 'boolean',
                    defaultValue: component?.isGrow || false,
                },
                {
                    name: 'width',
                    label: 'Width',
                    type: 'string',
                    defaultValue: component?.width || '50',
                    required: false
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'string',
                    defaultValue: component?.height || '50',
                    required: false
                }
            ],
            title: component ? 'Edit Button' : 'Add Button',
            acceptLabel: 'Save',
        },
        async (values) => {
            const formData = {
                type: 'Button',
                text: values.text as string,
                url: values.url as string,
                icon: values.icon ? values.icon[0] : undefined,
                size: values.size[0],
                appearance: values.appearance[0],
                isGrow: values.isGrow as boolean,
                width: values.width as string,
                height: values.height as string,
            };

            if (onSave) onSave(formData);
        }
    );
};