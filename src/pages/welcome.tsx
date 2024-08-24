import { Devvit } from '@devvit/public-api';
import type { PageProps } from '../types/page.js';
import { standardizeUsername } from '../util.js';

type StepProps = Pick<PageProps, 'appPost' | 'postMethods' | 'context'> & {
  onPreviousPressed: () => void;
  onNextPressed: () => void;
};

const Step1 = ({ onNextPressed }: StepProps): JSX.Element => {
  console.log('Rendering Step1');
  return (
    <vstack padding="small" alignment="center middle">
      <text color="black white" size="large" alignment="top center" weight="bold">
        Set up a Freestyle UI Post!
      </text>
      <spacer size="small" />
      <text color="black white" size="small" alignment="top center" weight="bold">
        Give Mods the power to control the UI for their needs.
      </text>
      <spacer size="small" />
      <vstack alignment="center bottom">
        <button onPress={onNextPressed} size="medium" appearance="primary">
          Get Started
        </button>
      </vstack>
    </vstack>
  );
};

const Step2 = ({
  onNextPressed,
  appPost,
  context,
  postMethods: { updateAppPost },
}: StepProps): JSX.Element => {
  const { useForm } = context;

  // Hooks are declared at the top level
  const colorForm = useForm(
    {
      fields: [
        {
          name: 'light',
          label: 'Light Color',
          type: 'string',
          defaultValue: appPost.color.light,
          required: true,
        },
        {
          name: 'dark',
          label: 'Dark Color',
          type: 'string',
          defaultValue: appPost.color.dark,
          required: true,
        },
      ],
      title: 'Update the Post Color Themes',
      acceptLabel: 'Update',
    },
    async (data) => {
      await updateAppPost({
        color: {
          light: data['light'],
          dark: data['dark']
        },
      });
    }
  );

  const addOwnerForm = useForm(
    {
      fields: [
        {
          name: 'newOwner',
          label: 'Add user',
          type: 'string',
          required: true,
        },
      ],
      title: 'Add additional post owners',
      acceptLabel: 'Submit',
    },
    async (data) => {
      const { reddit } = context;

      const subname = await (await reddit.getSubredditById(context.subredditId!)).name;
      const submittedUserName = data.newOwner as string;
      const newOwner = standardizeUsername(submittedUserName);

      if (appPost.owners.includes(newOwner)) {
        context.ui.showToast(`${newOwner} is already an owner!`);
        return;
      }

      await updateAppPost({
        owners: [...appPost.owners, newOwner],
      });

      await reddit.sendPrivateMessage({
        to: newOwner,
        subject: "You've been added to a Community Hub",
        text: `You can now manage the ${subname} hub here: ${appPost.url}`,
      });
      context.ui.showToast(`u/${newOwner} is now a post owner!`);
    }
  );

  return (
    <vstack>
      <vstack padding="small">
        <text color="black white" size="large" alignment="top center" weight="bold">
          Make it your own
        </text>
        <spacer size="small" />
        <text color="black white" size="small" alignment="top center" weight="bold">
          You can do this later, too!
        </text>
      </vstack>
      <zstack>
        <vstack cornerRadius="large" width={100} height={100} alignment="middle center">
          <image url="squirtle-sax.gif" imageWidth={175} imageHeight={175} resizeMode="fit" />
        </vstack>
        <hstack alignment="middle end" width={100} height={100} padding="small">
          <button
            onPress={onNextPressed}
            size="large"
            icon="caret-right"
            appearance="primary"
          ></button>
        </hstack>
      </zstack>
      <vstack alignment="center">
        <hstack>
          <button
            onPress={() => context.ui.showForm(colorForm)}
            icon="topic-art"
            appearance="plain"
          >
            Color
          </button>
          <spacer size="small" />
          
          <spacer size="small" />
          <button onPress={() => context.ui.showForm(addOwnerForm)} icon="mod" appearance="plain">
            Owners
          </button>
        </hstack>
      </vstack>
    </vstack>
    
  );
};

const Step3 = ({
  postMethods: { updateAppPost },
  onNextPressed,
}: StepProps): JSX.Element => {
  return (
    <vstack padding="small" width={100} height={100}>
      <text color="black white" size="large" alignment="top center" weight="bold">
        Almost Done
      </text>
      <vstack gap="small" padding="medium">
        <text color="black white" size="medium" wrap>
          Post Owners can edit this post whenever. Make sure to read Devvit documentation
          to understand how each element works, but you can customize your post to any of your needs!
        </text>
        <text color="black white" size="medium" wrap>
          You are able to have multiple posts with the current config, but make sure to delete unused posts.
          You are limited on the amount of storage this bot has!
        </text>
        <text color="black white" size="medium" wrap>
          Important note for Images: Image uploads work for jpeg as of now.
          With that, Image uploads will only appear inside of vstacks and ztacks.
          Hstack implementation does not work as expected and will be fixed in future!
        </text>
        <text color="black white" size="medium" wrap>
          Upcoming Feature: Get ready for seamless navigation with our new pagination support, allowing multiple pages within a single post!
        </text>
        <text color="black white" size="medium" wrap>
          For any questions, feel free to message u/TheRepDeveloper!
          This app was fully inspired by Community Hub. Check out their app as well!
        </text>
      </vstack>
      <vstack grow alignment="bottom center">
        <button
          onPress={async () => {
            await updateAppPost({ status: 'live' });
            onNextPressed();
          }}
          appearance="primary"
        >
          Got it
        </button>
      </vstack>
    </vstack>
  );
};

const IsNotOwner = (): JSX.Element => {
  console.log('Rendering IsNotOwner');
  return <text color="black white">Post is getting ready for launch...</text>;
};

export const WelcomePage = ({
  context,
  navigate,
  appPost,
  postMethods,
  isOwner,
}: PageProps): JSX.Element => {
  const { useState } = context;
  const [step, setStep] = useState(1);

  console.log('WelcomePage - appPost status:', appPost.status);
  console.log('WelcomePage - isOwner:', isOwner);

  if (appPost.status !== 'draft') {
    console.log('Navigating to home');
    navigate('home');
    return null;
  }

  if (!isOwner) {
    return <IsNotOwner />;
  }

  console.log('Rendering WelcomePage step:', step);

  if (step === 1) {
    return (
      <Step1
        onNextPressed={() => setStep(2)}
        onPreviousPressed={() => setStep(1)}
        context={context}
        appPost={appPost}
        postMethods={postMethods}
      />
    );
  }
  if (step === 2) {
    return (
      <Step2
        onNextPressed={() => setStep(3)}
        onPreviousPressed={() => setStep(1)}
        context={context}
        appPost={appPost}
        postMethods={postMethods}
      />
    );
  }
  if (step === 3) {
    return (
      <Step3
        onNextPressed={() => {
          navigate('home');
        }}
        onPreviousPressed={() => setStep(2)}
        context={context}
        appPost={appPost}
        postMethods={postMethods}
      />
    );
  }

  return null;
};
