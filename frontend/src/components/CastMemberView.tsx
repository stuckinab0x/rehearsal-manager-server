import { FC, useState, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useEditor } from '../contexts/editor-context';
import { ALL_INSTRUMENTS, MainInstrument } from '../models/student';
import CastByInstrumentColumn from './Cast/CastByInstrumentColumn';
import SelectorButton from './Cast/SelectorButton';
import { useViews } from '../contexts/views-context';

const CastMemberView: FC = () => {
  const { setEditorView } = useViews();
  const { currentEditingShow, showCast } = useEditor();
  
  const [activeEdit, setActiveEdit] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [addingCastMember, setAddingCastMember] = useState(false);
  const [newStudentMain, setNewStudentMain] = useState<MainInstrument>('Guitar');
  
  const { addStudent } = useEditor();

  const handleNewStudentClick = useCallback(() => {
    addStudent({ id: crypto.randomUUID(), name: nameInput, main: newStudentMain, castings: [] });
    setAddingCastMember(false);
    setNewStudentMain('Guitar');
    setNameInput('');
  }, [nameInput, newStudentMain, addStudent]);

  const inputIsDupe = useMemo(() => {
    if (!showCast)
      return false;
    return showCast.some(x => x.name.toLowerCase() === nameInput.toLowerCase());
  }, [showCast, nameInput]);

  if (currentEditingShow && showCast)
    return (
      <ViewMain>
        <h2>{ currentEditingShow.name }:  Manage Cast Members</h2>
        { addingCastMember ? 
          <>
            <NameInput value={ nameInput } onChange={ event => setNameInput(event.currentTarget.value) } placeholder='enter a student name' />
            <Selector>
              <div>
                { ALL_INSTRUMENTS.map(x => <SelectorButton key={ x } select={ () => setNewStudentMain(x) } value={ x } active={ newStudentMain === x } />) }
              </div>
            </Selector>
            <Button onClick={ () => { setAddingCastMember(false); setNameInput(''); } }>
              <h2>Discard</h2>
            </Button>
            { nameInput && <AddButton onClick={ handleNewStudentClick } $disabled={ inputIsDupe }>
              <h2>
                { inputIsDupe ? 'Duplicate student name detected' : 'Add' }
              </h2>
            </AddButton> }
          </>
          : 
          <>
            <Row>
              <AddButton onClick={ () => setAddingCastMember(true) } $disabled={ !!activeEdit }>
                <h2>New Cast Member</h2>
              </AddButton>
              <Button onClick={ () => setEditorView('showOverview') }>
                <h2>Return to Show Overview</h2>
              </Button>
            </Row>
            <div>
              { ALL_INSTRUMENTS.map(x => <CastByInstrumentColumn key={ x } activeEdit={ activeEdit } setActiveEdit={ setActiveEdit } twoPmStart={ currentEditingShow.twoPMRehearsal } instrument={ x } castMembers={ showCast.filter(student => student.main === x) } />) }
            </div>
          </>
        }
      </ViewMain>
    );
};

const h2 = css`
  color: white;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
`;

const ViewMain = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;

  > h2 {
    ${ h2 }
  }
`;

const Row = styled.div`
  display: flex;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  background-color: ${ props => props.theme.colors.bgInner2 };
  border-radius: 4px;
  padding: 4px 10px;
  margin: 7px;
  cursor: pointer;
  user-select: none;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.5);

  > h2 {
    ${ h2 }
  }
`;

interface AddButtonProps {
  $disabled: boolean;
}

const AddButton = styled(Button)<AddButtonProps>`
  background-color: ${ props => props.theme.colors.accent };
  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5;' }
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

const Selector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > div {
    display: flex;
    background-color: ${ props => props.theme.colors.bgInner3 };
    margin: 6px 4px;
    padding: 4px 2px;
    border-radius: 4px;
  }
`;

export default CastMemberView;
