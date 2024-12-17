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
        {
            name: 'gridSize',
            type: 'select',
            label: 'Grid Size',
            options: [
                { label: '3x3', value: '3' },
                { label: '4x4', value: '4' },
                { label: '5x5', value: '5' },
            ],
            required: true,
        },
        ],
    },
    async (event, context) => {
        const { reddit, ui, redis } = context;
        const imageUrl = event.values.puzzleImage as string;
        const gridSize = event.values.gridSize[0];
        
        // Get the current subreddit
        const subreddit = await reddit.getCurrentSubreddit();
        
        // Submit a new post with the image URL
        const post = await reddit.submitPost({
            title: `New Puzzle - ${gridSize}x${gridSize}`,
            subredditName: subreddit.name,
            preview: <LoadingState/>,
        });
        
        // Store the imageUrl and gridSize in Redis, associated with the post ID
        await redis.hSet(`post:${post.id}`, {
            imageUrl: imageUrl,
            gridSize: gridSize
        });
        
        // Show a success message
        ui.showToast('Image uploaded and new post created!');
        ui.navigateTo(post);
    }
);