import { useSelector } from 'react-redux';
import { useTasksActions } from 'slices/TasksSlice';

const useTasks = () => {
  const board = useSelector((state) => state.TasksSlice.board);
  const { loadColumn } = useTasksActions();

  const loadBoard = (boardLoadParams) => Promise.all(boardLoadParams.map(loadColumn));

  return {
    board,
    loadBoard,
  };
};

export default useTasks;
