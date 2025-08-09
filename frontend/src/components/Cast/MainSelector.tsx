import { FC } from 'react';
import styled from 'styled-components';
import Student, { ALL_INSTRUMENTS } from '../../models/student';
import SelectorButton from './SelectorButton';
import { useEditor } from '../../contexts/editor-context';

interface MainSelectorProps {
  student: Student;
}

const MainSelector: FC<MainSelectorProps> = ({ student }) => {
  const { updateStudentInfo } = useEditor();

  return (
    <Selector>
      { ALL_INSTRUMENTS.map(x => <SelectorButton key={ x } select={ () => updateStudentInfo(student.id, { name: student.name, lesson: student.lesson, main: x  }) } value={ x } active={ student.main === x } />) }
    </Selector>
  )
}

const Selector = styled.div`
  display: flex;
  align-items: center;
  background-color: ${ props => props.theme.colors.bgInner3 };
  margin: 0px 4px;
  padding: 4px 2px;
  border-radius: 4px;
`;

export default MainSelector;
