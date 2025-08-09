import { FC, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';
import Song from '../../models/song';
import CastingButton from './CastingButton';
import { ALL_CAST_INST, CastingInst } from '../../models/student';
import { useEditor } from '../../contexts/editor-context';
import SongDragDropArea from './SongDragDropArea';
import { useProfile } from '../../contexts/profile-context';
import { useViews } from '../../contexts/views-context';

interface SongCastingRowProps {
  song: Song;
  disabled: boolean;
  setActiveSongEdit: (activeEdit: number | null) => void;
  currentDragging: number | null;
  setCurrentDragging: (songID: number | null) => void;
}

const SongCastingRow: FC<SongCastingRowProps> = ({ song, disabled, setActiveSongEdit, currentDragging, setCurrentDragging }) => {
  const { prefs } = useProfile();
  const { toolsMode } = useViews();
  const { currentEditingShow, showSongs, showCast, setCastEdit, renameSong, deleteSong, reorderSong } = useEditor();
  
  const [editingName, setEditingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nameInput, setNameInput] = useState(song.name);
  const [artistInput, setArtistInput] = useState(currentEditingShow?.singleArtist ? undefined : song.artist);
  const [dragHover, setDragHover] = useState(false);

  const hidden = useMemo(() => {
    if (!prefs)
      return null;
    const hidden: CastingInst[] = [];
    if (prefs.hideGuitar3)
      hidden.push('gtr3');
    if (prefs.hideKeys3)
      hidden.push('keys3');
    if (prefs.hideExtras)
      hidden.push('bgVox3');
    return hidden;
  }, [prefs]);

  const getCasting = useCallback((songID: number, inst: CastingInst) => {
    if (!showCast)
      return;
    const student = showCast.find(x => !!x.castings.find(casting => casting.songID === songID && casting.inst === inst));
    if (student)
      return student.name;
  }, [showCast]);

  const nameIsDupe = useMemo(() => {
    if (!showSongs)
      return false;
    return showSongs.filter(x => x.name !== song.name).some(x => x.name.toLowerCase() === nameInput.toLowerCase());
  }, [showSongs, nameInput, song.name]);

  const handleRenameConfirm = useCallback(() => {
    renameSong(song.id, nameInput, artistInput);
    setActiveSongEdit(null);
    setEditingName(false);
  }, [renameSong, nameInput, artistInput, setActiveSongEdit, song.id]);

  const handleDeleteConfirm = useCallback(() => {
    deleteSong(song.id);
    setActiveSongEdit(null);
    setDeleting(false);
  }, [deleteSong, setActiveSongEdit, setDeleting, song.id]);

  const handleDragStart = useCallback(() => {
    setCurrentDragging(song.id);
  }, [setCurrentDragging, song.id]);

  const handleDrop = useCallback(() => {
    if (!showSongs)
      return;
    
    if (currentDragging === song.id || !currentDragging)
      return;
    reorderSong(currentDragging, song.setOrder);
    setDragHover(false);
    setCurrentDragging(null);
  }, [reorderSong, song.id, currentDragging, setCurrentDragging, showSongs]);

  if (hidden && currentEditingShow)
    return (
      <RowMain $disabled={ disabled }>
        { toolsMode && <SongDragDropArea 
          songID={ song.id }
          currentDragging={ currentDragging }
          dragHover={ dragHover }
          setDragHover={ setDragHover }
          handleDrop={ handleDrop }
        /> }
        <div>
          <SongDisplay
            $tileColor={ song.color }
            $green={ editingName }
            $red={ deleting }
            draggable={ toolsMode && !editingName && !deleting }
            onDrag={ handleDragStart }
            onDragEnd={ () => setCurrentDragging(null) }
            $toolsMode={ toolsMode && !editingName && !deleting }>
            { toolsMode && !editingName && !deleting
            && <div>
              <span className='material-symbols-outlined' onClick={ () => { setEditingName(true); setActiveSongEdit(song.id) } } >edit</span>
              <span className='material-symbols-outlined' onClick={ () => { setDeleting(true); setActiveSongEdit(song.id) } } >delete</span>
            </div> }
            { editingName && <h3>Rename: </h3>}
            <h3>{ song.name }{ song.artist && ` - ${ song.artist }` }</h3>
          </SongDisplay>
          { toolsMode && (editingName || deleting) &&
            <ButtonOrange onClick={ deleting ? handleDeleteConfirm : handleRenameConfirm } $disabled={ nameIsDupe }>
              { nameIsDupe && <h3>Duplicate song name</h3> }
              { !nameIsDupe && <h3>{ deleting ? 'Delete' : 'Save' }</h3> }
            </ButtonOrange> }
          { toolsMode && deleting && <h3>&nbsp;Really delete song { song.name }?&nbsp;</h3>}
          { toolsMode && editingName
            && <div>
              <NameInput type='text' autoFocus value={ nameInput } onChange={ event => setNameInput(event.currentTarget.value) }  />
              { !currentEditingShow?.singleArtist && <NameInput type='text' autoFocus value={ artistInput } onChange={ event => setArtistInput(event.currentTarget.value) }  /> }
            </div>
          }
          { toolsMode && (editingName || deleting) && <ActionButton onClick={ () => { setEditingName(false); setDeleting(false); setActiveSongEdit(null) } }><h3>{ deleting ? 'Cancel' : 'Discard Changes' }</h3></ActionButton> }
          { !editingName && !deleting && ALL_CAST_INST.filter(x => !hidden.includes(x)).map(inst => <CastingButton key={ inst } disabled={ toolsMode } assignedStudent={ getCasting(song.id, inst) } startCasting={ () => setCastEdit(song.id, inst) } />) }
        </div>
      </RowMain>
    )
  return null;
}

interface RowProps {
  $disabled: boolean;
}

const RowMain = styled.div<RowProps>`
  display: flex;
  flex-direction: column;
  margin: 1px 2px;
  align-items: center;
  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5;' }

  span {
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  h3 {
    margin: 0;
    color: white;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }

  > div {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 100%;
  }
`;

interface SongDisplayProps {
  $tileColor: string;
  $green: boolean;
  $red: boolean;
  $toolsMode: boolean;
}

const SongDisplay = styled.div<SongDisplayProps>`
  display: flex;
  justify-content: space-between;
  background-color: ${ props => props.$tileColor };
  background-color: ${ props => props.$green && props.theme.colors.bgGreen };
  background-color: ${ props => props.$red && props.theme.colors.bgRed };
  padding: 5px 10px;
  margin: 2px;
  border-radius: 2px;
  width: 250px;
  max-width: 250px;
  overflow: hidden;
  white-space: nowrap;
  ${ props => props.$toolsMode && 'cursor: grab;' }

  > div {
    display: flex;
    justify-content: left;
    align-items: center;
    margin: 0px 6px 0px 0px;

    > span:first-child {
      margin-right: 8px;
    }
  }
`;

const NameInput = styled.input`
  color: white;
  border: none;
  border-radius: 2px;
  margin: 2px;
  padding: 5px 10px;
  min-height: 25px;
  background-color: ${ props => props.theme.colors.bgInner3 };
  outline: none;
  font-size: 1.3rem;
`;

const ActionButton = styled.div`
  display: flex;
  align-items: center;
  border-radius: 2px;
  margin: 2px;
  padding: 5px 10px;
  background-color: ${ props => props.theme.colors.bgInner1 };
  cursor: pointer;
`;

interface ButtonOrangeProps {
  $disabled: boolean;
}

const ButtonOrange = styled(ActionButton)<ButtonOrangeProps>`
  background-color: ${ props => props.theme.colors.accent };

  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5;' }
`;

export default SongCastingRow;
