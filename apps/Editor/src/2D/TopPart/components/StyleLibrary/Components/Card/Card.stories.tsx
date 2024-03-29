import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: "Components/Card",
    component: Card,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    args: {
        data: {
            id: "1",
            meshtype: "wall",
            name: "Wall",
            screenShot: "https://meshmerize.blob.core.windows.net/meshes/1.png",
            texture: "https://meshmerize.blob.core.windows.net/meshes/1.png",
        },
        onClick: () => {},
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic: Story = {};
