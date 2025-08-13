import { FC, useState, useCallback } from 'react';
import styled from 'styled-components';
import Student from '../../models/student';
import LessonSelector from './LessonSelector';
import { useEditor } from '../../contexts/editor-context';
import MainSelector from './MainSelector';

interface CastMemberProps {
  student: Student;
  twoPmStart: boolean;
  activeEdit: string | null;
  setActiveEdit: (studentID: string | null) => void;
}

const CastMember: FC<CastMemberProps> = ({ student, twoPmStart, activeEdit, setActiveEdit }) => {
  const { updateStudentInfo, deleteStudent } = useEditor();
  const [nameInput, setNameInput] = useState(student.name);
  const [deleting, setDeleting] = useState(false);

  const handleNameConfirm = useCallback(() => {
    updateStudentInfo(student.id, { name: nameInput, lesson: student.lesson, main: student.main  });
    setActiveEdit(null);
  }, [updateStudentInfo, nameInput, student, setActiveEdit]);

  const handleDeleteConfirm = useCallback(() => {
    if (!activeEdit)
      return;
    deleteStudent(activeEdit);
    setActiveEdit(null);
    setDeleting(false);
  }, [setActiveEdit, deleteStudent, activeEdit]);

  return (
    <CastMemberMain $disabled={ !!activeEdit && activeEdit !== student.id }>
      { activeEdit !== student.id && <>
        <div>
          <span className='material-symbols-outlined' onClick={ () => setActiveEdit(student.id) }>edit</span>
          <span className='material-symbols-outlined' onClick={ () => { setActiveEdit(student.id); setDeleting(true); } }>delete</span>
          <h3>{ student.name }</h3>
        </div>
        <LessonSelector student={ student } twoPmStart={ twoPmStart } />
        <MainSelector student={ student } />
      </> }
      { activeEdit === student.id && !deleting && <>
        <ConfirmButton onClick={ handleNameConfirm }>
          <h3>Confirm</h3>
        </ConfirmButton>
        <NameInput autoFocus value={ nameInput } onChange={ event => setNameInput(event.currentTarget.value) } />
        <ActionButton onClick={ () => { setActiveEdit(null); setNameInput(student.name); } }>
          <h3>Discard Changes</h3>
        </ActionButton>
      </> }
      { activeEdit === student.id && deleting && <>
        <ConfirmButton onClick={ handleDeleteConfirm }>
          <h3>Remove</h3>
        </ConfirmButton>
        <h3>Remove { student.name } from cast?</h3>
        <ActionButton onClick={ () => { setActiveEdit(null); setDeleting(false); } }>
          <h3>Cancel</h3>
        </ActionButton>
      </>
      }
    </CastMemberMain>
  );
};

interface CastMemberMainProps {
  $disabled: boolean;
}

const CastMemberMain = styled.div<CastMemberMainProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${ props => props.theme.colors.bgInner2 };
  padding: 4px;
  margin: 2px;
  border-radius: 4px;
  width: 100%;
  ${ props => props.$disabled && 'pointer-events: none;' }
  ${ props => props.$disabled && 'opacity: 0.5;' }

  > h3 {
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }

  > div {
    display: flex;
    align-items: center;
    margin-left: 4px;

    > span {
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
      cursor: pointer;
    }
  
    > h3 {
      color: white;
      margin: 0 8px 0 4px;
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
  border-radius: 4px;
  margin: 2px;
  padding: 5px 10px;
  background-color: ${ props => props.theme.colors.bgInner1 };
  cursor: pointer;

  > h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

const ConfirmButton = styled(ActionButton)`
  background-color: ${ props => props.theme.colors.accent };
`;

export default CastMember;
