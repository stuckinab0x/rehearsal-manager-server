import { FC, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/editor-context';
import Prefs from '../../models/prefs';
import { useProfile } from '../../contexts/profile-context';
import { useViews } from '../../contexts/views-context';

interface LowerToolbarProps {
  addingSong: boolean;
  setAddingSong: (adding: boolean) => void;
}

const LowerToolbar: FC<LowerToolbarProps> = ({ addingSong, setAddingSong }) => {
  const { prefs, setPrefs } = useProfile();
  const {  setEditorView, toolsMode } = useViews();
  const { currentEditingShow, showSongs, addSong, saveSetListSplitIndex } = useEditor();
  
  const [nameInput, setNameInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  
  const handleAddSongClick = useCallback(() => {
    currentEditingShow?.singleArtist ? addSong(nameInput) : addSong(nameInput, artistInput);
    setAddingSong(false);
    setNameInput('');
    setArtistInput('');
  }, [nameInput, artistInput, addSong, currentEditingShow, setAddingSong]);

  const nameIsDupe = useMemo(() => {
    return showSongs?.some(x => x.name.toLowerCase() === nameInput.toLowerCase());
  }, [showSongs, nameInput]);

  const handlePrefsToggle = useCallback((prefName: keyof Prefs) => {
    setPrefs(oldState => {
      if (!oldState)
        return null;
      return { ...oldState, [prefName]: !oldState[prefName] };
    })
  }, [setPrefs]);

  const handleSetSplitClick = useCallback((newSplitIndex: number) => {
    if (newSplitIndex < 0 || (showSongs && newSplitIndex > showSongs.length))
      return;
    saveSetListSplitIndex(newSplitIndex);
  }, [showSongs, saveSetListSplitIndex]);

  if (toolsMode && currentEditingShow)
    return (
      <ToolbarMain>
        <SetDividerText>
          <h3>Set List Split Point: { currentEditingShow.setSplitIndex <= 0 ? 'None' : currentEditingShow?.setSplitIndex }</h3>
        </SetDividerText>
        <SmallButton onClick={ () => handleSetSplitClick(currentEditingShow.setSplitIndex - 1) }>
          <span className='material-symbols-outlined'>remove</span>
        </SmallButton>
        <SmallButton onClick={ () => handleSetSplitClick(currentEditingShow.setSplitIndex + 1) }>
          <span className='material-symbols-outlined'>add</span>
        </SmallButton>
      </ToolbarMain>
    )

  if (currentEditingShow && prefs)
    return (
      <ToolbarMain>
        <Button $disabled={ addingSong && (!nameInput || nameIsDupe) } onClick={ () => addingSong ? handleAddSongClick() : setAddingSong(true) }>
          { nameIsDupe ? <h3>Song already exists</h3>
          : <h3>{ addingSong ? 'Save and Add Song' : 'Add Song' }</h3>
          }
        </Button>
        { !addingSong
          && <Button onClick ={ () => setEditorView('editCast') }>
            <h3>Add/Edit Cast Members</h3>
          </Button>
        }
        { addingSong 
          && <>
            <NameInput value={ nameInput } placeholder='&nbsp;enter a song name' onChange={ event => setNameInput(event.currentTarget.value) } />
            { !currentEditingShow?.singleArtist && <NameInput value={ artistInput } onChange={ event => setArtistInput(event.currentTarget.value) } placeholder='&nbsp;enter an artist name' /> }
            <DiscardButton onClick={ () => setAddingSong(false) } $disabled={ nameIsDupe }>
              <h3>Discard</h3>
            </DiscardButton>
          </>
        }
        { !addingSong && <>
          <Divider />
          <SmallButton $fade={ prefs.hideGuitar3 } onClick={ () => handlePrefsToggle('hideGuitar3') }>
            <h3>Show Guitar 3</h3>
          </SmallButton>
          <SmallButton $fade={ prefs.hideKeys3 } onClick={ () => handlePrefsToggle('hideKeys3') }>
            <h3>Show Keys 3</h3>
          </SmallButton>
          <SmallButton $fade={ prefs.hideExtras } onClick={ () => handlePrefsToggle('hideExtras') }>
            <h3>Show Extras</h3>
          </SmallButton>
        </> }
      </ToolbarMain>
    )
}

const ToolbarMain = styled.div`
  display: flex;
  margin: 1px 2px;
  align-items: center;

  background-color: ${ props => props.theme.colors.bgInner2 };
`;

interface ButtonProps {
  $disabled?: boolean;
  $fade?: boolean;
}

const Button = styled.div<ButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  margin: 2px;
  padding: 5px 10px;
  background-color: ${ props => props.theme.colors.accent };
  width: 250px;
  cursor: pointer;

  ${ props => (props.$disabled || props.$fade) && 'opacity: 0.5;' }
  ${ props => props.$disabled && 'pointer-events: none;' }

  > h3 {
    margin: 0;
    color: white;
    border-radius: 2px;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

const SmallButton = styled(Button)`
  width: max-content;

  > span {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    font-size: 24px;
    font-weight: bold;
  }
`;

const Divider = styled.div`
  flex: 1;
`;

const SetDividerText = styled.div`
  margin: 2px;
  padding: 5px 10px;
  min-width: 250px;
  background-color: rgba(0, 0, 0, 0.2);

  > h3 {
    color: white;
    margin: 0;
  }
`

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

const DiscardButton = styled(Button)`
  background-color: ${ props => props.theme.colors.bgInner1 };
  width: initial;
`;


export default LowerToolbar;
