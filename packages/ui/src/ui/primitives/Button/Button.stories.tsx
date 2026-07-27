// Button.stories.tsx
import { Button, FileButton } from './Button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Button> = {
  component: Button,
}

export default meta

/**
 * A story representing the button in its primary variant with a sample label.
 */
export const Primary: StoryObj<typeof Button> = {
  args: {
    label: '保存',
  },
}

/**
 * A story demonstrating the file upload button variant with a sample label.
 */
export const FileUpload: StoryObj<typeof FileButton> = {
  render: () => <FileButton label="アップロード" />,
}
