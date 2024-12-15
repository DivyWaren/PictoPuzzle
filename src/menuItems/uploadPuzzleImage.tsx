import { Devvit, MenuItem } from '@devvit/public-api';
import { uploadForm } from '../forms/uploadImageForm.js';

export const uploadPuzzleImage: MenuItem = {
  label: 'Upload Puzzle Image',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(uploadForm);
  },
};