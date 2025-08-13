import { FC } from 'react';
import styled from 'styled-components';

interface SelectorButtonProps {
  active: boolean;
  value: string;
  select: () => void;
}

const SelectorButton: FC<SelectorButtonProps> = ({ active, value, select }) => {
  return(
    <ButtonMain onClick={ select } $orange={ active }>
      <h3>{ value }</h3>
    </ButtonMain>
  );
};

interface ButtonProps {
  $orange: boolean;
}

const ButtonMain = styled.div<ButtonProps>`
  display: flex;
  align-items: center;
  background-color: ${ props => props.$orange ? props.theme.colors.accent : props.theme.colors.bgInner2 };
  border-radius: 4px;
  margin: 0px 2px;
  padding: 2px 4px;
  cursor: pointer;

  > h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

export default SelectorButton;
