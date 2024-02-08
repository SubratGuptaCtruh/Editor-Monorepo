import type { Meta, StoryObj } from "@storybook/react";
import StyleLibrarySidebarItem from "./StyleLibrarySidebarItem";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: "Components/StyleLibrarySidebarItem",
    component: StyleLibrarySidebarItem,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: "centered",
    },
    args: {
        tab: "Colors",
        handleClick: () => {},
        content: "Colors",
        sideBarOptionSelected: "Colors",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ["autodocs"],
} satisfies Meta<typeof StyleLibrarySidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic: Story = {};
