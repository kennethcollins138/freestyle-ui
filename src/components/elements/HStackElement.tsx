import { Devvit } from '@devvit/public-api';

type HStackProps = {
  children?: JSX.Element | JSX.Element[];
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
};

export const HStackElement = ({
  children,
  gap = "medium",
  alignment = "center",
  width = "100%",
  height,
  padding,
  backgroundColor
}: HStackProps): JSX.Element => {
  return (
    <hstack
      gap={gap}
      alignment={alignment}
      width={width}
      height={height}
      padding={padding}
      backgroundColor={backgroundColor}
    >
      {children}
    </hstack>
  );
};
