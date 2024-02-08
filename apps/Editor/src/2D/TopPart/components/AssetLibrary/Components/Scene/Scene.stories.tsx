import type { Meta, StoryObj } from "@storybook/react";
import Scene from "./Scene";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: "Components/Scene",
    component: Scene,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: "centered",
    },
    args: {
        data: [
            {
                blobId: "123",
                bloburl: "example.com/blob",
                category: "Category",
                corr2DImageUrl: "example.com/image",
                fileextension: ".png",
                filename: "example.png",
                id: "1",
                isCompressed: false,
                subcategory: "Subcategory",
                subtype: "Type",
                type: "Type",
                uploadCategory: "Upload Category",
                userid: "user123",
            },
        ],
        isError: false,
        isLoading: true,
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ["autodocs"],
} satisfies Meta<typeof Scene>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic: Story = {};
