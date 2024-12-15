import { Devvit } from "@devvit/public-api";
import { LoadingState } from "../components/loading.js";

export const uploadForm = Devvit.createForm(
    {
        title: 'Upload Puzzle Image',
        fields: [
        {
            name: 'puzzleImage',
            type: 'image',
            label: 'Select an image (max 20MB)',
            required: true,
        },
        ],
    },
    async (event, context) => {
        const { reddit, ui } = context;
        const imageUrl = event.values.puzzleImage;
        
        // Store the imageUrl in Redis
        await context.redis.set('puzzleImageUrl', imageUrl);
        
        // Get the current subreddit
        const subreddit = await reddit.getCurrentSubreddit();
        
        // Submit a new post with the image URL
        const post = await context.reddit.submitPost({
            title: 'New Puzzle Image',
            subredditName: subreddit.name,
            preview: <LoadingState/>,
        });
        
        // Show a success message
        context.ui.showToast('Image uploaded and new post created!');
        ui.navigateTo(post);
    }
);