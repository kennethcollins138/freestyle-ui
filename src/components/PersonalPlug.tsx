import { Devvit } from "@devvit/public-api";

type PersonalPlugProps = {
    context: Devvit.Context;
}

export const PersonalPlug = ({ context }: PersonalPlugProps): JSX.Element => {
    return (
        <hstack gap="small" alignment="center bottom" width="100%">
            <icon name="link" onPress={async () => { context.ui.navigateTo('https://www.reddit.com/user/TheRepDeveloper/')}}>Created by /u/TheRepDeveloper</icon>
        </hstack>
    )
};
