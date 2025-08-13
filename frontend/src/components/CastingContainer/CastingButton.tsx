import { FC } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/editor-context';

interface CastingButtonProps {
  assignedStudent?: string;
  disabled: boolean;
  startCasting: () => void;
}

const CastingButton: FC<CastingButtonProps> = ({ assignedStudent, disabled, startCasting }) => {
  const { highlightedStudent } = useEditor();
  
  return (
    <ButtonMain onClick={ startCasting } $disabled={ disabled } $highlighted={ highlightedStudent === assignedStudent }>
      <h4>{ assignedStudent }</h4>
    </ButtonMain>
  );
};

interface ButtonMainProps {
  $disabled: boolean;
  $highlighted: boolean;
}

const ButtonMain = styled.div<ButtonMainProps>`
  display: flex;
  background-color: ${ props => props.$highlighted ? props.theme.colors.accent : props.theme.colors.bgInner3 };
  padding: 5px 10px;
  margin: 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  justify-content: left;
  width: 100px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  min-height: 25px;

  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5;' }

  > h4 {
    display: flex;
    color: white;
    margin: 0;
  }
`;

export default CastingButton;
