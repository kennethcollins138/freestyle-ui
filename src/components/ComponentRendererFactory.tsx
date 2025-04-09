import { Devvit } from "@devvit/public-api";
import { ComponentType, ElementSchema } from "../api/Schema.js";
import { VStackElement } from "./elements/VStackElement.js";
import { HStackElement } from "./elements/HStackElement.js";
import { ZStackElement } from "./elements/ZStackElement.js";
import { TextElement } from "./elements/TextElement.js";
import { ImageElement } from "./elements/ImageElement.js";
import { PersonalPlug } from "./elements/PersonalPlug.js";

export interface RenderOptions {
  navigate?: (route: string, params?: Record<string, string>) => void;
}

export class ComponentRenderer {
  private readonly context: Devvit.Context;
  private readonly options: RenderOptions;

  constructor(context: Devvit.Context, options: RenderOptions = {}) {
    this.context = context;
    this.options = options;
  }

  renderComponent = (component: ElementSchema): JSX.Element | null => {
    if (!component.type) {
      console.error("Component type is undefined for component:", component);
      return null;
    }

    switch (component.type) {
      case "VStack":
        return (
          <VStackElement key={component.id} {...component}>
            {component.children?.map((child: ComponentType) =>
              this.renderComponent(child),
            )}
          </VStackElement>
        );
      case "HStack":
        return (
          <HStackElement key={component.id} {...component}>
            {component.children?.map((child: ComponentType) =>
              this.renderComponent(child),
            )}
          </HStackElement>
        );
      case "ZStack":
        return (
          <ZStackElement key={component.id} {...component}>
            {component.children?.map((child: ComponentType) =>
              this.renderComponent(child),
            )}
          </ZStackElement>
        );
      case "Image":
        return <ImageElement key={component.id} {...component} />;
      case "Text":
        return <TextElement key={component.id} {...component} />;
      case "Button":
        const buttonSize = component.size as Devvit.Blocks.ButtonSize;
        return (
          <button
            key={component.id}
            icon={component.icon}
            size={buttonSize}
            appearance={component.appearance}
            onPress={async () => {
              if (component.url) {
                this.context.ui.navigateTo(component.url);
              } else {
                console.error("Button has no URL:", component);
                this.context.ui.showToast("This button has no URL");
              }
            }}
            {...(component.width ? { width: component.width } : {})}
            {...(component.height ? { height: component.height } : {})}
            {...(component.isGrow ? { grow: true } : {})}
          >
            {component.text}
          </button>
        );
      case "PaginationButton":
        const { navigate } = this.options;
        const paginationButtonSize = component.size as Devvit.Blocks.ButtonSize;
        if (navigate && component.pageId) {
          return (
            <button
              key={component.id}
              icon={component.icon}
              size={paginationButtonSize}
              appearance={component.appearance}
              onPress={async () =>
                navigate("pagination", { pageId: component.pageId })
              }
              {...(component.width ? { width: component.width } : {})}
              {...(component.height ? { height: component.height } : {})}
              {...(component.isGrow ? { grow: true } : {})}
            >
              {component.text}
            </button>
          );
        }
        return null;
      case "PersonalPlug":
        return <PersonalPlug context={this.context} />;
      default:
        console.error("Unknown component type:", component.type);
        return null;
    }
  };

  renderComponents = (
    components: ElementSchema[],
    navigateFunction?: (route: string, params?: Record<string, string>) => void,
  ): JSX.Element[] => {
    return components.map((component) => {
      // If navigation is provided, create a temporary renderer with it
      if (navigateFunction) {
        const tempRenderer = new ComponentRenderer(this.context, {
          navigate: navigateFunction,
        });
        return tempRenderer.renderComponent(component);
      }

      // Otherwise use this instance
      return this.renderComponent(component);
    });
  };
}
