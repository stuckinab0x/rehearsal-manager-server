import { FC } from 'react';
import styled from 'styled-components';

interface SongDragDropAreaProps {
  songID: number;
  currentDragging: number | null;
  dragHover: boolean;
  setDragHover: (hover: boolean) => void;
  handleDrop: () => void;
  last?: boolean;
}

const SongDragDropArea: FC<SongDragDropAreaProps> = ({ songID, currentDragging, dragHover, setDragHover, handleDrop, last }) => (
  <DragDropArea
    $hover={ dragHover && (!!last || currentDragging !== songID) }
    onDragOver={ event => { setDragHover(true); (!!last || currentDragging !== songID) && event.preventDefault() } }
    onDragLeave={ () => setDragHover(false) }
    onDrop={ handleDrop }>
    <h3>
      Drag a song here to reorder
    </h3>
  </DragDropArea>
);

interface DragDropAreaProps {
  $hover: boolean;
}

const DragDropArea = styled.div<DragDropAreaProps>`
  display: flex;
  justify-content: left;
  flex: 1;
  min-height: 15px;
  padding-left: 20px;
  margin-bottom: 2px;
  width: 100%;
  ${ props => props.$hover && `background-color: ${ props.theme.colors.accent };` }

  > h3 {
    color: white;
    opacity: 0.5;
    margin: 0;
  }
`;

export default SongDragDropArea;
