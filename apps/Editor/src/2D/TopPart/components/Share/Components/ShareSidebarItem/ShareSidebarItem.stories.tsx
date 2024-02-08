import type { Meta, StoryObj } from "@storybook/react";
import ShareSidebarItem from "./ShareSidebarItem";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: "Components/ShareSidebarItem",
    component: ShareSidebarItem,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: "centered",
    },
    args: {
        tab: "tab",
        handleClick: () => {},
        content: "content",
        sideBarOptionSelected: "sideBarOptionSelected",
        desc: "desc",
        icons: <></>,
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ["autodocs"],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic: Story = {};
