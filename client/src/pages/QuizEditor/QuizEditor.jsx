import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTheme, IconButton } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';

import FormFooter from '../../components/FormFooter/FormFooter';
import QuestionEditingCards from './QuestionEditingCards';
import TextField from '../../components/ControllerWrappedInputs/TextField';
import TimeField from '../../components/ControllerWrappedInputs/TimeField';
import RichTextInput from '../../components/ControllerWrappedInputs/RichTextInput';
import DatePicker from '../../components/ControllerWrappedInputs/DatePicker';
import EditorFormInputBase from '../../components/EditorFormInputBase';

import {
  createDateTime,
  isBlank,
  isValidDateTimeInput,
  createKeyGenerator,
} from '../../utils/helpers';
import { createOrUpdateQuiz, getQuiz } from '../../utils/api/quizzes';
import globalStyles from '../../index.module.css';
import styles from './QuizEditor.module.css';

export default function QuizEditor() {
  const theme = useTheme();
  const { quizId, courseId } = useParams();
  const navigate = useNavigate();
  const getNextKey = useMemo(() => createKeyGenerator(), []);
  const { handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      title: '',
      duration: 1,
      description: '',
      weighting: 0,
      openDate: null,
      closeDate: null,
      closeTime: null,
      openTime: null,
      questions: [],
    },
  });
  const { fields, append, remove, move } = useFieldArray({ name: 'questions', control });
  const [errorMsg, setErrorMsg] = useState('');
  const [description, setDescription] = useState('');
  const [questionTexts, setQuestionTexts] = useState('');

  useEffect(() => {
    if (!quizId) {
      return;
    }
    getQuiz(quizId, navigate)
      .then((data) => {
        setValue('name', data.name);
        setDescription(data.description);
        setQuestionTexts(data.questions.map(({ questionText }) => questionText));
        setValue('duration', data.duration);
        setValue('weighting', data.weighting);
        setValue('openDate', dayjs(data.releaseDate));
        setValue('openTime', dayjs(data.releaseDate));
        setValue('closeDate', dayjs(data.dueDate));
        setValue('closeTime', dayjs(data.dueDate));
        for (const question of data.questions) {
          question.key = getNextKey();
          for (const option of question.options) {
            option.key = getNextKey();
          }
        }
        data.questions.sort((a, b) => a.questionNumber - b.questionNumber);
        setValue('questions', data.questions);
      })
      .catch((err) => console.error(err.message));
  }, [quizId, getNextKey, navigate, setValue]);

  const onError = (inputs, e) => {
    // Form validation errors only
    setErrorMsg("Don't leave a field empty");
  };

  const onSubmit = (inputs, e) => {
    const releaseDate = createDateTime(
      new Date(inputs.openDate),
      new Date(inputs.openTime)
    ).getTime();
    const dueDate = createDateTime(
      new Date(inputs.closeDate),
      new Date(inputs.closeTime)
    ).getTime();
    if (releaseDate >= dueDate) {
      setErrorMsg('Deadline must be after release date');
      return;
    }
    if (dueDate <= Date.now()) {
      setErrorMsg('Deadline cannot be in the past');
      return;
    }
    setErrorMsg('');
    createOrUpdateQuiz(
      quizId ? parseInt(quizId, 10) : 0,
      parseInt(courseId, 10),
      inputs.name,
      inputs.description,
      releaseDate,
      dueDate,
      parseInt(inputs.duration, 10),
      inputs.weighting,
      inputs.questions
    )
      .then((newQuizId) => {
        navigate(`/${courseId}/quiz/${newQuizId || quizId}`);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        console.error(err.message);
      });
  };

  const handleCancel = () => {
    navigate(`/${courseId}/quiz`);
  };

  return (
    <div className={globalStyles.pageContainer}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <EditorFormInputBase label="Quiz Title" htmlFor="name">
          <TextField
            name="name"
            control={control}
            rules={{ validate: (val) => Boolean(val?.match(/\S/)) }}
            fullWidth
            id="name"
            variant="outlined"
            size="large"
          />
        </EditorFormInputBase>
        <section className={styles.dateSection}>
          <EditorFormInputBase label="Release">
            <div className={styles.timeDate}>
              <TimeField
                label="Time"
                name="openTime"
                control={control}
                rules={{ validate: isValidDateTimeInput }}
                sx={{ width: '40%' }}
              />
              <DatePicker
                name="openDate"
                control={control}
                rules={{ validate: isValidDateTimeInput }}
                label="Date"
                format="DD/MM/YYYY"
                sx={{ width: '60%' }}
              />
            </div>
          </EditorFormInputBase>
          <EditorFormInputBase label="Deadline">
            <div className={styles.timeDate}>
              <TimeField
                label="Time"
                name="closeTime"
                control={control}
                rules={{ validate: isValidDateTimeInput }}
                sx={{ width: '40%' }}
              />
              <DatePicker
                name="closeDate"
                control={control}
                rules={{ validate: isValidDateTimeInput }}
                label="Date"
                format="DD/MM/YYYY"
                sx={{ width: '60%' }}
              />
            </div>
          </EditorFormInputBase>
          <EditorFormInputBase label="Duration" htmlFor="duration" width="50%">
            <TextField
              id="duration"
              name="duration"
              control={control}
              rules={{ required: true }}
              type="number"
              label="Minutes"
              InputProps={{ inputProps: { min: 1 } }}
              variant="outlined"
              sx={{ width: '5rem' }}
            />
          </EditorFormInputBase>
          <EditorFormInputBase label="Weighting" htmlFor="weighting" width="50%">
            <TextField
              id="weighting"
              name="weighting"
              control={control}
              rules={{ required: true }}
              type="number"
              label="/100"
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              variant="outlined"
              sx={{ width: '5rem' }}
            />
          </EditorFormInputBase>
        </section>
        <RichTextInput
          id="description"
          name="description"
          control={control}
          rules={{ validate: (val) => !isBlank(val) }}
          setValue={setValue}
          defaultValue={description}
          label="Description"
        />
        <QuestionEditingCards
          fields={fields}
          getValues={getValues}
          remove={remove}
          move={move}
          control={control}
          getNextKey={getNextKey}
          setValue={setValue}
          questionTexts={questionTexts}
        />
        <IconButton
          sx={{
            backgroundColor: theme.palette.primary.main,
            display: 'block',
            verticalAlign: 'top',
            lineHeight: '1rem',
            margin: '0 auto 1rem',
            '&:hover': {
              backgroundColor: theme.palette.primary.active,
            },
          }}
          onClick={() => {
            append({
              key: getNextKey(),
              questionText: '',
              questionType: 'Multiple Choice',
              maximumMark: 1,
              options: [],
            });
          }}
        >
          <AddOutlined sx={{ fill: theme.palette.custom.background, fontSize: '2.5rem' }} />
        </IconButton>
        <FormFooter onCancel={handleCancel} errorMessage={errorMsg} />
      </form>
    </div>
  );
}
