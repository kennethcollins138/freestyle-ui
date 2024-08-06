import { Devvit } from '@devvit/public-api';
import { AppController } from './api/AppController.js';
import { App } from './pages/app.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  location: 'subreddit', 
  label: 'Create Freestyle Hub', 
  forUserType: 'moderator',
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
          label: 'Post Title',
          type: 'string',
          defaultValue: `${data.subName} Info`, // Default value for the field
        },
        {
          name: 'subName', 
          label: 'Subreddit',
          type: 'string',
          defaultValue: `${data.subName}`,
          disabled: true,
        },
        {
          name: 'username',
          label: 'Creator',
          type: 'string',
          defaultValue: `${data.username}`,
          disabled: true,
        },
      ],
      title: 'Create Freestyle Hub', 
      acceptLabel: 'Create', 
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
      ), 
    });

    const svc = new AppController(post.id, context);
    await svc.createAppInstance({
      title, // Title of the post
      url: post.url, // URL of the post
      header: `Welcome to ${subName}`, // Header of the post
      createdAt: new Date().toISOString(), // Current timestamp
      owners: [username], // List of owners
      primaryColor: {
        light: '#FFFFFF',
        dark: '#1A1A1B',
      }, // Example primary color
      subheader: '', // Subheader
      home: {
        light: '#FFFFFF',
        dark: '#1A1A1B',
        children: [],
      }, // Example home configuration
      pages: {}, // Initially empty pages
      status: 'draft', // Initial status
    }, username);

    context.ui.showToast('Success! Check your inbox.');

    await reddit.sendPrivateMessage({
      to: username, 
      subject: 'Set up your Freestyle Hub', 
      text: `View your post to set it up: ${post.url}`, 
    });
  }
);

Devvit.addCustomPostType({
  name: 'pInfo',
  height: 'tall',
  render: App, 
});

export default Devvit;
