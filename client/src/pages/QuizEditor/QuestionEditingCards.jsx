import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import QuestionEditingCard from './QuestionEditingCard';

function QuestionEditingCards({
  fields,
  setValue,
  getValues,
  remove,
  move,
  control,
  getNextKey,
  questionTexts,
}) {
  const handleOnDragEnd = (change) => {
    if (!change.destination) {
      return;
    }
    move(change.source.index, change.destination.index);
  };
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="question-cards">
        {(droppableProvided) => (
          <div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
            {fields.map((question, idx) => (
              <Draggable key={question.key} draggableId={String(question.key)} index={idx}>
                {(draggableProvided) => (
                  <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps}>
                    <QuestionEditingCard
                      questionIdx={idx}
                      getValues={getValues}
                      remove={remove}
                      control={control}
                      getNextKey={getNextKey}
                      dragHandleProps={draggableProvided.dragHandleProps}
                      setValue={setValue}
                      defaultValue={questionTexts[idx]}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default QuestionEditingCards;
