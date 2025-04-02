import { Devvit } from '@devvit/public-api';

type VStackProps = {
  children?: JSX.Element | JSX.Element[];
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
};

export const VStackElement = ({
  children,
  gap = "medium",
  alignment = "center",
  width = "100%",
  height,
  padding,
  backgroundColor
}: VStackProps): JSX.Element => {
  return (
    <vstack
      gap={gap}
      alignment={alignment}
      width={width}
      height={height}
      padding={padding}
      backgroundColor={backgroundColor}
    >
      {children}
    </vstack>
  );
};
