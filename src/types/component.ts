import { Devvit, IconName } from '@devvit/public-api';

export type ComponentType = {
    id: string;
    type: string;
    text?: string;
    url?: string;
    pageId?: string;
    icon?: IconName;
    size?: Devvit.Blocks.ButtonSize | Devvit.Blocks.TextSize;
    appearance?: Devvit.Blocks.ButtonAppearance;
    isGrow?: boolean;
    width?: Devvit.Blocks.SizeString;
    height?: Devvit.Blocks.SizeString;
    style?: Devvit.Blocks.TextStyle;
    weight?: Devvit.Blocks.TextWeight;
    color?: string;
    alignment?: Devvit.Blocks.Alignment;
    outline?: Devvit.Blocks.Thickness;
    selectable?: boolean;
    wrap?: boolean;
    overflow?: Devvit.Blocks.TextOverflow;
    resizeMode?: Devvit.Blocks.ImageResizeMode;
    imageWidth?: number;
    imageHeight?: number;
    minWidth?: Devvit.Blocks.SizeString;
    minHeight?: Devvit.Blocks.SizeString;
    maxWidth?: Devvit.Blocks.SizeString;
    maxHeight?: Devvit.Blocks.SizeString;
    gap?: Devvit.Blocks.ContainerGap;
    padding?: Devvit.Blocks.ContainerPadding;
    backgroundColor?: string;
    children?: ComponentType[];
    action?: {
        type: 'navigate' | 'custom';
        targetPageId?: string;
        customAction?: string;
    };
    order?: number;
};

export type FormComponentData = Omit<ComponentType, 'id' | 'children'>;