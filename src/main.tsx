import { Devvit } from '@devvit/public-api';
import { PinPost } from './api/PinPost.js';
import { App } from './pages/app.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  location: 'subreddit', // Add the menu item to the subreddit
  label: 'Create Freestyle Post', // Label for the menu item
  forUserType: 'moderator', // Only show the menu item to moderators
  onPress: async (_, context) => {
    const { reddit, userId } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const subName = currentSubreddit.name;
    const user = await reddit.getUserById(userId!);

    if (user) {
      // Show the create post form with pre-filled values
      context.ui.showForm(createPost, {
        subName,
        username: user.username,
      });
    }
  },
});

const createPost = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'title',
          label: `Post Title`,
          type: 'string',
          defaultValue: `${data.subName} Info`, // Default value for the field
        },
        {
          name: 'subName', 
          label: `Subreddit`,
          type: 'string',
          defaultValue: `${data.subName}`,
          disabled: true,
        },
        {
          name: 'username',
          label: `Creator`,
          type: 'string',
          defaultValue: `${data.username}`,
          disabled: true, // Disable the field
        },
      ],
      title: 'Create Hub', // Title of the form
      acceptLabel: 'Create', // Label for the submit button
    } as const;
  },
  async ({ values }, context) => {
    const { reddit } = context;
    const { title, username, subName } = values;

    const post = await reddit.submitPost({
      title, // Title of the post
      subredditName: subName, // Name of the subreddit
      preview: (
        <vstack>
          <text color="black white">Loading...</text>
        </vstack>
      ), // Preview of the post
    });

    const svc = new PinPost(post.id, context);
    await svc.createPinPost({
      username, // Username of the creator
      title, // Title of the post
      url: post.url, // URL of the post
      header: `Welcome to ${post.subredditName}`, // Header of the post
    });

    context.ui.showToast(`Success! Check your inbox.`);

    await reddit.sendPrivateMessage({
      to: username, // Username of the recipient
      subject: 'Set up your Community Hub', // Subject of the private message
      text: `View your post to set it up: ${post.url}`, // Text of the private message
    });
  }
);

Devvit.addCustomPostType({
  name: 'pInfo',
  height: 'tall',
  render: App, // Render function for the custom post type
});
export default Devvit;
