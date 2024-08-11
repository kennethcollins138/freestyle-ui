import { Devvit } from '@devvit/public-api';
import { Page } from '../components/Page.js';
import type { PageProps } from '../types/page.js';

export const AdminPage = ({
  navigate,
  context,
  appPost,
  isOwner,
  currentUserUsername,
  postMethods: {
    updateAppPost, updateAppElement,
    addElement, clonePost,
    deleteNode, readWholePage
  },
}: PageProps): JSX.Element => { 
  const { useForm } = context;

  const colorForm = useForm(
    {
      fields: [
        {
          name: 'Light Mode',
          label: `Light Mode Color`,
          type: 'string',
          defaultValue: appPost.color.light,
        },
        {
          name: 'Dark Mode',
          label: `Dark Mode Color`,
          type: 'string',
          defaultValue: appPost.color.dark,
        },
      ],
      title: 'Update the Post Color',
      acceptLabel: 'Update',
    },
    async (data) => {
      await updateAppPost({
        color: {
          light: data['Light Mode'],
          dark: data['Dark Mode']
        },
      });
    }
  );

  const modifyOwnerForm = context.useForm(
    {
      fields: [
        {
          name: 'nameAdd',
          label: `Add user`,
          type: 'string',
        },
        {
          name: 'nameRemove',
          label: `Remove user`,
          type: 'string',
        },
      ],
      title: 'Who can manage this post?',
      acceptLabel: 'Submit',
    },
    async (data) => {
      const { reddit } = context;
      const addData = data.nameAdd as string;
      const removeData = data.nameRemove as string;

      const newOwners = new Set([...appPost.owners]);

      const subname = await (await reddit.getSubredditById(context.subredditId!)).name;
      if (addData) {
        const add = addData;
        if (newOwners.has(add)) {
          context.ui.showToast(`${add} is already an owner!`);
          return;
        }

        await reddit.sendPrivateMessage({
          to: add,
          subject: "You've been added to a Community Hub",
          text: `You can now manage the ${subname} pinned post here: ${appPost.url}`,
        });
        context.ui.showToast(`${add} is now a post owner!`);
        newOwners.add(add);
      }

      if (removeData) {
        const remove = removeData;
        if (newOwners.size < 2) {
          context.ui.showToast(`You must have 1 post owner`);
          return;
        }

        context.ui.showToast(`${remove} can no longer manage this post`);
        newOwners.delete(remove);
      }

      await updateAppPost({
        owners: [...newOwners],
      });
    }
  );

  const deleteConfirm = context.useForm(
    {
      fields: [
        {
          name: 'confirm',
          label: `Write "DELETE" to confirm`,
          type: 'string',
        },
      ],
      title: 'Are you sure you want to delete this post?',
      acceptLabel: 'Delete',
    },
    async (data) => {
      const { reddit, ui } = context;
      const postId = context.postId;
      if (!postId) {
        ui.showToast(`failed to delete post: no postId`);
        return;
      }
      const confirm = data.confirm || '';
      if (confirm === 'DELETE') {
        try {
          await (await reddit.getPostById(postId)).delete();
          ui.showToast(`Post successfully deleted`);
        } catch (e) {
          ui.showToast(`failed to delete post: ${e}`);
        }
      } else {
        ui.showToast(`You must write "DELETE" to remove the post`);
      }
    }
  );

  const addColor: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(colorForm);
  };

  const deletePInfo: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(deleteConfirm);
  };

  const addOwner: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(modifyOwnerForm);
  };

  return (
    <Page>
      <Page.Content navigate={navigate}>
        <vstack alignment="top center">
          <hstack alignment="center">
            <text color="black white" size="xlarge" weight="bold">
              Manage Hub
            </text>
          </hstack>
          <spacer size="medium" />
          <text color="black white" size="small" wrap>{`Owners: ${appPost.owners.join(
            ', '
          )}`}</text>
          <spacer size="small" />
          <hstack alignment="center" gap="small" maxWidth={'70%'} width={'100%'}>
            <vstack grow gap="small">
              <button onPress={addOwner} size="small" icon="mod" appearance="secondary">
                Owners
              </button>
            </vstack>
            <vstack grow gap="small">
              <button onPress={deletePInfo} size="small" icon="delete" appearance="secondary" grow>
                Delete
              </button>
              <button onPress={addColor} size="small" icon="topic-art" appearance="secondary" grow>
                Color
              </button>
            </vstack>
          </hstack>
        </vstack>
      </Page.Content>
    </Page>
  );
};