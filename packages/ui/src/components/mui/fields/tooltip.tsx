import { Tooltip as MUIToolTip, TooltipProps } from '@mui/material';

export const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <MUIToolTip {...props}>{children}</MUIToolTip>;
};
