// components/Button/Button.tsx
import { MuiButtonAdapter, MuiFileButtonAdapter } from '@ui/adapters/mui';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button = (props: ButtonProps) => {
  return <MuiButtonAdapter {...props} />;
};

export const FileButton = (props: ButtonProps) => {
  return <MuiFileButtonAdapter {...props} />;
};
