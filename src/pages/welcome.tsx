import { Devvit } from '@devvit/public-api';
import type { PageProps } from '../types/page.js';
import { standardizeUsername } from '../util.js';

type StepProps = Pick<PageProps, 'appPost' | 'postMethods' | 'context'> & {
  onPreviousPressed: () => void;
  onNextPressed: () => void;
};

const Step1 = ({ onNextPressed }: StepProps): JSX.Element => {
  return (
    <vstack padding="small">
      <text color="black white" size="large" alignment="top center" weight="bold">
        Set up a Freestyle UI Post!
      </text>
      <spacer size="small" />
      <text color="black white" size="small" alignment="top center" weight="bold">
        Give Mods the power to control the UI for their needs.
      </text>
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

  const colorForm = useForm(
    {
      fields: [
        {
          name: 'light',
          label: 'Color',
          type: 'string',
          defaultValue: appPost.primaryColor.light,
          required: true,
        },
        {
          name: 'dark',
          label: 'Color',
          type: 'string',
          defaultValue: appPost.primaryColor.dark,
          required: true,
        },
      ],
      title: 'Update the Post Color Themes',
      acceptLabel: 'Update',
    },
    async (data) => {
      await updateAppPost({
        primaryColor: {
          ...appPost.primaryColor,
          ...data,
        },
      });
      context.ui.showToast(`${data.light} is your current theme`);
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
    <vstack padding="small">
      <text color="black white" size="large" alignment="top center" weight="bold">
        Customize Your Post Colors
      </text>
      {colorForm}
      <spacer size="medium" />
      {addOwnerForm}
      <vstack alignment="center bottom">
        <button onPress={onNextPressed} size="medium" appearance="primary">
          Next
        </button>
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

  if (appPost.status !== 'draft') {
    navigate('welcome');
    return null;
  }

  if (!isOwner) {
    return <IsNotOwner />;
  }

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
      <Step1
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
}
