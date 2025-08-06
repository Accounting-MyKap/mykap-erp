import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaTimes, FaUndo, FaPlus } from 'react-icons/fa';
import { apiService } from '../services/apiService';

// =================================================================
// --- TIPOS Y INTERFACES ---
// =================================================================

interface AxiosError {
  response?: {
    data?: unknown;
    status?: number;
  };
  message: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClosingStatus {
  sent: boolean;
  signed: boolean;
  filled: boolean;
}

interface Document {
  name: string;
  type: 'Individual' | 'Company' | 'Other' | 'Disclosure' | 'LoanDoc';
  status: 'Missing' | 'Ready for Review' | 'Approved' | 'Rejected' | ClosingStatus;
  stage: string;
}

export interface Prospect {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  loanAmount?: string;
  type: 'Individual' | 'Company';
  loanType: 'Purchase' | 'Refinance';
  stage: string;
  assignedTo: string;
  status: 'In Progress' | 'Completed' | 'Rejected';
  documentsByStage: Record<string, Document[]>;
  currentStage: string;
  openStages: string[];
  createdAt: string;
  code: string;
  closedAt?: string;
  rejectedAt?: string;
  rejectedAtStage?: string;
}

type StageName = 'Pre-validation' | 'KYC (Know Your Customer)' | 'Title Work' | 'Underwriting (UW)' | 'Appraisal' | 'Closing';

// =================================================================
// --- COMPONENTE PRINCIPAL ---
// =================================================================

export default function ProspectsPage() {
  // =================================================================
  // --- ESTADOS ---
  // =================================================================
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'rejected'>('active');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para formularios
  const [createFields, setCreateFields] = useState({
    name: '',
    email: '',
    phone: '',
    loanAmount: '',
    type: 'Individual' as 'Individual' | 'Company',
    loanType: 'Purchase' as 'Purchase' | 'Refinance',
    assignedTo: ''
  });

  const [editFields, setEditFields] = useState({
    name: '',
    type: 'Individual' as 'Individual' | 'Company',
    loanType: 'Purchase' as 'Purchase' | 'Refinance',
    assignedTo: ''
  });

  // Referencias para inputs
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // =================================================================
  // --- CONSTANTES ---
  // =================================================================
  const stages: StageName[] = [
    'Pre-validation',
    'KYC (Know Your Customer)',
    'Title Work',
    'Underwriting (UW)',
    'Appraisal',
    'Closing'
  ];

  // =================================================================
  // --- FUNCIONES AUXILIARES ---
  // =================================================================
  const getUserNameById = (userId: string): string => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  };

  const isClosingStatus = (status: unknown): status is ClosingStatus => {
    return typeof status === 'object' && status !== null && 'sent' in status && 'signed' in status && 'filled' in status;
  };

  const selectedProspect = prospects.find(p => p._id === selectedProspectId || p.id === selectedProspectId);
  const currentStageIdx = selectedProspect ? stages.indexOf(selectedProspect.currentStage as StageName) : -1;
  
  const isCompleted = selectedProspect ? stages.every(
    stage => (selectedProspect.documentsByStage[stage] || []).length > 0 && 
    (selectedProspect.documentsByStage[stage] || []).every(doc => {
      if (stage === 'Closing') {
        if ((doc.type === 'Disclosure' || doc.type === 'LoanDoc') && isClosingStatus(doc.status)) {
          return doc.status.sent && doc.status.signed && doc.status.filled;
        } else {
          return doc.status === 'Approved';
        }
      } else {
        return doc.status === 'Approved';
      }
    })
  ) : false;

  // =================================================================
  // --- EFECTOS ---
  // =================================================================
  useEffect(() => {
    fetchData();
  }, []);

  // =================================================================
  // --- FUNCIONES DE DATOS ---
  // =================================================================
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prospectsData, usersData] = await Promise.all([
        apiService.getProspects(),
        apiService.getAllUsers()
      ]);
      setProspects(prospectsData);
      setUsers(usersData);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // =================================================================
  // --- MANEJADORES DE EVENTOS ---
  // =================================================================
  const handleSelectProspect = (prospect: Prospect) => {
    setSelectedProspectId(prospect._id || prospect.id || null);
  };

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProspect = await apiService.createProspect(createFields);
      setProspects(prev => [newProspect, ...prev]);
      setShowModal(false);
      setCreateFields({
        name: '',
        email: '',
        phone: '',
        loanAmount: '',
        type: 'Individual',
        loanType: 'Purchase',
        assignedTo: ''
      });
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al crear el prospecto');
    }
  };

  const handleOpenEditModal = () => {
    if (selectedProspect) {
      setEditFields({
        name: selectedProspect.name,
        type: selectedProspect.type,
        loanType: selectedProspect.loanType,
        assignedTo: selectedProspect.assignedTo
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.updateProspect(selectedProspect._id, editFields);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
      setShowEditModal(false);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al actualizar el prospecto');
    }
  };

  const handleReopen = async () => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.reopenProspect(selectedProspect._id);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al reabrir el prospecto');
    }
  };

  const toggleStage = (stage: string) => {
    setOpenStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const handleCheckDoc = async (stage: StageName, docIdx: number) => {
    if (!selectedProspect) return;
    
    try {
      // Solo cambiar de 'Missing' a 'Ready for Review', no de 'Ready for Review' a 'Approved'
      const updatedProspect = await apiService.updateDocumentStatus(selectedProspect._id, stage, docIdx);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al actualizar el documento');
    }
  };

  // Función para verificar si un stage está completo
  const isStageComplete = (stage: StageName, prospect: Prospect) => {
    const stageDocuments = prospect.documentsByStage[stage] || [];
    if (stageDocuments.length === 0) return false;
    
    const isComplete = stageDocuments.every(doc => {
      if (stage === 'Closing') {
        if ((doc.type === 'Disclosure' || doc.type === 'LoanDoc') && isClosingStatus(doc.status)) {
          return doc.status.sent && doc.status.signed && doc.status.filled;
        } else {
          // Para todos los documentos en Closing, verificar que estén aprobados
          return doc.status === 'Approved';
        }
      } else {
        return doc.status === 'Approved';
      }
    });
    
    return isComplete;
  };

  // Función para avanzar al siguiente stage
  const advanceToNextStage = async (currentStage: StageName) => {
    if (!selectedProspect) return;
    
    const currentStageIdx = stages.indexOf(currentStage);
    if (currentStageIdx < stages.length - 1) {
      const nextStage = stages[currentStageIdx + 1];
      try {
        const updatedProspect = await apiService.updateProspect(selectedProspect._id, { currentStage: nextStage });
        setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError.message || 'Error al avanzar al siguiente stage');
      }
    } else {
      // Si estamos en el último stage y está completo, marcar como completado
      try {
        const updatedProspect = await apiService.updateProspect(selectedProspect._id, { 
          currentStage: currentStage,
          status: 'Completed',
          closedAt: new Date().toISOString()
        });
        setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError.message || 'Error al marcar como completado');
      }
    }
  };

  const handleApproveDoc = async (stage: StageName, docIdx: number) => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.approveDocument(selectedProspect._id, stage, docIdx);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
      
      // Verificar si el stage está completo después de aprobar el documento
      const updatedProspectData = { ...updatedProspect };
      if (isStageComplete(stage, updatedProspectData)) {
        // Avanzar automáticamente al siguiente stage
        await advanceToNextStage(stage);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al aprobar el documento');
    }
  };

  const handleRejectDoc = async (stage: StageName, docIdx: number) => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.rejectDocument(selectedProspect._id, stage, docIdx);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al rechazar el documento');
    }
  };

  const handleAddDocument = async (stage: StageName) => {
    if (!selectedProspect || !newDocName[stage]) return;
    
    try {
      const updatedProspect = await apiService.addDocument(selectedProspect._id, stage, newDocName[stage]);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
      setNewDocName(prev => ({ ...prev, [stage]: '' }));
      if (inputRefs.current[stage]) {
        inputRefs.current[stage]!.focus();
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al agregar el documento');
    }
  };

  const handleReject = async (stage: StageName) => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.rejectProspect(selectedProspect._id, stage);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al rechazar el prospecto');
    }
  };

  const handleClosingCheckbox = async (stage: StageName, docIdx: number, field: keyof ClosingStatus) => {
    if (!selectedProspect) return;
    
    try {
      const updatedProspect = await apiService.updateClosingCheckbox(selectedProspect._id, stage, docIdx, field);
      setProspects(prev => prev.map(p => p._id === selectedProspect._id ? updatedProspect : p));
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Error al actualizar el estado del documento');
    }
  };

  // =================================================================
  // --- RENDERIZADO ---
  // =================================================================
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header con tabs y botón de crear */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedTab('active')}
          >
            Active Prospects
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedTab('rejected')}
          >
            Rejected Prospects
          </button>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Create New Prospect
        </button>
      </div>

      {/* Lista de prospectos */}
      {selectedTab === 'active' && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Active Prospects</h2>
          <ul>
            {prospects.filter(p => p.status === 'In Progress' || p.status === 'Completed').map(prospect => {
              const completed = stages.every(
                stage => (prospect.documentsByStage[stage] || []).length > 0 && 
                (prospect.documentsByStage[stage] || []).every(doc => {
                  if (stage === 'Closing') {
                    if ((doc.type === 'Disclosure' || doc.type === 'LoanDoc') && isClosingStatus(doc.status)) {
                      return doc.status.sent && doc.status.signed && doc.status.filled;
                    } else {
                      return doc.status === 'Approved';
                    }
                  } else {
                    return doc.status === 'Approved';
                  }
                })
              );
              const rejected = prospect.status === 'Rejected';
              const stageLabel = completed ? 'Completed' : rejected && prospect.rejectedAtStage ? `Rejected at ${prospect.rejectedAtStage}` : prospect.currentStage;
              
              return (
                <li
                  key={prospect._id || prospect.id}
                  className={`p-4 rounded-lg mb-2 cursor-pointer border ${
                    selectedProspectId === (prospect._id || prospect.id) 
                      ? 'bg-blue-50 border-blue-400' 
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleSelectProspect(prospect)}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {prospect.name}
                    {completed && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Completed</span>}
                    {rejected && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>}
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">{prospect.code}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Stage: {stageLabel} | Assigned to: {getUserNameById(prospect.assignedTo)}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${
                    completed ? 'text-green-700' : 
                    rejected ? 'text-red-700' : 
                    'text-blue-700'
                  }`}>
                    {completed ? 'Completed' : rejected ? 'Rejected' : prospect.status}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Lista de rechazados */}
      {selectedTab === 'rejected' && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Rejected Prospects</h2>
          <ul>
            {prospects.filter(p => p.status === 'Rejected').map(prospect => {
              const completed = stages.every(
                stage => (prospect.documentsByStage[stage] || []).length > 0 && 
                (prospect.documentsByStage[stage] || []).every(doc => {
                  if (stage === 'Closing') {
                    if ((doc.type === 'Disclosure' || doc.type === 'LoanDoc') && isClosingStatus(doc.status)) {
                      return doc.status.sent && doc.status.signed && doc.status.filled;
                    } else {
                      return true;
                    }
                  } else {
                    return doc.status === 'Approved';
                  }
                })
              );
              const rejected = prospect.status === 'Rejected';
              const stageLabel = completed ? 'Completed' : rejected && prospect.rejectedAtStage ? `Rejected at ${prospect.rejectedAtStage}` : prospect.currentStage;
              
              return (
                <li
                  key={prospect._id || prospect.id}
                  className={`p-4 rounded-lg mb-2 cursor-pointer border ${
                    selectedProspectId === (prospect._id || prospect.id) 
                      ? 'bg-blue-50 border-blue-400' 
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleSelectProspect(prospect)}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {prospect.name}
                    {completed && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Completed</span>}
                    {rejected && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>}
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">{prospect.code}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Stage: {stageLabel} | Assigned to: {prospect.assignedTo}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${
                    completed ? 'text-green-700' : 
                    rejected ? 'text-red-700' : 
                    'text-blue-700'
                  }`}>
                    {completed ? 'Completed' : rejected ? 'Rejected' : prospect.status}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Detalle del prospecto seleccionado */}
      {selectedProspect && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedProspect.name}</h2>
              <div className="text-sm text-gray-500">
                Type: {selectedProspect.type} | Loan: {selectedProspect.loanType}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border border-blue-500 bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
                onClick={handleOpenEditModal}
              >
                Edit
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Assigned to: {getUserNameById(selectedProspect.assignedTo)}
          </div>
          
          {selectedProspect.status === 'Rejected' && selectedProspect.rejectedAtStage && (
            <>
              <div className="text-red-700 font-semibold mt-2 flex items-center gap-2 mb-4">
                <FaTimes /> This prospect was rejected at stage: {selectedProspect.rejectedAtStage}
              </div>
              <button
                className="mb-4 flex items-center gap-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
                onClick={handleReopen}
              >
                <FaUndo /> Reopen
              </button>
            </>
          )}
          
          <div className="text-sm text-gray-500 mb-6">
            Code: <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{selectedProspect.code}</span>
          </div>



          {/* Stepper visual de etapas */}
          <div className="flex items-center mb-6">
            {stages.map((stage, idx) => {
              const stageCompleted = isStageComplete(stage, selectedProspect);
              const isCurrentStage = idx === currentStageIdx;
              
              return (
                <React.Fragment key={stage}>
                  <div className={`flex flex-col items-center z-10 ${
                    stageCompleted ? 'text-green-600' : 
                    isCurrentStage ? 'text-blue-700 font-bold' : 
                    'text-gray-400'
                  }`}>
                    <div className={`rounded-full w-12 h-12 flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${
                      stageCompleted ? 'border-green-500 bg-green-100' :
                      isCurrentStage ? 'border-blue-500 bg-blue-100' :
                      'border-gray-300 bg-white'
                    }`}>
                      {stageCompleted ? <FaCheck /> : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-center w-24 font-semibold">
                      {stage.replace(' (Know Your Customer)', '')}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                      stageCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Accordion de etapas */}
          <div className="divide-y divide-gray-200">
            {stages.map((stage, idx) => (
              <div key={stage} className="py-2">
                <button
                  className={`w-full flex justify-between items-center py-2 px-2 rounded transition-colors ${
                    openStages.includes(stage) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleStage(stage)}
                >
                  <span className={`font-semibold ${
                    idx === currentStageIdx ? 'text-blue-800' : 'text-gray-700'
                  }`}>
                    {idx + 1}. {stage.replace(' (Know Your Customer)', '')}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {openStages.includes(stage) ? '▼' : '▶'}
                  </span>
                </button>
                
                {openStages.includes(stage) && (
                  <div className="pl-6 pt-2 pb-4">
                    {selectedProspect.documentsByStage[stage] && selectedProspect.documentsByStage[stage].length > 0 ? (
                      stage === 'Closing' ? (
                        <>                          {/* Sección Disclosures */}
                          <h4 className="font-medium mb-2 text-gray-700">Disclosures</h4>
                          <ul>
                            {selectedProspect.documentsByStage[stage]
                              .map((doc, docIdx) => {
                                if (doc.type === 'Disclosure') {
                                  if (stage === 'Closing' && isClosingStatus(doc.status)) {
                                    const closingStatus = doc.status;
                                    return (
                                      <li key={docIdx} className="flex items-center mb-1 gap-4">
                                        <span className="flex-1">{doc.name}</span>
                                        {(['sent', 'signed', 'filled'] as const).map((col) => (
                                          <label key={col} className="flex items-center gap-1 text-xs">
                                            <input
                                              type="checkbox"
                                              checked={closingStatus[col]}
                                              onChange={() => handleClosingCheckbox(stage as StageName, docIdx, col)}
                                              disabled={!!(isCompleted || selectedProspect.status === 'Rejected')}
                                            />
                                            {col.charAt(0).toUpperCase() + col.slice(1)}
                                          </label>
                                        ))}
                                      </li>
                                    );
                                  }
                                  return (
                                    <li key={docIdx} className="flex items-center mb-1 gap-4">
                                      <span className="flex-1">{doc.name}</span>
                                    </li>
                                  );
                                }
                                return null;
                              }).filter(Boolean)}
                          </ul>
                          
                          {/* Sección Loan Docs */}
                          <h4 className="font-medium mb-2 text-gray-700 mt-6">Loan Docs</h4>
                          <ul>
                            {selectedProspect.documentsByStage[stage]
                              .map((doc, docIdx) => {
                                if (doc.type === 'LoanDoc') {
                                  if (stage === 'Closing' && isClosingStatus(doc.status)) {
                                    const closingStatus = doc.status;
                                    return (
                                      <li key={docIdx} className="flex items-center mb-1 gap-4">
                                        <span className="flex-1">{doc.name}</span>
                                        {(['sent', 'signed', 'filled'] as const).map((col) => (
                                          <label key={col} className="flex items-center gap-1 text-xs">
                                            <input
                                              type="checkbox"
                                              checked={closingStatus[col]}
                                              onChange={() => handleClosingCheckbox(stage as StageName, docIdx, col)}
                                              disabled={!!(isCompleted || selectedProspect.status === 'Rejected')}
                                            />
                                            {col.charAt(0).toUpperCase() + col.slice(1)}
                                          </label>
                                        ))}
                                      </li>
                                    );
                                  }
                                  return (
                                    <li key={docIdx} className="flex items-center mb-1 gap-4">
                                      <span className="flex-1">{doc.name}</span>
                                    </li>
                                  );
                                }
                                return null;
                              }).filter(Boolean)}
                          </ul>
                        </>
                      ) : (
                        <>
                          <h4 className="font-medium mb-2 text-gray-700">Required Documents</h4>
                          <ul>
                            {selectedProspect.documentsByStage[stage].map((doc: Document, docIdx: number) => (
                              <li key={docIdx} className="flex items-center mb-1">
                                <input
                                  type="checkbox"
                                  checked={doc.status === 'Ready for Review' || doc.status === 'Approved'}
                                  onChange={() => {
                                    // Permitir marcar el checkbox si el documento está en 'Missing' y la etapa está disponible
                                    const canInteract = !isCompleted && selectedProspect.status !== 'Rejected' && doc.status === 'Missing';
                                    // Verificar si todas las etapas anteriores están completadas
                                    const previousStagesCompleted = stages.slice(0, idx).every(prevStage => isStageComplete(prevStage, selectedProspect));
                                    
                                    if (canInteract && (idx === currentStageIdx || previousStagesCompleted)) {
                                      handleCheckDoc(stage as StageName, docIdx);
                                    }
                                  }}
                                  className="mr-2 accent-blue-600"
                                  disabled={(() => {
                                    const canInteract = !isCompleted && selectedProspect.status !== 'Rejected' && doc.status === 'Missing';
                                    const previousStagesCompleted = stages.slice(0, idx).every(prevStage => isStageComplete(prevStage, selectedProspect));
                                    return !(canInteract && (idx === currentStageIdx || previousStagesCompleted));
                                  })()}
                                />
                                <span className="flex-1">{doc.name}</span>
                                <span className={`text-xs ml-2 ${
                                  doc.status === 'Approved' ? 'text-green-600' :
                                  doc.status === 'Ready for Review' ? 'text-yellow-600' :
                                  doc.status === 'Missing' ? 'text-red-600' :
                                  doc.status === 'Rejected' ? 'text-red-600' :
                                  'text-gray-400'
                                }`}>
                                  {doc.status === 'Approved' ? 'Approved' :
                                   doc.status === 'Ready for Review' ? 'Ready for Review' :
                                   doc.status === 'Missing' ? 'Missing' :
                                   doc.status === 'Rejected' ? 'Rejected' : ''}
                                </span>
                                {(() => {
                                  const canApprove = doc.status === 'Ready for Review' && !isCompleted && selectedProspect.status !== 'Rejected';
                                  const previousStagesCompleted = stages.slice(0, idx).every(prevStage => isStageComplete(prevStage, selectedProspect));
                                  const stageAccessible = idx === currentStageIdx || previousStagesCompleted;
                                  
                                  return canApprove && stageAccessible;
                                })() && (
                                  <>
                                    <button
                                      className="ml-2 flex items-center gap-1 px-2 py-1 rounded bg-green-500 text-white text-xs shadow hover:bg-green-600 transition-colors"
                                      onClick={() => handleApproveDoc(stage as StageName, docIdx)}
                                      type="button"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="ml-2 flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white text-xs shadow hover:bg-red-600 transition-colors"
                                      onClick={() => handleRejectDoc(stage as StageName, docIdx)}
                                      type="button"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                          
                          {/* Agregar documento manualmente */}
                          {(() => {
                            const canAddDoc = !isCompleted && selectedProspect.status !== 'Rejected';
                            const previousStagesCompleted = stages.slice(0, idx).every(prevStage => isStageComplete(prevStage, selectedProspect));
                            const stageAccessible = idx === currentStageIdx || previousStagesCompleted;
                            
                            return canAddDoc && stageAccessible;
                          })() && (
                            <div className="flex gap-2 mt-3">
                              <input
                                ref={el => { inputRefs.current[stage] = el; }}
                                type="text"
                                className="border rounded px-2 py-1 flex-1"
                                placeholder="New document name..."
                                value={newDocName[stage] || ''}
                                onChange={e => setNewDocName(prev => ({ ...prev, [stage]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDocument(stage as StageName); } }}
                              />
                              <button
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition-colors"
                                onClick={() => handleAddDocument(stage as StageName)}
                                type="button"
                              >
                                Add Document
                              </button>
                              <button
                                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition-colors"
                                onClick={() => handleReject(stage as StageName)}
                                type="button"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="text-gray-400 italic">No documents for this stage.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay prospecto seleccionado */}
      {!selectedProspect && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-gray-500 italic text-center">
            Selecciona un prospecto de la lista para ver sus etapas y documentos.
          </div>
        </div>
      )}

      {/* Modal para crear nuevo prospecto */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Create New Prospect</h3>
            <form onSubmit={handleCreateProspect}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="E.g., John Doe or Innovate Corp" 
                  value={createFields.name} 
                  onChange={e => setCreateFields(f => ({ ...f, name: e.target.value }))} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="E.g., name@example.com" 
                  value={createFields.email} 
                  onChange={e => setCreateFields(f => ({ ...f, email: e.target.value }))} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="E.g., 305-555-1234" 
                  value={createFields.phone} 
                  onChange={e => setCreateFields(f => ({ ...f, phone: e.target.value }))} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Amount</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="E.g., 250000" 
                  value={createFields.loanAmount} 
                  onChange={e => setCreateFields(f => ({ ...f, loanAmount: e.target.value }))} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Type</label>
                <div className="flex gap-4 mt-1">
                  <label>
                    <input 
                      type="radio" 
                      name="clientType" 
                      className="mr-1" 
                      checked={createFields.type === 'Individual'} 
                      onChange={() => setCreateFields(f => ({ ...f, type: 'Individual' }))} 
                    /> 
                    Individual
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="clientType" 
                      className="mr-1" 
                      checked={createFields.type === 'Company'} 
                      onChange={() => setCreateFields(f => ({ ...f, type: 'Company' }))} 
                    /> 
                    Company
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Type</label>
                <div className="flex gap-4 mt-1">
                  <label>
                    <input 
                      type="radio" 
                      name="loanType" 
                      className="mr-1" 
                      checked={createFields.loanType === 'Purchase'} 
                      onChange={() => setCreateFields(f => ({ ...f, loanType: 'Purchase' }))} 
                    /> 
                    Purchase
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="loanType" 
                      className="mr-1" 
                      checked={createFields.loanType === 'Refinance'} 
                      onChange={() => setCreateFields(f => ({ ...f, loanType: 'Refinance' }))} 
                    /> 
                    Refinance
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Assigned to</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={createFields.assignedTo}
                  onChange={e => setCreateFields(f => ({ ...f, assignedTo: e.target.value }))}
                  required
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowEditModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Edit Prospect</h3>
            <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editFields.name}
                  onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Type</label>
                <div className="flex gap-4 mt-1">
                  <label>
                    <input 
                      type="radio" 
                      name="editClientType" 
                      checked={editFields.type === 'Individual'} 
                      onChange={() => setEditFields(f => ({ ...f, type: 'Individual' }))} 
                      className="mr-1" 
                    /> 
                    Individual
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="editClientType" 
                      checked={editFields.type === 'Company'} 
                      onChange={() => setEditFields(f => ({ ...f, type: 'Company' }))} 
                      className="mr-1" 
                    /> 
                    Company
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Type</label>
                <div className="flex gap-4 mt-1">
                  <label>
                    <input 
                      type="radio" 
                      name="editLoanType" 
                      checked={editFields.loanType === 'Purchase'} 
                      onChange={() => setEditFields(f => ({ ...f, loanType: 'Purchase' }))} 
                      className="mr-1" 
                    /> 
                    Purchase
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="editLoanType" 
                      checked={editFields.loanType === 'Refinance'} 
                      onChange={() => setEditFields(f => ({ ...f, loanType: 'Refinance' }))} 
                      className="mr-1" 
                    /> 
                    Refinance
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Assigned to</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editFields.assignedTo}
                  onChange={e => setEditFields(f => ({ ...f, assignedTo: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-blue-500 bg-blue-500 text-white font-medium hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}