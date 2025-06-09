import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudyProcedureManager = () => {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [studyProcedures, setStudyProcedures] = useState([]);
  const [masterProcedures, setMasterProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studyId]);

  const fetchData = async () => {
    try {
      const [studyRes, studyProceduresRes, masterProceduresRes] = await Promise.all([
        axios.get(`${API}/studies/${studyId}`),
        axios.get(`${API}/studies/${studyId}/procedures`),
        axios.get(`${API}/master-procedures`)
      ]);
      
      setStudy(studyRes.data);
      setStudyProcedures(studyProceduresRes.data);
      setMasterProcedures(masterProceduresRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const importProcedure = async (masterProcedureId, studySpecificCost) => {
    try {
      const importData = {
        master_procedure_id: masterProcedureId,
        study_specific_cost: studySpecificCost || null
      };
      
      await axios.post(`${API}/studies/${studyId}/procedures`, importData);
      await fetchData();
      setShowImportForm(false);
    } catch (error) {
      console.error('Error importing procedure:', error);
      alert('Error importing procedure. It may already be imported.');
    }
  };

  if (loading) {
    return <div className="p-6">Loading study procedures...</div>;
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
          <span className="text-gray-900">Procedures</span>
        </nav>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Study Procedures</h2>
            <p className="text-gray-600">Manage procedures and costs for {study?.name}</p>
          </div>
          <button
            onClick={() => setShowImportForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>+</span>
            <span>Import Procedure</span>
          </button>
        </div>
      </div>

      {/* Import Form */}
      {showImportForm && (
        <ImportProcedureForm 
          masterProcedures={masterProcedures}
          studyProcedures={studyProcedures}
          onImport={importProcedure} 
          onCancel={() => setShowImportForm(false)} 
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Procedures List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Imported Procedures ({studyProcedures.length})</h3>
            </div>
            <div className="divide-y">
              {studyProcedures.map((procedure) => (
                <StudyProcedureCard 
                  key={procedure.id} 
                  procedure={procedure} 
                  onSelect={() => setSelectedProcedure(procedure)}
                  isSelected={selectedProcedure?.id === procedure.id}
                />
              ))}
              {studyProcedures.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No procedures imported yet. Import procedures from the master library to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Procedure Details */}
        <div className="lg:col-span-1">
          {selectedProcedure ? (
            <StudyProcedureDetails procedure={selectedProcedure} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a procedure to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudyProcedureCard = ({ procedure, onSelect, isSelected }) => {
  const categoryColors = {
    'Sample Collection': 'bg-blue-100 text-blue-800',
    'In-life Measurement': 'bg-green-100 text-green-800',
    'Terminal Procedure': 'bg-red-100 text-red-800',
    'Bioanalysis': 'bg-purple-100 text-purple-800',
    'Observation': 'bg-yellow-100 text-yellow-800'
  };

  const effectiveCost = procedure.study_specific_cost || procedure.default_cost || 0;
  const hasOverride = procedure.study_specific_cost !== null && procedure.study_specific_cost !== undefined;

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{procedure.name}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{procedure.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[procedure.category] || 'bg-gray-100 text-gray-800'}`}>
              {procedure.category}
            </span>
            <div className="text-xs">
              <span className={`font-medium ${hasOverride ? 'text-orange-600' : 'text-gray-500'}`}>
                ${effectiveCost.toFixed(2)} {procedure.currency}
              </span>
              {hasOverride && (
                <span className="ml-2 text-orange-600 bg-orange-100 px-1 rounded">Override</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {procedure.input_fields.length} fields
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Imported: {new Date(procedure.imported_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyProcedureDetails = ({ procedure }) => {
  const [editingCost, setEditingCost] = useState(false);
  const [newCost, setNewCost] = useState(procedure.study_specific_cost || procedure.default_cost || 0);

  const effectiveCost = procedure.study_specific_cost || procedure.default_cost || 0;
  const hasOverride = procedure.study_specific_cost !== null && procedure.study_specific_cost !== undefined;

  const handleCostUpdate = async () => {
    try {
      // Note: This would require implementing a PUT endpoint for study procedures
      // For now, we'll just update the local state
      setEditingCost(false);
      console.log('Cost update functionality would be implemented here');
    } catch (error) {
      console.error('Error updating cost:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{procedure.name}</h3>
        <p className="text-sm text-gray-600">{procedure.description}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Procedure Info */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{procedure.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Master Default Cost:</span>
            <span className="font-medium">${procedure.default_cost || 0} {procedure.currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Study Cost:</span>
            <div className="flex items-center space-x-2">
              {editingCost ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleCostUpdate}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingCost(false)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${hasOverride ? 'text-orange-600' : 'text-gray-800'}`}>
                    ${effectiveCost.toFixed(2)} {procedure.currency}
                  </span>
                  <button
                    onClick={() => setEditingCost(true)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
          {hasOverride && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              This procedure has a study-specific cost override.
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Input Fields:</span>
            <span className="font-medium">{procedure.input_fields.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Imported:</span>
            <span className="font-medium text-xs">{new Date(procedure.imported_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Data Collection Fields */}
        {procedure.input_fields.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Data Collection Fields</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {procedure.input_fields.map((field) => (
                <div key={field.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{field.label}</div>
                      <div className="text-xs text-gray-600">
                        Type: {field.field_type}
                        {field.units && ` • Units: ${field.units}`}
                        {field.is_mandatory && ' • Required'}
                      </div>
                    </div>
                  </div>
                  {field.options && field.options.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      <strong>Options:</strong> {field.options.join(', ')}
                    </div>
                  )}
                  {field.validation_rules && (
                    <div className="mt-1 text-xs text-gray-500">
                      <strong>Validation:</strong> {JSON.stringify(field.validation_rules)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Information */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Usage in Study</h4>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p>This procedure snapshot was imported from the master library and preserves the original configuration.</p>
            <p className="mt-1">Cost overrides only apply to this study and don't affect the master procedure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImportProcedureForm = ({ masterProcedures, studyProcedures, onImport, onCancel }) => {
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [studySpecificCost, setStudySpecificCost] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  // Get IDs of already imported procedures
  const importedProcedureIds = studyProcedures.map(sp => sp.master_procedure_id);
  
  // Filter out already imported procedures
  const availableProcedures = masterProcedures.filter(mp => !importedProcedureIds.includes(mp.id));

  const handleProcedureSelect = (procedureId) => {
    setSelectedProcedureId(procedureId);
    const procedure = masterProcedures.find(p => p.id === procedureId);
    setSelectedProcedure(procedure);
    // Set default cost as placeholder
    if (procedure) {
      setStudySpecificCost(procedure.default_cost.toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProcedureId) return;
    
    const cost = studySpecificCost ? parseFloat(studySpecificCost) : null;
    onImport(selectedProcedureId, cost);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Import Procedure from Master Library</h3>
      
      {availableProcedures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">All available procedures have been imported to this study.</p>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Procedure</label>
            <select
              value={selectedProcedureId}
              onChange={(e) => handleProcedureSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Choose a procedure to import...</option>
              {availableProcedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name} - {procedure.category} (${procedure.default_cost})
                </option>
              ))}
            </select>
          </div>

          {selectedProcedure && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Procedure Preview</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {selectedProcedure.name}</p>
                <p><strong>Category:</strong> {selectedProcedure.category}</p>
                <p><strong>Description:</strong> {selectedProcedure.description}</p>
                <p><strong>Default Cost:</strong> ${selectedProcedure.default_cost} {selectedProcedure.currency}</p>
                <p><strong>Input Fields:</strong> {selectedProcedure.input_fields.length}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study-Specific Cost Override (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={studySpecificCost}
                onChange={(e) => setStudySpecificCost(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder={selectedProcedure ? selectedProcedure.default_cost.toString() : "0.00"}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use the default cost from master library. Override only applies to this study.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              disabled={!selectedProcedureId}
            >
              Import Procedure
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
      )}
    </div>
  );
};

export default StudyProcedureManager;
