import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import CohortManager from "./components/CohortManager";
import VisitManager from "./components/VisitManager";
import StudyProcedureManager from "./components/StudyProcedureManager";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/studies", label: "Studies", icon: "📊" },
    { path: "/animals", label: "Animals", icon: "🐭" },
    { path: "/procedures", label: "Procedure Library", icon: "📋" },
  ];

  return (
    <nav className="bg-blue-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🧬</span>
          <h1 className="text-xl font-bold">Preclinical Research Manager</h1>
        </div>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-700 text-white"
                  : "hover:bg-blue-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    studies: 0,
    animals: 0,
    procedures: 0,
    cohorts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studiesRes, animalsRes, proceduresRes] = await Promise.all([
          axios.get(`${API}/studies`),
          axios.get(`${API}/animals`),
          axios.get(`${API}/master-procedures`),
        ]);

        setStats({
          studies: studiesRes.data.length,
          animals: animalsRes.data.length,
          procedures: proceduresRes.data.length,
          cohorts: 0, // We'll calculate this when we load studies
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Active Studies",
      value: stats.studies,
      icon: "📊",
      color: "bg-blue-500",
    },
    {
      label: "Animals",
      value: stats.animals,
      icon: "🐭",
      color: "bg-green-500",
    },
    {
      label: "Procedures",
      value: stats.procedures,
      icon: "📋",
      color: "bg-purple-500",
    },
    {
      label: "Cohorts",
      value: stats.cohorts,
      icon: "👥",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Overview of your preclinical research studies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/studies"
              className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">📊</span>
                <span className="text-blue-800 font-medium">
                  Create New Study
                </span>
              </div>
            </Link>
            <Link
              to="/animals"
              className="block w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-green-600">🐭</span>
                <span className="text-green-800 font-medium">Add Animals</span>
              </div>
            </Link>
            <Link
              to="/procedures"
              className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">📋</span>
                <span className="text-purple-800 font-medium">
                  Manage Procedures
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">Database Connection</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">API Services</span>
              <span className="text-green-600 font-medium">✓ Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">Version</span>
              <span className="text-blue-600 font-medium">v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Studies Management Component
const StudiesManager = () => {
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      const response = await axios.get(`${API}/studies`);
      setStudies(response.data);
    } catch (error) {
      console.error("Error fetching studies:", error);
    } finally {
      setLoading(false);
    }
  };

  const createStudy = async (studyData) => {
    try {
      await axios.post(`${API}/studies`, studyData);
      await fetchStudies();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating study:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading studies...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Studies</h2>
          <p className="text-gray-600">Manage your research studies</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Study</span>
        </button>
      </div>

      {showCreateForm && (
        <CreateStudyForm
          onSubmit={createStudy}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">All Studies</h3>
            </div>
            <div className="divide-y">
              {studies.map((study) => (
                <StudyCard
                  key={study.id}
                  study={study}
                  onSelect={() => setSelectedStudy(study)}
                  isSelected={selectedStudy?.id === study.id}
                />
              ))}
              {studies.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No studies found. Create your first study to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedStudy ? (
            <StudyDetails study={selectedStudy} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select a study to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Study Card Component
const StudyCard = ({ study, onSelect, isSelected }) => {
  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{study.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{study.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>PI: {study.principal_investigator}</span>
            <span
              className={`px-2 py-1 rounded-full ${
                study.status === "Planning"
                  ? "bg-yellow-100 text-yellow-800"
                  : study.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {study.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Study Form Component
const CreateStudyForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    principal_investigator: "",
    start_date: "",
    end_date: "",
    status: "Planning",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.start_date) submitData.start_date = submitData.start_date;
    if (submitData.end_date) submitData.end_date = submitData.end_date;
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Study</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal Investigator
            </label>
            <input
              type="text"
              required
              value={formData.principal_investigator}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  principal_investigator: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create Study
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

// Study Details Component
const StudyDetails = ({ study }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cohorts, setCohorts] = useState([]);
  const [visits, setVisits] = useState([]);
  const [procedures, setProcedures] = useState([]);

  useEffect(() => {
    if (study) {
      fetchStudyData();
    }
  }, [study]);

  const fetchStudyData = async () => {
    try {
      const [cohortsRes, visitsRes, proceduresRes] = await Promise.all([
        axios.get(`${API}/studies/${study.id}/cohorts`),
        axios.get(`${API}/studies/${study.id}/visits`),
        axios.get(`${API}/studies/${study.id}/procedures`),
      ]);

      setCohorts(cohortsRes.data);
      setVisits(visitsRes.data);
      setProcedures(proceduresRes.data);
    } catch (error) {
      console.error("Error fetching study data:", error);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "cohorts", label: "Cohorts", icon: "👥" },
    { id: "visits", label: "Visits", icon: "📅" },
    { id: "procedures", label: "Procedures", icon: "📋" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{study.name}</h3>
        <p className="text-sm text-gray-600">{study.description}</p>
      </div>

      <div className="border-b">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Investigator:</span>
                <span className="font-medium">
                  {study.principal_investigator}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    study.status === "Planning"
                      ? "bg-yellow-100 text-yellow-800"
                      : study.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {study.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cohorts:</span>
                <span className="font-medium">{cohorts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visits:</span>
                <span className="font-medium">{visits.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Procedures:</span>
                <span className="font-medium">{procedures.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cohorts" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Cohorts ({cohorts.length})</h4>
              <Link
                to={`/studies/${study.id}/cohorts`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage →
              </Link>
            </div>
            <div className="space-y-2">
              {cohorts.map((cohort) => (
                <div key={cohort.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{cohort.name}</div>
                  <div className="text-xs text-gray-600">
                    {cohort.animal_ids.length}/{cohort.planned_animal_count}{" "}
                    animals
                  </div>
                </div>
              ))}
              {cohorts.length === 0 && (
                <p className="text-gray-500 text-sm">No cohorts created yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "visits" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Visits ({visits.length})</h4>
              <Link
                to={`/studies/${study.id}/visits`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage →
              </Link>
            </div>
            <div className="space-y-2">
              {visits.map((visit) => (
                <div key={visit.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{visit.name}</div>
                  <div className="text-xs text-gray-600">
                    {visit.planned_timepoint}
                  </div>
                </div>
              ))}
              {visits.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No visits scheduled yet.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "procedures" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Procedures ({procedures.length})</h4>
              <Link
                to={`/studies/${study.id}/procedures`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage →
              </Link>
            </div>
            <div className="space-y-2">
              {procedures.map((procedure) => (
                <div key={procedure.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{procedure.name}</div>
                  <div className="text-xs text-gray-600">
                    {procedure.category}
                  </div>
                </div>
              ))}
              {procedures.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No procedures imported yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Animals Management Component
const AnimalsManager = () => {
  const [animals, setAnimals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await axios.get(`${API}/animals`);
      setAnimals(response.data);
    } catch (error) {
      console.error("Error fetching animals:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAnimal = async (animalData) => {
    try {
      await axios.post(`${API}/animals`, animalData);
      await fetchAnimals();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating animal:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading animals...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Animals</h2>
          <p className="text-gray-600">Manage your research animals</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Animal</span>
        </button>
      </div>

      {showCreateForm && (
        <CreateAnimalForm
          onSubmit={createAnimal}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            All Animals ({animals.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Animal ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sex
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birth Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {animal.animal_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.species}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.strain || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.sex}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.weight ? `${animal.weight}g` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.birth_date || "N/A"}
                  </td>
                </tr>
              ))}
              {animals.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No animals found. Add your first animal to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Create Animal Form Component
const CreateAnimalForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    animal_id: "",
    species: "",
    strain: "",
    sex: "",
    birth_date: "",
    weight: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.weight) submitData.weight = parseFloat(submitData.weight);
    if (!submitData.birth_date) delete submitData.birth_date;
    if (!submitData.strain) delete submitData.strain;
    if (!submitData.weight) delete submitData.weight;
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add New Animal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal ID
            </label>
            <input
              type="text"
              required
              value={formData.animal_id}
              onChange={(e) =>
                setFormData({ ...formData, animal_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., A001, RAT-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Species
            </label>
            <input
              type="text"
              required
              value={formData.species}
              onChange={(e) =>
                setFormData({ ...formData, species: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Rat, Mouse"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strain
            </label>
            <input
              type="text"
              value={formData.strain}
              onChange={(e) =>
                setFormData({ ...formData, strain: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Wistar, C57BL/6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              required
              value={formData.sex}
              onChange={(e) =>
                setFormData({ ...formData, sex: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) =>
                setFormData({ ...formData, birth_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (grams)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 250.5"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Add Animal
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

// Procedures Library Component
const ProceduresLibrary = () => {
  const [procedures, setProcedures] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const response = await axios.get(`${API}/master-procedures`);
      setProcedures(response.data);
    } catch (error) {
      console.error("Error fetching procedures:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProcedure = async (procedureData) => {
    try {
      await axios.post(`${API}/master-procedures`, procedureData);
      await fetchProcedures();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating procedure:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading procedures...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Master Procedure Library
          </h2>
          <p className="text-gray-600">
            Manage reusable procedures and data collection parameters
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Procedure</span>
        </button>
      </div>

      {showCreateForm && (
        <CreateProcedureForm
          onSubmit={createProcedure}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                All Procedures ({procedures.length})
              </h3>
            </div>
            <div className="divide-y">
              {procedures.map((procedure) => (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  onSelect={() => setSelectedProcedure(procedure)}
                  isSelected={selectedProcedure?.id === procedure.id}
                />
              ))}
              {procedures.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No procedures found. Create your first procedure to get
                  started.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedProcedure ? (
            <ProcedureDetails procedure={selectedProcedure} />
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

// Procedure Card Component
const ProcedureCard = ({ procedure, onSelect, isSelected }) => {
  const categoryColors = {
    "Sample Collection": "bg-blue-100 text-blue-800",
    "In-life Measurement": "bg-green-100 text-green-800",
    "Terminal Procedure": "bg-red-100 text-red-800",
    Bioanalysis: "bg-purple-100 text-purple-800",
    Observation: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-purple-50 border-l-4 border-purple-500" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{procedure.name}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {procedure.description}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                categoryColors[procedure.category] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {procedure.category}
            </span>
            <span className="text-xs text-gray-500">
              ${procedure.default_cost} {procedure.currency}
            </span>
            <span className="text-xs text-gray-500">
              {procedure.input_fields.length} fields
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Procedure Details Component
const ProcedureDetails = ({ procedure }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{procedure.name}</h3>
        <p className="text-sm text-gray-600">{procedure.description}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{procedure.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Default Cost:</span>
            <span className="font-medium">
              ${procedure.default_cost} {procedure.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Input Fields:</span>
            <span className="font-medium">{procedure.input_fields.length}</span>
          </div>
        </div>

        {procedure.input_fields.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Data Collection Fields
            </h4>
            <div className="space-y-2">
              {procedure.input_fields.map((field) => (
                <div key={field.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{field.label}</div>
                      <div className="text-xs text-gray-600">
                        {field.field_type}
                        {field.units && ` (${field.units})`}
                        {field.is_mandatory && " • Required"}
                      </div>
                    </div>
                  </div>
                  {field.options && field.options.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Options: {field.options.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Procedure Form Component
const CreateProcedureForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    default_cost: "",
    currency: "USD",
    input_fields: [],
  });

  const [currentField, setCurrentField] = useState({
    name: "",
    label: "",
    field_type: "",
    is_mandatory: false,
    units: "",
    options: [],
  });

  const [showFieldForm, setShowFieldForm] = useState(false);

  const categories = [
    "Sample Collection",
    "In-life Measurement",
    "Terminal Procedure",
    "Bioanalysis",
    "Observation",
  ];

  const fieldTypes = [
    "string",
    "text_area",
    "number",
    "integer",
    "radio",
    "checkbox",
    "date",
    "time",
    "dropdown",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.default_cost)
      submitData.default_cost = parseFloat(submitData.default_cost);
    onSubmit(submitData);
  };

  const addField = () => {
    if (currentField.name && currentField.label && currentField.field_type) {
      const field = { ...currentField };
      if (
        ["radio", "checkbox", "dropdown"].includes(field.field_type) &&
        field.options.length === 0
      ) {
        alert("Please add at least one option for this field type");
        return;
      }
      setFormData({
        ...formData,
        input_fields: [...formData.input_fields, field],
      });
      setCurrentField({
        name: "",
        label: "",
        field_type: "",
        is_mandatory: false,
        units: "",
        options: [],
      });
      setShowFieldForm(false);
    }
  };

  const removeField = (index) => {
    const newFields = formData.input_fields.filter((_, i) => i !== index);
    setFormData({ ...formData, input_fields: newFields });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create New Procedure</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Blood Collection - Tail Vein"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Detailed procedure description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Cost
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.default_cost}
              onChange={(e) =>
                setFormData({ ...formData, default_cost: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Data Collection Fields
            </label>
            <button
              type="button"
              onClick={() => setShowFieldForm(true)}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              + Add Field
            </button>
          </div>

          {formData.input_fields.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.input_fields.map((field, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{field.label}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({field.field_type})
                    </span>
                    {field.is_mandatory && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {showFieldForm && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={currentField.name}
                    onChange={(e) =>
                      setCurrentField({ ...currentField, name: e.target.value })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="field_name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={currentField.label}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        label: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Field Label"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={currentField.field_type}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        field_type: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select Type</option>
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Units
                  </label>
                  <input
                    type="text"
                    value={currentField.units}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        units: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="mg/dL, mm, etc."
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentField.is_mandatory}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          is_mandatory: e.target.checked,
                        })
                      }
                    />
                    <span className="text-xs">Required</span>
                  </label>
                </div>
              </div>

              {["radio", "checkbox", "dropdown"].includes(
                currentField.field_type
              ) && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={currentField.options.join(", ")}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s),
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addField}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Field
                </button>
                <button
                  type="button"
                  onClick={() => setShowFieldForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Create Procedure
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

// Main App Component
function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/studies" element={<StudiesManager />} />
          <Route path="/studies/:studyId/cohorts" element={<CohortManager />} />
          <Route path="/studies/:studyId/visits" element={<VisitManager />} />
          <Route
            path="/studies/:studyId/procedures"
            element={<StudyProcedureManager />}
          />
          <Route path="/animals" element={<AnimalsManager />} />
          <Route path="/procedures" element={<ProceduresLibrary />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
