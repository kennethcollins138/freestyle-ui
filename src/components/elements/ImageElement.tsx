import { Devvit } from "@devvit/public-api";
import { ImageElementSchema } from "../../api/Schema.js";
import SizeString = Devvit.Blocks.SizeString;

type ImageProps = Devvit.Blocks.ImageProps;

export const ImageElement = ({
  key,
  url,
  width = "100%",
  height = "100%",
  resizeMode = "fit",
  imageWidth = 1024,
  imageHeight = 768,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
}: ImageProps): JSX.Element => {
  // Basic URL validation
  const isValidUrl = url.trim().length > 0;

  // If no valid URL is provided, show placeholder
  if (!isValidUrl) {
    return (
      <vstack
        width={width as SizeString}
        height={height as SizeString}
        backgroundColor="#f0f0f0"
        alignment="center middle"
      >
        <text>No image URL provided</text>
      </vstack>
    );
  }

  // Render the image with loading/error states
  return (
    <zstack
      width={width as SizeString}
      height={height as SizeString}
      minWidth={minWidth as SizeString}
      minHeight={minHeight as SizeString}
      maxWidth={maxWidth as SizeString}
      maxHeight={maxHeight as SizeString}
    >
      <image
        key={key}
        url={url}
        width={width as SizeString}
        height={height as SizeString}
        resizeMode={resizeMode}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
      />
    </zstack>
  );
};
