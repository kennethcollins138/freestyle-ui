import { Devvit } from "@devvit/public-api";

type HStackProps = {
  key: string;
  children?: JSX.Element | JSX.Element[];
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
};

export const HStackElement = ({
  key,
  children,
  gap = "medium",
  alignment = "center",
  width = "100%",
  height,
  padding,
  backgroundColor,
}: HStackProps): JSX.Element => {
  return (
    <hstack
      key={key}
      gap={gap}
      alignment={alignment as Devvit.Blocks.Alignment}
      width={width as Devvit.Blocks.SizeString}
      height={height}
      padding={padding}
      backgroundColor={backgroundColor}
    >
      {children}
    </hstack>
  );
};
