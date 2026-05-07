import { styled } from '@mui/material/styles';
import {
  Button as MUIButton,
  ButtonProps as MUIButtonProps,
} from '@mui/material';

interface ButtonProps extends MUIButtonProps {
  label: string;
}

export const MuiButtonAdapter = ({ label, ...props }: ButtonProps) => {
  return (
    <MUIButton variant="contained" {...props}>
      {label}
    </MUIButton>
  );
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const MuiFileButtonAdapter = ({ label, ...props }: ButtonProps) => {
  return (
    <MUIButton
      component="label"
      role={undefined}
      variant="contained"
      {...props}
    >
      {label}
      <VisuallyHiddenInput
        type="file"
        onChange={(event) => console.log(event.target.files)}
      />
    </MUIButton>
  );
};
