import { propEq } from 'ramda';
import { createSlice } from '@reduxjs/toolkit';
import TasksRepository from 'repositories/TasksRepository';
import { STATES } from 'presenters/TaskPresenter';
import { useDispatch } from 'react-redux';
import { changeColumn } from '@lourenci/react-kanban';

const initialState = {
  board: {
    columns: STATES.map((column) => ({
      id: column.taskState,
      title: column.value,
      cards: [],
      meta: {},
    })),
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    loadColumnSuccess(state, { payload }) {
      const { items, meta, columnId } = payload;
      const column = state.board.columns.find(propEq('id', columnId));

      state.board = changeColumn(state.board, column, {
        cards: items,
        meta,
      });

      return state;
    },
    loadColumnMoreSuccess(state, { payload }) {
      const { items, meta, columnId } = payload;
      const column = state.board.columns.find(propEq('id', columnId));

      state.board = changeColumn(state.board, column, {
        cards: [...column.cards, ...items],
        meta,
      });

      return state;
    },
  },
});

const { loadColumnSuccess, loadColumnMoreSuccess } = tasksSlice.actions;

export default tasksSlice.reducer;

export const useTasksActions = () => {
  const dispatch = useDispatch();

  const loadColumn = (params) => {
    TasksRepository.index(params).then(({ data }) => {
      const { stateEq } = params.q;
      dispatch(loadColumnSuccess({ ...data, columnId: stateEq }));
    });
  };

  const loadColumnMore = (params) => {
    TasksRepository.index(params).then(({ data }) => {
      const { stateEq } = params.q;
      dispatch(loadColumnMoreSuccess({ ...data, columnId: stateEq }));
    });
  };

  return {
    loadColumn,
    loadColumnMore,
  };
};
