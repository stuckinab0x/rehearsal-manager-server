import { FC, useMemo } from 'react';
import styled from 'styled-components';
import Student, { FIVE_PM_LESSONS, TWO_PM_LESSONS } from '../../models/student';
import SelectorButton from './SelectorButton';
import { useEditor } from '../../contexts/editor-context';

interface LessonSelectorProps {
  student: Student;
  twoPmStart: boolean;
}

const LessonSelector: FC<LessonSelectorProps> = ({ student, twoPmStart }) => {
  const { updateStudentInfo } = useEditor();

  const lessonsTimes = useMemo(() => twoPmStart ? TWO_PM_LESSONS : FIVE_PM_LESSONS, [twoPmStart]);

  return (
    <SelectorMain>
      <SelectorButton select={ () => updateStudentInfo(student.id, { name: student.name, lesson: undefined, main: student.main  }) } value={ 'No Lesson' } active={ !student.lesson } />
      { lessonsTimes.map(x => <SelectorButton key={ x } select={ () => updateStudentInfo(student.id, { name: student.name, lesson: x, main: student.main  }) } value={ x } active={ student.lesson === x } />) }
    </SelectorMain>
  )
}

const SelectorMain = styled.div`
  display: flex;
  align-items: center;
  background-color: ${ props => props.theme.colors.bgInner3 };
  margin: 0px 4px;
  padding: 4px 2px;
  border-radius: 4px;
`;

export default LessonSelector;
