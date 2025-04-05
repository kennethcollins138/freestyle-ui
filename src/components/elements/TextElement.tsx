import { Devvit } from "@devvit/public-api";

type TextElementProps = {
  key: string;
  text: string;
  style?: Devvit.Blocks.TextStyle;
  size?: Devvit.Blocks.TextSize;
  weight?: Devvit.Blocks.TextWeight;
  color?: string;
  alignment?: Devvit.Blocks.Alignment;
  outline?: Devvit.Blocks.Thickness;
  selectable?: boolean;
  wrap?: boolean;
  overflow?: Devvit.Blocks.TextOverflow;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
};

export const TextElement = ({
  text,
  style,
  size,
  weight,
  color,
  alignment,
  outline,
  selectable,
  wrap,
  overflow,
  width,
  height,
}: TextElementProps): JSX.Element => {
  return (
    <text
      style={style}
      size={size}
      weight={weight}
      color={color}
      alignment={alignment}
      outline={outline}
      {...(selectable && { selectable: true })}
      {...(wrap && { wrap: true })}
      overflow={overflow}
      width={width}
      height={height}
    >
      {text}
    </text>
  );
};
