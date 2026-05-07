// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button, FileButton } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    label: '保存',
  },
};

export const FileUpload: StoryObj<typeof FileButton> = {
  render: () => <FileButton label="アップロード" />,
};
