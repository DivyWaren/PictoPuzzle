import './menuItems/createPost.js';

import { WebViewMessage } from './types/WebViewMessage.js';

import { Devvit, useAsync, useState } from '@devvit/public-api';

import { LoadingState } from './components/loading.js';

import { createNewPuzzle } from './menuItems/createPost.js';

import { App } from './app.js';

Devvit.configure({
  redditAPI: true,
  redis: true, // Enables Redis integration for storing and retrieving persistent data
});


// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Picture Alignment Puzzle',
  height: 'tall',
  render: App,
});

/*
 * Menu Items
 */
Devvit.addMenuItem(createNewPuzzle)

export default Devvit;
