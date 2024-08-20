import { Devvit } from '@devvit/public-api';

type ImageElementProps = {
  url: string;
  width: Devvit.Blocks.SizeString;
  height: Devvit.Blocks.SizeString;
  resizeMode: Devvit.Blocks.ImageResizeMode;
  imageWidth: number;
  imageHeight: number;
};

export const ImageElement = ({
  url,
  width,
  height,
  resizeMode,
  imageWidth = 1024,
  imageHeight = 150,
}: ImageElementProps): JSX.Element => {
  console.log("Rendering Image with URL:", url);

  return (
    <image
      url={url}
      width={width}
      height={height}
      resizeMode={resizeMode}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
    />
  );
};
