import { FC, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/editor-context';
import SongCastingRow from './SongCastingRow';
import CastListHeader from './CastListHeader';
import LowerToolbar from './LowerToolbar';
import SongDragDropArea from './SongDragDropArea';
import { useViews } from '../../contexts/views-context';

const MainCastingContainer: FC = () => {
  const { toolsMode } = useViews();
  const { currentEditingShow, currentCastEdit, reorderSong, showSongs } = useEditor();
  
  const [activeSongEdit, setActiveSongEdit] = useState<string | null>(null);
  const [addingSong, setAddingSong] = useState(false);
  const [currentDragging, setCurrentDragging] = useState<string | null>(null);
  const [endDragHover, setEndDragHover] = useState(false);

  const handleEndDrop = useCallback(() => {
    if (!currentDragging|| !showSongs)
      return;
    reorderSong(currentDragging, showSongs.length);
    setEndDragHover(false);
    setCurrentDragging(null);
  }, [currentDragging, reorderSong]);

  const insertSetDivider = useCallback((elements: JSX.Element[]) => {
    if (!currentEditingShow)
      return;
    const setList = [...elements];
    if (currentEditingShow.setSplitIndex > 0 || toolsMode)
      setList.splice(currentEditingShow?.setSplitIndex, 0, <SetListDivider key='divider'>{ toolsMode && <h3>Set 2</h3> }</SetListDivider>);
    return setList;
  }, [currentEditingShow, toolsMode]);

  if (currentEditingShow && showSongs)
    return (
      <ContainerMain $fade={ !!currentCastEdit } >
        <CastListHeader showName={ currentEditingShow.name } disabled={ addingSong } />
        { insertSetDivider(showSongs.toSorted((a, b) => a.setOrder - b.setOrder).map(song => 
          <SongCastingRow
            key={ song.id }
            song={ song }
            disabled={ addingSong || (!!activeSongEdit && activeSongEdit !== song.id) }
            currentDragging={ currentDragging }
            setActiveSongEdit={ setActiveSongEdit } setCurrentDragging={ setCurrentDragging }
          />,
        ))
        }
        { toolsMode &&
          <SongDragDropArea
            songID={ '$$last$$' }
            currentDragging={ currentDragging }
            dragHover={ endDragHover }
            setDragHover={ setEndDragHover }
            handleDrop={ handleEndDrop }
          />
        }
        <LowerToolbar addingSong={ addingSong } setAddingSong={ setAddingSong } />
      </ContainerMain>
    );
};

interface ContainerProps {
  $fade: boolean;
}

const ContainerMain = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  padding: 2px;
  margin: 2px 2px 16px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);

  ${ props => props.$fade && 'opacity: 0.5;' }
  ${ props => props.$fade && 'pointer-events: none;' }
  background-color: ${ props => props.theme.colors.bgInner2 };
`;

const SetListDivider= styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${ props => props.theme.colors.accent };
  margin: 2px;
  border-radius: 4px;
  min-height: 20px;
  flex: 1;

  > h3 {
    margin: 16px;
    color: white;
  }
`;

export default MainCastingContainer;
