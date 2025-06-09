import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VisitManager = () => {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [visits, setVisits] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studyId]);

  const fetchData = async () => {
    try {
      const [studyRes, visitsRes, cohortsRes, proceduresRes] = await Promise.all([
        axios.get(`${API}/studies/${studyId}`),
        axios.get(`${API}/studies/${studyId}/visits`),
        axios.get(`${API}/studies/${studyId}/cohorts`),
        axios.get(`${API}/studies/${studyId}/procedures`)
      ]);
      
      setStudy(studyRes.data);
      setVisits(visitsRes.data);
      setCohorts(cohortsRes.data);
      setProcedures(proceduresRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVisit = async (visitData) => {
    try {
      await axios.post(`${API}/visits`, visitData);
      await fetchData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating visit:', error);
    }
  };

  const updateVisitStatus = async (visitId, status) => {
    try {
      await axios.put(`${API}/visits/${visitId}`, { status });
      await fetchData();
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const assignProcedure = async (visitId, procedureId, sequenceOrder) => {
    try {
      await axios.post(`${API}/visits/${visitId}/procedures`, {
        study_procedure_id: procedureId,
        sequence_order: sequenceOrder
      });
      await fetchData();
    } catch (error) {
      console.error('Error assigning procedure:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading visits...</div>;
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
          <span className="text-gray-900">Visits</span>
        </nav>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Visit Schedule</h2>
            <p className="text-gray-600">Manage timepoints and assessments for {study?.name}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Visit</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateVisitForm 
          studyId={studyId}
          cohorts={cohorts}
          onSubmit={createVisit} 
          onCancel={() => setShowCreateForm(false)} 
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Study Timeline ({visits.length} visits)</h3>
            </div>
            <div className="p-4">
              {visits.length > 0 ? (
                <VisitTimeline 
                  visits={visits} 
                  selectedVisit={selectedVisit}
                  onSelectVisit={setSelectedVisit}
                  onUpdateStatus={updateVisitStatus}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No visits scheduled yet. Create your first visit to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visit Details */}
        <div className="lg:col-span-1">
          {selectedVisit ? (
            <VisitDetails 
              visit={selectedVisit} 
              cohorts={cohorts}
              procedures={procedures}
              onAssignProcedure={assignProcedure}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a visit to view details and manage procedures
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VisitTimeline = ({ visits, selectedVisit, onSelectVisit, onUpdateStatus }) => {
  const sortedVisits = [...visits].sort((a, b) => {
    if (a.planned_date && b.planned_date) {
      return new Date(a.planned_date) - new Date(b.planned_date);
    }
    return a.planned_timepoint.localeCompare(b.planned_timepoint);
  });

  const statusColors = {
    'Scheduled': 'bg-gray-100 text-gray-800',
    'Upcoming': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Missed': 'bg-red-100 text-red-800',
    'Skipped': 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="space-y-4">
      {sortedVisits.map((visit, index) => (
        <div key={visit.id} className="flex items-start space-x-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedVisit?.id === visit.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
            }`}></div>
            {index < sortedVisits.length - 1 && (
              <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
            )}
          </div>

          {/* Visit card */}
          <div 
            className={`flex-1 p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedVisit?.id === visit.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelectVisit(visit)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-800">{visit.name}</h4>
                <p className="text-sm text-gray-600">{visit.label} • {visit.planned_timepoint}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[visit.status]}`}>
                  {visit.status}
                </span>
                <div className="relative">
                  <select
                    value={visit.status}
                    onChange={(e) => onUpdateStatus(visit.id, e.target.value)}
                    className="text-xs bg-transparent border-none outline-none cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                </div>
              </div>
            </div>
            
            {visit.description && (
              <p className="text-sm text-gray-600 mb-2">{visit.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{visit.cohort_ids.length} cohort(s)</span>
              {visit.planned_date && (
                <span>Planned: {new Date(visit.planned_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CreateVisitForm = ({ studyId, cohorts, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    study_id: studyId,
    name: '',
    label: '',
    description: '',
    planned_timepoint: '',
    planned_date: '',
    cohort_ids: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.planned_date) delete submitData.planned_date;
    if (!submitData.description) delete submitData.description;
    onSubmit(submitData);
  };

  const handleCohortToggle = (cohortId) => {
    const newCohortIds = formData.cohort_ids.includes(cohortId)
      ? formData.cohort_ids.filter(id => id !== cohortId)
      : [...formData.cohort_ids, cohortId];
    setFormData({ ...formData, cohort_ids: newCohortIds });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Visit</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Baseline Screening, Week 4 Assessment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Label</label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., V1, W4D1, BL"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional description of visit objectives..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Timepoint</label>
            <input
              type="text"
              required
              value={formData.planned_timepoint}
              onChange={(e) => setFormData({...formData, planned_timepoint: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Day 0, Day 7 ± 1, Week 4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Date</label>
            <input
              type="date"
              value={formData.planned_date}
              onChange={(e) => setFormData({...formData, planned_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Participating Cohorts</label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {cohorts.map((cohort) => (
              <label key={cohort.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.cohort_ids.includes(cohort.id)}
                  onChange={() => handleCohortToggle(cohort.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{cohort.name}</span>
                <span className="text-xs text-gray-500">({cohort.animal_ids.length} animals)</span>
              </label>
            ))}
            {cohorts.length === 0 && (
              <p className="text-sm text-gray-500">No cohorts available. Create cohorts first.</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            disabled={formData.cohort_ids.length === 0}
          >
            Create Visit
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

const VisitDetails = ({ visit, cohorts, procedures, onAssignProcedure }) => {
  const [visitProcedures, setVisitProcedures] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [visitCost, setVisitCost] = useState(null);

  useEffect(() => {
    if (visit) {
      fetchVisitDetails();
    }
  }, [visit]);

  const fetchVisitDetails = async () => {
    try {
      const [proceduresRes, costRes] = await Promise.all([
        axios.get(`${API}/visits/${visit.id}/procedures`),
        axios.get(`${API}/visits/${visit.id}/cost`)
      ]);
      setVisitProcedures(proceduresRes.data);
      setVisitCost(costRes.data);
    } catch (error) {
      console.error('Error fetching visit details:', error);
    }
  };

  const visitCohorts = cohorts.filter(cohort => visit.cohort_ids.includes(cohort.id));
  const assignedProcedureIds = visitProcedures.map(vp => vp.study_procedure_id);
  const availableProcedures = procedures.filter(p => !assignedProcedureIds.includes(p.id));

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{visit.name}</h3>
        <p className="text-sm text-gray-600">{visit.label} • {visit.planned_timepoint}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Visit Info */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">{visit.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cohorts:</span>
            <span className="font-medium">{visit.cohort_ids.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Procedures:</span>
            <span className="font-medium">{visitProcedures.length}</span>
          </div>
          {visitCost && (
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-medium">${visitCost.total_cost.toFixed(2)}</span>
            </div>
          )}
        </div>

        {visit.description && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Description</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{visit.description}</p>
          </div>
        )}

        {/* Participating Cohorts */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Participating Cohorts</h4>
          <div className="space-y-2">
            {visitCohorts.map(cohort => (
              <div key={cohort.id} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium">{cohort.name}</div>
                <div className="text-gray-600">{cohort.animal_ids.length} animals</div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Procedures */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Procedures</h4>
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Assign Procedure
            </button>
          </div>

          {showAssignForm && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium mb-2">Available Procedures</h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableProcedures.map(procedure => (
                  <div key={procedure.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{procedure.name}</span>
                      <span className="text-gray-500 ml-2">${procedure.study_specific_cost || procedure.default_cost}</span>
                    </div>
                    <button
                      onClick={() => {
                        onAssignProcedure(visit.id, procedure.id, visitProcedures.length + 1);
                        setShowAssignForm(false);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {availableProcedures.length === 0 && (
                  <p className="text-gray-500 text-sm">No available procedures</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {visitProcedures
              .sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0))
              .map(visitProcedure => {
                const procedure = procedures.find(p => p.id === visitProcedure.study_procedure_id);
                return procedure ? (
                  <div key={visitProcedure.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{procedure.name}</div>
                      <div className="text-xs text-gray-600">
                        Order: {visitProcedure.sequence_order || 'N/A'} • 
                        Cost: ${procedure.study_specific_cost || procedure.default_cost}
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            {visitProcedures.length === 0 && (
              <p className="text-gray-500 text-sm">No procedures assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitManager;
