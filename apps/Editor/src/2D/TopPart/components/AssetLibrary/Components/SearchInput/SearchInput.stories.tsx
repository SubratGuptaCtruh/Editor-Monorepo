import type { Meta, StoryObj } from "@storybook/react";
import SearchInput from "./SearchInput";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: "Components/SearchInput",
    component: SearchInput,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: "centered",
    },
    args: {
        handleChange: (): void => {},
        handleEnterKey: (): void => {},
        placeholder: "Search for an asset...",
        isLoading: false,
        isError: false,
        value: "",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic: Story = {};
