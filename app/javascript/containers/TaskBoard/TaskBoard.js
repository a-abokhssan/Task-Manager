import React, { useEffect, useState } from 'react';
import KanbanBoard from '@lourenci/react-kanban';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import Task from 'components/Task';
import AddPopup from 'components/AddPopup';
import EditPopup from 'components/EditPopup';
import ColumnHeader from 'components/ColumnHeader';

import TasksRepository from 'repositories/TasksRepository';
import TaskPresenter from 'presenters/TaskPresenter';
import TaskForm from 'forms/TaskForm';

import useTasks from 'hooks/store/useTasks';
import { useTasksActions } from 'slices/TasksSlice';
import { STATES } from 'presenters/TaskPresenter';

import useStyles from './useStyles';

const MODES = {
  ADD: 'add',
  EDIT: 'edit',
  NONE: 'none',
};

const TaskBoard = () => {
  const { board, loadBoard } = useTasks();
  const [mode, setMode] = useState(MODES.NONE);
  const [openedTaskId, setOpenedTaskId] = useState(null);
  const styles = useStyles();
  const { loadColumn, loadColumnMore } = useTasksActions();

  const taskLoadParams = (stateEq, page = 1, perPage = 10) => ({
    q: { stateEq },
    page,
    perPage,
  });

  const boardLoadParams = STATES.map(({ taskState }) =>
    taskLoadParams(taskState)
  );

  useEffect(() => {
    loadBoard(boardLoadParams);
  }, []);

  const handleAddPopupOpen = () => {
    setMode(MODES.ADD);
  };

  const handleEditPopupOpen = (task) => {
    setOpenedTaskId(task.id);
    setMode(MODES.EDIT);
  };

  const handleClosePopup = () => {
    setMode(MODES.NONE);
    setOpenedTaskId(null);
  };

  const handleCardDragEnd = (task, source, destination) => {
    const transition = task.transitions.find(
      ({ to }) => destination.toColumnId === to
    );
    if (!transition) {
      return undefined;
    }
    return TasksRepository.update(TaskPresenter.id(task), {
      stateEvent: transition.event,
    })
      .then(() => {
        loadColumn(taskLoadParams(destination.toColumnId));
        loadColumn(taskLoadParams(source.fromColumnId));
      })
      .catch((error) => {
        alert(`Move failed! ${error.message}`);
      });
  };

  const handleTaskCreate = (params) => {
    const attributes = TaskForm.serialize(params);
    return TasksRepository.create(attributes).then(({ data: { task } }) => {
      loadColumn(taskLoadParams(TaskPresenter.state(task)));
      setMode(MODES.NONE);
    });
  };

  const handleTaskLoad = (id) =>
    TasksRepository.show(id).then(({ data: { task } }) => task);

  const handleTaskUpdate = (task) => {
    const attributes = TaskForm.serialize(task);

    return TasksRepository.update(TaskPresenter.id(task), attributes).then(
      () => {
        loadColumn(taskLoadParams(TaskPresenter.state(task)));
        handleClosePopup();
      }
    );
  };

  const handleTaskDestroy = (task) => {
    TasksRepository.destroy(TaskPresenter.id(task)).then(() => {
      loadColumn(taskLoadParams(TaskPresenter.state(task)));
      handleClosePopup();
    });
  };

  return (
    <>
      <Fab
        onClick={handleAddPopupOpen}
        className={styles.addButton}
        color="primary"
        aria-label="add"
      >
        <AddIcon />
      </Fab>

      <KanbanBoard
        disableColumnDrag
        onCardDragEnd={handleCardDragEnd}
        renderCard={(card) => (
          <Task onClick={handleEditPopupOpen} task={card} />
        )}
        renderColumnHeader={(column) => (
          <ColumnHeader column={column} onLoadMore={loadColumnMore} />
        )}
      >
        {board}
      </KanbanBoard>

      {mode === MODES.ADD && (
        <AddPopup
          onCreateCard={handleTaskCreate}
          onClose={handleClosePopup}
          mode={mode}
        />
      )}
      {mode === MODES.EDIT && (
        <EditPopup
          onLoadCard={handleTaskLoad}
          onCardDestroy={handleTaskDestroy}
          onCardUpdate={handleTaskUpdate}
          onClose={handleClosePopup}
          cardId={openedTaskId}
          mode={mode}
        />
      )}
    </>
  );
};

export default TaskBoard;
