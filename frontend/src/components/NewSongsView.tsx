import { FC, SetStateAction, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useEditor } from '../contexts/editor-context';
import InputUpdate from '../models/input-update';
import { createInputs } from '../utils';
import Song from '../models/song';
import { useViews } from '../contexts/views-context';

const NewSongsView: FC = () => {
  const { setEditorView } = useViews();
  const { currentEditingShow, newShowStatus, setNewShowStatus, availableColors, addNewShowSongs } = useEditor();
  
  const [songInputs, setSongInputs] = useState<InputUpdate[]>(createInputs(20));
  const [artistInputs, setArtistInputs] = useState<InputUpdate[]>(createInputs(20));

  const handleInputChange = useCallback((index: number, input: HTMLInputElement, arraySetter: React.Dispatch<SetStateAction<InputUpdate[]>>) => {
    arraySetter(oldState => {
      const newInputs = [...oldState];
      newInputs[index] = { ...newInputs[index], value: input.value };
      return newInputs;
    });
  }, []);

  const buttonText = useMemo(() => {
    const caseTrim = songInputs.filter(x => x.value).map(x => x.value.toLowerCase().trim());
    const dupes = caseTrim.length !== new Set(caseTrim).size;

    if (dupes)
      return 'Song list contains duplicates';
    if (newShowStatus === 'castWasAdded')
      return 'Next - Casting/Overview';
    return 'Next - Add Cast Members';
  }, [songInputs, newShowStatus]);

  const addSongs = useCallback(() => {
    if (!currentEditingShow)
      return;
    let songs: Song[] = songInputs.map((x, i) => ({ id: -1, name: x.value, artist: artistInputs[i].value, setOrder: i, color: availableColors[i] })).filter(x => x.name);
    if (currentEditingShow.singleArtist)
      songs = songs.map((x, i) => ({ id: x.id, name: x.name, setOrder: i, color: availableColors[i] }))
    addNewShowSongs(songs);
    if (newShowStatus === 'castWasAdded') {
      setEditorView('showOverview');
      setNewShowStatus(undefined);
    }
    else {
      setNewShowStatus('songsWereAdded');
      setEditorView('newShowCast');
    }
  }, [songInputs, artistInputs, currentEditingShow, newShowStatus, setNewShowStatus, setEditorView, availableColors]);

  const addAnotherInput = useCallback(() => {
    setSongInputs(oldState => [...oldState, { value: '', id: oldState.length }]);
    setArtistInputs(oldState => [...oldState, { value: '', id: oldState.length }]);
  }, []);

  if (currentEditingShow)
    return (
      <ViewMain>
        <h2>
          { currentEditingShow.name }: Songs
        </h2>
        <SongInputsContainer>
          <InputsColumn>
            <h2>Song Name</h2>
            { songInputs.map((x, i) => <Input type='text' $songInput={ !currentEditingShow.singleArtist } key={ x.id } value={ x.value } onChange={ event => handleInputChange(i, event.currentTarget, setSongInputs) } />) }
          </InputsColumn>
          { !currentEditingShow.singleArtist
          && <InputsColumn>
            <h2>Artist</h2>
            { artistInputs.map((x, i) => <Input type='text' key={ x.id } value={ x.value } onChange={ event => handleInputChange(i, event.currentTarget, setArtistInputs) } />) }
          </InputsColumn> }
        </SongInputsContainer>
        <AddButton onClick={ addAnotherInput }>
          <h3>
            More
          </h3>
        </AddButton>
        <DoneButton onClick={ () => { addSongs(); } } $disabled={ buttonText === 'Song list contains duplicates' }>
          <h3>
            { buttonText }
          </h3>
        </DoneButton>
      </ViewMain>
    )
}

const ViewMain = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;
  align-items: center;

  h2, h4 {
    margin: 0 0 4px 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

interface InputProps {
  $songInput?: boolean;
}

const Input = styled.input<InputProps>`
  ${ props => props.$songInput && 'text-align: right;' }
  margin: 4px;
  background-color: ${ props => props.theme.colors.bgInner1 };
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 20px;
  color: white;
  outline: none;
`;

const SongInputsContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin: 4px;
  padding: 2px;
`;

const InputsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled.div`
  background-color: ${ props => props.theme.colors.accent };
  border-radius: 4px;
  padding: 4px;
  margin: 2px 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  min-width: 50%;
  
  > h3 {
    color: white;
    margin: 0;
  }
`;

interface DoneButtonProps {
  $disabled: boolean;
}

const DoneButton = styled(AddButton)<DoneButtonProps>`
  margin-top: 20px;
  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5;'}
  
  > h3 {
    font-size: 30px;
  }
`;


export default NewSongsView;
