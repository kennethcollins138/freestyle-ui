import { Devvit } from "@devvit/public-api";

type VStackProps = {
  key : string;
  children?: JSX.Element | JSX.Element[];
  gap?: Devvit.Blocks.ContainerGap;
  alignment?: Devvit.Blocks.Alignment;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  padding?: Devvit.Blocks.ContainerPadding;
  backgroundColor?: string;
};

export const VStackElement = ({
  key,
  children,
  gap = "medium",
  alignment = "center",
  width = "100%",
  height,
  padding,
  backgroundColor,
}: VStackProps): JSX.Element => {
  return (
    <vstack
      key={key}
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
