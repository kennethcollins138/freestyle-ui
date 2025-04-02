import { Devvit } from '@devvit/public-api';
import { ComponentType } from '../api/Schema.js';
import { VStackElement } from './elements/VStackElement.js';
import { HStackElement } from './elements/HStackElement.js';
import { ZStackElement } from './elements/ZStackElement.js';
import { TextElement } from './elements/TextElement.js';
import { ImageElement } from './elements/ImageElement.js';

export interface ComponentRendererProps {
    components: ComponentType[];
    navigate?: (route: string, params?: Record<string, string>) => void;
    context: Devvit.Context;
}

export const createComponentRenderer = (props: ComponentRendererProps) => {
    const { components, navigate, context } = props;

    const renderComponent = (component: ComponentType): JSX.Element | null => {
        if (!component.type) {
            console.error('Component type is undefined for component:', component);
            return null;
        }

        switch (component.type) {
            case 'VStack':
                return (
                    <VStackElement key={component.id} {...component}>
                        {component.children?.map(renderComponent)}
                    </VStackElement>
                );
            case 'HStack':
                return (
                    <HStackElement key={component.id} {...component}>
                        {component.children?.map(renderComponent)}
                    </HStackElement>
                );
            case 'ZStack':
                return (
                    <ZStackElement key={component.id} {...component}>
                        {component.children?.map(renderComponent)}
                    </ZStackElement>
                );
            case 'Image':
                return (<ImageElement key={component.id} {...component} />);
            case 'Text':
                return (<TextElement key={component.id} {...component} />);
            case 'Button':
                return (
                    <button
                        key={component.id}
                        icon={component.icon}
                        size={component.size}
                        appearance={component.appearance}
                        onPress={async () => context.ui.navigateTo(component.url)}
                        {...(component.width ? { width: component.width } : {})}
                        {...(component.height ? { height: component.height } : {})}
                        {...(component.isGrow ? { grow: true } : {})}
                    >
                        {component.text}
                    </button>
                );
            case 'PaginationButton':
                if (navigate) {
                    return (
                        <button
                            key={component.id}
                            icon={component.icon}
                            size={component.size}
                            appearance={component.appearance}
                            onPress={async () => navigate('pagination', { pageId: component.pageId })}
                            {...(component.width ? { width: component.width } : {})}
                            {...(component.height ? { height: component.height } : {})}
                            {...(component.isGrow ? { grow: true } : {})}
                        >
                            {component.text}
                        </button>
                    );
                }
                return null;
            default:
                console.error('Unknown component type encountered during rendering:', component.type);
                return null;
        }
    };

    return {
        renderComponent,
        renderComponents: () => components.map(renderComponent)
    };
};