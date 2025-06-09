import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CohortManager = () => {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studyId]);

  const fetchData = async () => {
    try {
      const [studyRes, cohortsRes, animalsRes] = await Promise.all([
        axios.get(`${API}/studies/${studyId}`),
        axios.get(`${API}/studies/${studyId}/cohorts`),
        axios.get(`${API}/animals`)
      ]);
      
      setStudy(studyRes.data);
      setCohorts(cohortsRes.data);
      setAnimals(animalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCohort = async (cohortData) => {
    try {
      await axios.post(`${API}/cohorts`, cohortData);
      await fetchData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating cohort:', error);
    }
  };

  const assignAnimal = async (cohortId, animalId) => {
    try {
      await axios.post(`${API}/cohorts/${cohortId}/animals/${animalId}`);
      await fetchData();
    } catch (error) {
      console.error('Error assigning animal:', error);
    }
  };

  const removeAnimal = async (cohortId, animalId) => {
    try {
      await axios.delete(`${API}/cohorts/${cohortId}/animals/${animalId}`);
      await fetchData();
    } catch (error) {
      console.error('Error removing animal:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading cohorts...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/studies" className="hover:text-blue-600">Studies</Link>
          <span>/</span>
          <span className="text-gray-900">{study?.name}</span>
          <span>/</span>
          <span className="text-gray-900">Cohorts</span>
        </nav>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Cohort Management</h2>
            <p className="text-gray-600">Manage animal groups for {study?.name}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Cohort</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateCohortForm 
          studyId={studyId}
          onSubmit={createCohort} 
          onCancel={() => setShowCreateForm(false)} 
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cohorts List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Study Cohorts ({cohorts.length})</h3>
            </div>
            <div className="divide-y">
              {cohorts.map((cohort) => (
                <CohortCard 
                  key={cohort.id} 
                  cohort={cohort} 
                  onSelect={() => setSelectedCohort(cohort)}
                  isSelected={selectedCohort?.id === cohort.id}
                />
              ))}
              {cohorts.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No cohorts created yet. Create your first cohort to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cohort Details */}
        <div className="lg:col-span-1">
          {selectedCohort ? (
            <CohortDetails 
              cohort={selectedCohort} 
              animals={animals}
              onAssignAnimal={assignAnimal}
              onRemoveAnimal={removeAnimal}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a cohort to manage animals
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CohortCard = ({ cohort, onSelect, isSelected }) => {
  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{cohort.name}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cohort.description}</p>
          {cohort.criteria && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              <strong>Criteria:</strong> {cohort.criteria}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <span className="text-gray-500">
              Animals: {cohort.animal_ids.length}/{cohort.planned_animal_count}
            </span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{
                    width: `${Math.min(100, (cohort.animal_ids.length / cohort.planned_animal_count) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCohortForm = ({ studyId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    study_id: studyId,
    name: '',
    description: '',
    criteria: '',
    planned_animal_count: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.planned_animal_count) {
      submitData.planned_animal_count = parseInt(submitData.planned_animal_count);
    }
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Cohort</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Control Group, High Dose Group"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Animal Count</label>
            <input
              type="number"
              min="1"
              required
              value={formData.planned_animal_count}
              onChange={(e) => setFormData({...formData, planned_animal_count: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the cohort and treatment..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inclusion Criteria</label>
          <textarea
            value={formData.criteria}
            onChange={(e) => setFormData({...formData, criteria: e.target.value})}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Male Wistar rats, 8-10 weeks old, body weight 200-300g"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create Cohort
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const CohortDetails = ({ cohort, animals, onAssignAnimal, onRemoveAnimal }) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  
  const assignedAnimals = animals.filter(animal => cohort.animal_ids.includes(animal.id));
  const availableAnimals = animals.filter(animal => !cohort.animal_ids.includes(animal.id));

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{cohort.name}</h3>
        <p className="text-sm text-gray-600">{cohort.description}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Cohort Info */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Planned Count:</span>
            <span className="font-medium">{cohort.planned_animal_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Count:</span>
            <span className="font-medium">{cohort.animal_ids.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fill Rate:</span>
            <span className="font-medium">
              {Math.round((cohort.animal_ids.length / cohort.planned_animal_count) * 100)}%
            </span>
          </div>
        </div>

        {cohort.criteria && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Inclusion Criteria</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{cohort.criteria}</p>
          </div>
        )}

        {/* Assigned Animals */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Assigned Animals</h4>
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Assign Animal
            </button>
          </div>

          {showAssignForm && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium mb-2">Available Animals</h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableAnimals.map(animal => (
                  <div key={animal.id} className="flex justify-between items-center text-sm">
                    <span>{animal.animal_id} ({animal.sex} {animal.species})</span>
                    <button
                      onClick={() => {
                        onAssignAnimal(cohort.id, animal.id);
                        setShowAssignForm(false);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {availableAnimals.length === 0 && (
                  <p className="text-gray-500 text-sm">No available animals</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assignedAnimals.map(animal => (
              <div key={animal.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{animal.animal_id}</div>
                  <div className="text-xs text-gray-600">
                    {animal.sex} {animal.species} {animal.strain && `- ${animal.strain}`}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAnimal(cohort.id, animal.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {assignedAnimals.length === 0 && (
              <p className="text-gray-500 text-sm">No animals assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CohortManager;
