import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/editor-context';
import { ALL_INSTRUMENTS } from '../../models/student';
import PickerColumn from './PickerColumn';
import { getFullInstName } from '../../utils';

const CastingPicker: FC = () => {
  const { currentCastEdit, showSongs, showCast, clearAndCloseCasting, discardCastEdit } = useEditor();

  const songName = useMemo(() => showSongs?.find(x => x.id === currentCastEdit?.songID)?.name, [showSongs, currentCastEdit]);

  if (showSongs && showCast && currentCastEdit)
    return (
      <PickerMain>
        <h2>{ getFullInstName(currentCastEdit?.inst) }</h2>
        <h2>{ songName }</h2>
        <div>
          <Button onClick={ clearAndCloseCasting }>
            <h3>Clear Casting</h3>
          </Button>
          <Button onClick={ discardCastEdit }>
            <h3>Discard Change</h3>
          </Button>
        </div>
        <div>{ ALL_INSTRUMENTS.map(x => <PickerColumn key={ x } instrument={ x } castMembers={ showCast.filter(student => student.main === x) } />) }</div>
      </PickerMain>
    );
};

const PickerMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${ props => props.theme.colors.bgInner2 };
  padding: 2px;
  border-radius: 6px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 100px;
  left: 500px;
  z-index: 50;

  > h2 {
    color: white;
    margin: 2px 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }

  > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`;

const Button = styled.div`
  background-color: ${ props => props.theme.colors.accent };
  border-radius: 4px;
  padding: 4px;
  margin: 2px 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  flex-grow: 1;
  text-align: center;
  
  > h3 {
    color: white;
    margin: 0;
  }
`;

export default CastingPicker;
