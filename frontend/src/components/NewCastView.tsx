import { FC, SetStateAction, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useEditor } from '../contexts/editor-context';
import InputUpdate from '../models/input-update';
import { createInputs } from '../utils';
import { useViews } from '../contexts/views-context';
import Student, { MainInstrument } from '../models/student';

const mapInputs = (inputs: InputUpdate[], main: MainInstrument) => inputs.map<Student>(x => ({ id: crypto.randomUUID(), name: x.value.trim(), main, castings: [] }));

const NewCastView: FC = () => {
  const { setEditorView } = useViews();
  const { newShowStatus, setNewShowStatus, currentEditingShow, addNewCastStudents } = useEditor();

  const [guitarInputs, setGuitarInputs] = useState<InputUpdate[]>(createInputs(8));
  const [bassInputs, setBassInputs] = useState<InputUpdate[]>(createInputs(4));
  const [drumInputs, setDrumInputs] = useState<InputUpdate[]>(createInputs(4));
  const [keysInputs, setKeysInputs] = useState<InputUpdate[]>(createInputs(4));
  const [voxInputs, setVoxInputs] = useState<InputUpdate[]>(createInputs(4));

  const handleInputChange = useCallback((index: number, input: HTMLInputElement, arraySetter: React.Dispatch<SetStateAction<InputUpdate[]>>) => {
    arraySetter(oldState => {
      const newInputs = [...oldState];
      newInputs[index] = { ...newInputs[index], value: input.value };
      return newInputs;
    });
  }, []);

  const addAnotherInput = useCallback((arraySetter: React.Dispatch<SetStateAction<InputUpdate[]>>) => {
    arraySetter(oldState => [...oldState, { value: '', id: oldState.length }]);
  }, []);

  const potentialCastList = useMemo(() => {
    return [...mapInputs(guitarInputs, 'Guitar'), ...mapInputs(bassInputs, 'Bass'), ...mapInputs(drumInputs, 'Drums'), ...mapInputs(keysInputs, 'Keys'), ...mapInputs(voxInputs, 'Vocals')].filter(x => x.name);
  }, [guitarInputs, bassInputs, drumInputs, keysInputs, voxInputs]);

  const buttonText = useMemo(() => {
    const lowerCased = potentialCastList.map(x => x.name.toLowerCase());
    const dupes = lowerCased.length !== new Set(lowerCased).size;
    if (dupes && potentialCastList.length)
      return 'Fix duplicate names';
    if (newShowStatus === 'songsWereAdded')
      return 'Next - Casting/Overview';
    return 'Next - Add Songs';
  }, [potentialCastList, newShowStatus]);

  const addCast = useCallback(() => {
    if (!currentEditingShow)
      return;
    addNewCastStudents(potentialCastList);
    if (newShowStatus === 'songsWereAdded') {
      setEditorView('showOverview');
      setNewShowStatus(undefined);
    }
    else {
      setNewShowStatus('castWasAdded');
      setEditorView('newShowSongs');
    }
  }, [potentialCastList, currentEditingShow, newShowStatus, setNewShowStatus, setEditorView]);

  const instrumentSectionProps = useMemo(() => [
    { instName: 'Guitar', inputs: guitarInputs, setter: setGuitarInputs },
    { instName: 'Bass', inputs: bassInputs, setter: setBassInputs },
    { instName: 'Drums', inputs: drumInputs, setter: setDrumInputs },
    { instName: 'Keys', inputs: keysInputs, setter: setKeysInputs },
    { instName: 'Vocals', inputs: voxInputs, setter: setVoxInputs },
  ], [guitarInputs, bassInputs, drumInputs, keysInputs, voxInputs]);

  if (currentEditingShow)
    return (
      <ViewMain>
        <h2>
          { currentEditingShow.name }: Cast Members
        </h2>
        <h4><i>Add students to the cast list.<br />
        Instrument groups will help with organization later<br/>
        and don't affect song casting possibilities.</i></h4>
        { instrumentSectionProps.map(x => (<InstrumentSection key={ x.instName }>
          <InstrumentHeader>
            <h3>{ x.instName }</h3>
          </InstrumentHeader>
          { x.inputs.map((input, i) => <input type='text' key={ input.id } value={ input.value } onChange={ event => handleInputChange(i, event.currentTarget, x.setter) } />) }
          <AddButton  onClick={ () => addAnotherInput(x.setter) }>
            <h3>
              More
            </h3>
          </AddButton>
        </InstrumentSection>)) }
        <DoneButton onClick={ addCast } $disabled={ buttonText === 'Fix duplicate names' }>
          <h3>
            { buttonText }
          </h3>
        </DoneButton>
      </ViewMain>
    );
};

const ViewMain = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;

  h2, h4 {
    margin: 0 0 4px 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }

  input {
    margin: 2px;
    background-color: ${ props => props.theme.colors.bgInner1 };
    border: 1px solid rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    font-size: 16px;
    color: white;
    outline: none;
  }
`;

const InstrumentSection = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin: 4px;
  padding: 2px;
`;

const InstrumentHeader = styled.div`
  background-color: ${ props => props.theme.colors.bgInner2 };
  text-align: center;
  padding: 5px;
  margin: 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  
  > h3 {
    color: white;
    margin: 0;
  }
`;

const AddButton = styled.div`
  background-color: ${ props => props.theme.colors.accent };
  border-radius: 4px;
  padding: 4px;
  margin: 2px 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  
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


export default NewCastView;
