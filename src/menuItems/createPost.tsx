import { Devvit } from '@devvit/public-api';
import { LoadingState } from '../components/loading.js';

import type { MenuItem } from '@devvit/public-api';

export const createNewPuzzle: MenuItem = {
  label: 'Create New PictoPuzzle (Updated)',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'PictoPuzzle',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: <LoadingState/>,
    });
    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post);
  },
};