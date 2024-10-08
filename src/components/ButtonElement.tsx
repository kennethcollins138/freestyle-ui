import { Devvit, IconName } from '@devvit/public-api';

export type CustomButtonProps = {
  icon?: IconName;
  size: Devvit.Blocks.ButtonSize;
  appearance: Devvit.Blocks.ButtonAppearance;
  isGrow?: boolean;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  text: string;
  url: string;
  context: Devvit.Context;
};

export const CustomButton = ({ 
  icon, 
  size='medium', 
  appearance='secondary', 
  isGrow, 
  width=50, 
  height=50, 
  text, 
  url, 
  context
}: CustomButtonProps): JSX.Element => {
  return (
    <button
      icon={icon}
      size={size}
      appearance={appearance}
      onPress={async () => {
        context.ui.navigateTo(url);
      }}
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      {...(isGrow ? { grow: true } : {})}
    >
      {text}
    </button>
  );
};
