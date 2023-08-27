import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BottomRightAddButton from '../../components/BottomRightAddButton';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from './CategoryFilter/CategoryFilter';
import PostCards from './PostCards/PostCards';
import CategoryEditor from './CategoryEditor/CategoryEditor';
import { CourseContext } from '../../utils/contexts';
import { getCategories, getPosts, updateCategories } from '../../utils/api/forum';
import { getMatchingEntities } from '../../utils/helpers';

import globalStyles from '../../index.module.css';

export default function Forum() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [searchedPostIds, setSearchedPostIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const handleSearch = (searchTerm) => {
    if (searchTerm.match(/^\s*$/)) {
      setErrorMessage('Please enter a search term.');
      return;
    }
    const matchingPostIds = getMatchingEntities(
      searchTerm,
      posts.map((post) => ({ id: post.postId, ...post }))
    );
    setSearchedPostIds(matchingPostIds);
    if (matchingPostIds.size === 0) {
      setErrorMessage(
        'Your search yielded no results. Either no matching posts were found, or not enough key words were used.'
      );
      return;
    }
    setErrorMessage('');
  };

  const handleClear = () => {
    setErrorMessage('');
    setSearchedPostIds(new Set());
  };

  const handleSubmit = (newCategories, setModalErrorMessage) => {
    if (newCategories.some((category) => category.categoryName.match(/^\s*$/))) {
      setModalErrorMessage('Do not leave category name blank');
      return;
    }
    updateCategories(courseId, newCategories, navigate)
      .then(() => {
        setModalErrorMessage('');
        setShowModal(false);
        return getCategories(courseId, navigate);
      })
      .then(setCategories)
      .then(() => getPosts(courseId, navigate).then(setPosts))
      .catch((err) => {
        setErrorMessage(err.message);
        console.error(err.message);
      });
  };

  useEffect(() => {
    getPosts(courseId, navigate).then((fetchedPosts) => {
      fetchedPosts.sort((a, b) => b.timePosted - a.timePosted);
      setPosts(fetchedPosts);
    });
    getCategories(courseId, navigate).then(setCategories);
  }, [courseId, navigate]);

  return (
    <div className={globalStyles.pageContainer}>
      <h1 className={globalStyles.pageHeading}>Forum</h1>
      <SearchBar
        handleSearch={handleSearch}
        handleClear={handleClear}
        errorMessage={errorMessage}
      />
      <CategoryFilter
        categories={categories}
        setShowModal={setShowModal}
        activeCategories={activeCategories}
        setActiveCategories={setActiveCategories}
        isTeacher={isTeacher}
      />
      <PostCards
        posts={posts.filter(
          (post) =>
            (activeCategories.size === 0 || activeCategories.has(post.categoryId)) &&
            (searchedPostIds.size === 0 || searchedPostIds.has(post.postId))
        )}
      />
      {showModal && (
        <CategoryEditor
          categories={categories}
          showModal={showModal}
          setShowModal={setShowModal}
          handleSubmit={handleSubmit}
          isTeacher={isTeacher}
        />
      )}
      <BottomRightAddButton
        tooltipLabel="Create New Forum Post"
        handleAdd={() => navigate(`edit`)}
      />
    </div>
  );
}
