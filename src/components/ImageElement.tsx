import { Devvit } from '@devvit/public-api';

type ImageElementProps = {
  url: string;
  width: Devvit.Blocks.SizeString;
  height: Devvit.Blocks.SizeString;
  resizeMode: Devvit.Blocks.ImageResizeMode;
  imageWidth: number;
  imageHeight: number;
};

export const ImageElement = ({ url, width, height, resizeMode,imageWidth, imageHeight }: ImageElementProps): JSX.Element => {
  return (
    <image
      url={url}
      imageWidth={1024}
      imageHeight={150}
      width={width}
      height={height}
      resizeMode={resizeMode}
    />
  );
};

  