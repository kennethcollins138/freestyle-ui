import { Devvit, useState } from '@devvit/public-api';
import { ImageElementSchema } from '../../api/Schema.js';

export const ImageElement = ({
                               url,
                               width = '100%',
                               height = 'auto',
                               resizeMode = 'fit',
                               imageWidth = 1024,
                               imageHeight = 768,
                               minWidth,
                               minHeight,
                               maxWidth,
                               maxHeight,
                             }: ImageElementSchema): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Basic URL validation
  const isValidUrl = typeof url === 'string' && url.trim().length > 0;

  // Handle loading state while image is loading
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle error state if image fails to load
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If no valid URL is provided, show placeholder
  if (!isValidUrl) {
    return (
        <vstack
            width={width}
            height={height}
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
          width={width}
          height={height}
          {...(minWidth ? { minWidth } : {})}
          {...(minHeight ? { minHeight } : {})}
          {...(maxWidth ? { maxWidth } : {})}
          {...(maxHeight ? { maxHeight } : {})}
      >
        {/* The actual image */}
        <image
            url={url}
            width={width}
            height={height}
            resizeMode={resizeMode}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            onLoad={handleLoad}
            onError={handleError}
        />

        {/* Loading state overlay */}
        {/*{isLoading && (*/}
        {/*    <vstack*/}
        {/*        width="100%"*/}
        {/*        height="100%"*/}
        {/*        backgroundColor="rgba(0,0,0,0.1)"*/}
        {/*        alignment="center middle"*/}
        {/*    >*/}
        {/*      <text color="#888888">Loading image...</text>*/}
        {/*    </vstack>*/}
        {/*)}*/}

        {/*/!* Error state overlay *!/*/}
        {/*{hasError && (*/}
        {/*    <vstack*/}
        {/*        width="100%"*/}
        {/*        height="100%"*/}
        {/*        backgroundColor="#f8d7da"*/}
        {/*        alignment="center middle"*/}
        {/*    >*/}
        {/*      <text color="#721c24">Failed to load image</text>*/}
        {/*      <text size="small" color="#721c24">{url.substring(0, 30)}...</text>*/}
        {/*    </vstack>*/}
        {/*)}*/}
      </zstack>
  );
};