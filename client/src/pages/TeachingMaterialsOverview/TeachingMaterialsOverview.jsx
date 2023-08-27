import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BottomRightAddButton from '../../components/BottomRightAddButton';
import OverviewCard from './TeachingMaterialCard';
import SearchBar from '../../components/SearchBar';
import { deleteMaterial, getMaterials } from '../../utils/api/materials';
import { CourseContext } from '../../utils/contexts';
import { getMatchingEntities } from '../../utils/helpers';

import globalStyles from '../../index.module.css';

export default function TeachingMaterialsOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const [topics, setTopics] = useState([]);
  const [searchedMaterialIds, setSearchedMaterialIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (searchTerm) => {
    if (searchTerm.match(/^\s*$/)) {
      setErrorMessage('Please enter a search term.');
      return;
    }
    const matchingMaterialIds = getMatchingEntities(searchTerm, topics);
    setSearchedMaterialIds(matchingMaterialIds);
    if (matchingMaterialIds.size === 0) {
      setErrorMessage(
        'Your search yielded no results. Either no matching materials were found, or not enough key words were used.'
      );
    }
  };

  const handleClear = () => {
    setErrorMessage('');
    setSearchedMaterialIds(new Set());
  };

  const handleGetMaterials = useCallback(() => {
    getMaterials(courseId, navigate)
      .then((data) => {
        setTopics(
          data
            .sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime())
            .map((material) => ({
              id: material.materialId,
              title: material.materialName,
              text: material.description,
              timeCreated: new Date(material.timeCreated),
            }))
        );
      })
      .catch((err) => console.error(err.message));
  }, [navigate, courseId]);

  const handleDelete = (materialId) => {
    deleteMaterial(materialId, navigate)
      .then(handleGetMaterials)
      .catch((err) => console.error(err.message));
  };

  useEffect(() => {
    // Get all materials
    handleGetMaterials();
  }, [handleGetMaterials]);

  const handleAdd = () => {
    navigate(`/${courseId}/materials/edit`);
  };

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>Teaching Materials</h2>
      <SearchBar
        handleSearch={handleSearch}
        handleClear={handleClear}
        errorMessage={errorMessage}
      />
      {topics
        .filter((topic) => searchedMaterialIds.size === 0 || searchedMaterialIds.has(topic.id))
        .map((topic) => (
          <OverviewCard
            key={topic.id}
            id={topic.id}
            title={topic.title}
            date={topic.timeCreated}
            isTeacher={isTeacher}
            handleDelete={handleDelete}
          />
        ))}
      {isTeacher && (
        <BottomRightAddButton tooltipLabel="Create New Teaching Material" handleAdd={handleAdd} />
      )}
    </div>
  );
}
