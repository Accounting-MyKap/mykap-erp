import React, { useState, useRef } from 'react';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

// Tipos de documento y estados
export type DocumentStatusNormal = 'Missing' | 'Ready for Review' | 'Approved' | 'Rejected';
export type DocumentStatusClosing = { sent: boolean; signed: boolean; filled: boolean };

export type Document =
  | { name: string; type: 'Individual' | 'Company' | 'Other' | 'Disclosure' | 'LoanDoc'; status: DocumentStatusNormal }
  | { name: string; type: 'Disclosure' | 'LoanDoc'; status: DocumentStatusClosing };

export type StageName =
  | 'Pre-validation'
  | 'KYC (Know Your Customer)'
  | 'Title Work'
  | 'Underwriting (UW)'
  | 'Appraisal'
  | 'Closing';

export type DocumentsByStage = Record<StageName, Document[]>;

export type Prospect = {
  id: number;
  name: string;
  type: string;
  loanType: string;
  stage: StageName;
  assignedTo: string;
  status: string; // 'In Progress' | 'Completed' | 'Rejected'
  rejectedAtStage?: StageName;
  documentsByStage: DocumentsByStage;
  currentStage: StageName;
  openStages: StageName[];
  createdAt: string; // Added for filtering
  closedAt?: string; // Added for filtering
  rejectedAt?: string; // Added for filtering
  code: string; // Added for code
};

// Actualizar el mock para reflejar los nuevos tipos
const initialMockProspects: Prospect[] = [
  {
    id: 1,
    name: 'Innovate Corp',
    type: 'Company',
    loanType: 'Purchase',
    stage: 'KYC (Know Your Customer)',
    assignedTo: 'Sebastian',
    status: 'In Progress',
    documentsByStage: {
      'Pre-validation': [
        { name: 'ID', type: 'Individual', status: 'Missing' },
        { name: 'Personal Bank Statement', type: 'Individual', status: 'Missing' },
        { name: 'Articles of incorporation', type: 'Company', status: 'Missing' },
        { name: 'Operating agreement', type: 'Company', status: 'Missing' },
        { name: 'EIN', type: 'Company', status: 'Missing' },
        { name: 'Bank Statements (3 months)', type: 'Company', status: 'Missing' },
        { name: 'Purchase agreement', type: 'Company', status: 'Missing' },
      ],
      'KYC (Know Your Customer)': [
        { name: 'Risk Matrix', type: 'Other', status: 'Missing' },
      ],
      'Title Work': [
        { name: 'Title Commitment', type: 'Other', status: 'Missing' },
      ],
      'Underwriting (UW)': [
        { name: 'UW Report', type: 'Other', status: 'Missing' },
      ],
      'Appraisal': [
        { name: 'Appraisal Report', type: 'Other', status: 'Missing' },
      ],
      'Closing': [
        { name: 'Loan Estimate', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Term Sheet', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Notice of Info', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Notice to Receive Copy of Appraisal', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Ach Form', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Promissory Note', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Guaranty Agreement', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Mortgage', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Wire Transfer Breakdown', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
      ],
    },
    currentStage: 'KYC (Know Your Customer)',
    openStages: ['KYC (Know Your Customer)'],
    createdAt: '2023-01-01T10:00:00Z',
    closedAt: '2023-02-15T14:30:00Z',
    rejectedAt: '2023-03-01T09:00:00Z',
    code: 'HKF-ML0001',
  },
  {
    id: 2,
    name: 'Alice Johnson',
    type: 'Individual',
    loanType: 'Refinance',
    stage: 'Pre-validation',
    assignedTo: 'Catalina',
    status: 'In Progress',
    documentsByStage: {
      'Pre-validation': [
        { name: 'ID', type: 'Individual', status: 'Missing' },
        { name: 'Personal Bank Statement', type: 'Individual', status: 'Missing' },
        { name: 'Articles of incorporation', type: 'Company', status: 'Missing' },
        { name: 'Operating agreement', type: 'Company', status: 'Missing' },
        { name: 'EIN', type: 'Company', status: 'Missing' },
        { name: 'Bank Statements (3 months)', type: 'Company', status: 'Missing' },
        { name: 'Purchase agreement', type: 'Company', status: 'Missing' },
      ],
      'KYC (Know Your Customer)': [
        { name: 'Risk Matrix', type: 'Other', status: 'Missing' },
      ],
      'Title Work': [
        { name: 'Title Commitment', type: 'Other', status: 'Missing' },
      ],
      'Underwriting (UW)': [
        { name: 'UW Report', type: 'Other', status: 'Missing' },
      ],
      'Appraisal': [
        { name: 'Appraisal Report', type: 'Other', status: 'Missing' },
      ],
      'Closing': [
        { name: 'Loan Estimate', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Term Sheet', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Notice of Info', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Notice to Receive Copy of Appraisal', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Ach Form', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Promissory Note', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Guaranty Agreement', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Mortgage', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
        { name: 'Wire Transfer Breakdown', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } },
      ],
    },
    currentStage: 'Pre-validation',
    openStages: ['Pre-validation'],
    createdAt: '2023-02-10T11:00:00Z',
    closedAt: '2023-03-20T10:00:00Z',
    rejectedAt: '2023-04-05T15:00:00Z',
    code: 'HKF-ML0002',
  },
];

// Etapas mock para el stepper
const stages: StageName[] = [
  'Pre-validation',
  'KYC (Know Your Customer)',
  'Title Work',
  'Underwriting (UW)',
  'Appraisal',
  'Closing',
];

// Añadir type guard para DocumentStatusClosing
function isClosingStatus(status: DocumentStatusNormal | DocumentStatusClosing): status is DocumentStatusClosing {
  return (
    typeof status === 'object' &&
    status !== null &&
    'sent' in status &&
    'signed' in status &&
    'filled' in status
  );
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>(initialMockProspects);
  const [selectedProspectId, setSelectedProspectId] = useState(prospects[0].id);
  const [newDocName, setNewDocName] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'rejected' | 'analysis'>('active');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [detailGroup, setDetailGroup] = useState<'created' | 'closed' | 'rejected' | null>(null);

  // 1. Estado para mostrar el modal de edición y para los campos editables
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFields, setEditFields] = useState({
    name: '',
    type: 'Individual',
    loanType: 'Purchase',
    assignedTo: '',
  });

  // 2. Función para abrir el modal y cargar los datos actuales
  const handleOpenEditModal = () => {
    setEditFields({
      name: selectedProspect.name,
      type: selectedProspect.type,
      loanType: selectedProspect.loanType,
      assignedTo: selectedProspect.assignedTo,
    });
    setShowEditModal(true);
  };

  // 3. Función para guardar los cambios
  const handleSaveEdit = () => {
    setProspects(prev => prev.map(p =>
      p.id === selectedProspectId
        ? { ...p, ...editFields }
        : p
    ));
    setShowEditModal(false);
  };

  // Obtener prospecto seleccionado
  const selectedProspect = prospects.find(p => p.id === selectedProspectId)!;
  const currentStage = selectedProspect.currentStage;
  const openStages = selectedProspect.openStages;
  const currentStageIdx = stages.findIndex(s => s === currentStage);

  // Cambiar prospecto seleccionado y sincronizar currentStage y openStages
  const handleSelectProspect = (prospect: Prospect) => {
    setSelectedProspectId(prospect.id);
  };

  // Cambiar estado de documento (checkbox: Ready for Review/Missing)
  const handleCheckDoc = (stage: StageName, docIdx: number) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      const docs = p.documentsByStage[stage].map((doc, idx) => {
        if (idx !== docIdx) return doc;
        // Para Closing
        if ((stage === 'Closing') && (doc.type === 'Disclosure' || doc.type === 'LoanDoc') && typeof doc.status === 'object') {
          // Aquí podrías implementar lógica individual para cada checkbox, pero el control ya está en el render
          return doc;
        } else {
          // Para etapas normales
          if (doc.status === 'Ready for Review') {
            return { ...doc, status: 'Missing' };
          } else {
            return { ...doc, status: 'Ready for Review' };
          }
        }
      });
      // Avance automático de etapa SOLO si todos los documentos están 'Approved' en la etapa actual
      let nextStage = p.currentStage;
      let nextOpenStages = p.openStages;
      let nextStatus = p.status;
      const idxStage = stages.findIndex(s => s === p.currentStage);
      const docsCurrent = idxStage !== -1 ? docs : [];

      if (stage === 'Closing') {
        if (docsCurrent.length > 0 && docsCurrent.every(doc => (doc.type === 'Disclosure' || doc.type === 'LoanDoc') && typeof doc.status === 'object' ? doc.status.sent && doc.status.signed && doc.status.filled : doc.status === 'Approved')) {
          if (idxStage < stages.length - 1) {
            nextStage = stages[idxStage + 1];
            nextOpenStages = [stages[idxStage + 1]];
          } else {
            nextStatus = 'Completed';
          }
        }
      } else {
        if (docsCurrent.length > 0 && docsCurrent.every(doc => doc.status === 'Approved')) {
          if (idxStage < stages.length - 1) {
            nextStage = stages[idxStage + 1];
            nextOpenStages = [stages[idxStage + 1]];
          } else {
            nextStatus = 'Completed';
          }
        }
      }
      return {
        ...p,
        documentsByStage: {
          ...p.documentsByStage,
          [stage]: docs,
        },
        currentStage: nextStage,
        openStages: nextOpenStages,
        status: nextStatus,
      };
    }));
  };

  // Determinar si el prospecto está completado
  const isCompleted = stages.every(
    stage => (selectedProspect.documentsByStage[stage] || []).length > 0 && (selectedProspect.documentsByStage[stage] || []).every(doc => {
      if (stage === 'Closing') {
        return doc.type === 'Disclosure' || doc.type === 'LoanDoc' ? 
          (isClosingStatus(doc.status) ? doc.status.sent && doc.status.signed && doc.status.filled : doc.status === 'Approved') : 
          doc.status === 'Approved';
      } else {
        return doc.status === 'Approved';
      }
    })
  );

  // Marcar prospecto como rechazado en una etapa
  const handleReject = (stage: StageName) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      return {
        ...p,
        status: 'Rejected',
        rejectedAtStage: stage,
      };
    }));
  };

  // Agregar documento manualmente a una etapa
  const handleAddDocument = (stage: StageName) => {
    const name = (newDocName[stage] || '').trim();
    if (!name) return;
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      return {
        ...p,
        documentsByStage: {
          ...p.documentsByStage,
          [stage]: [...(p.documentsByStage[stage] || []), { name, type: 'Other', status: 'Missing' }],
        },
      };
    }));
    setNewDocName(prev => ({ ...prev, [stage]: '' }));
    setTimeout(() => {
      if (inputRefs.current[stage]) inputRefs.current[stage]!.focus();
    }, 0);
  };

  // Accordion: abrir/cerrar etapa
  const toggleStage = (stage: StageName) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      return {
        ...p,
        openStages: p.openStages.includes(stage)
          ? p.openStages.filter(s => s !== stage)
          : [...p.openStages, stage],
      };
    }));
  };

  // Reabrir prospecto rechazado
  const handleReopen = () => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      return {
        ...p,
        status: 'In Progress',
        currentStage: p.rejectedAtStage || p.currentStage,
        openStages: [p.rejectedAtStage || p.currentStage],
        rejectedAtStage: undefined,
      };
    }));
  };

  // Añadir función para actualizar el estado de un checkbox individual en Closing
  const handleClosingCheckbox = (stage: StageName, docIdx: number, field: 'sent' | 'signed' | 'filled') => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      const docs = p.documentsByStage[stage].map((doc, idx) => {
        if (idx !== docIdx) return doc;
        if ((stage === 'Closing') && (doc.type === 'Disclosure' || doc.type === 'LoanDoc') && typeof doc.status === 'object') {
          return {
            ...doc,
            status: {
              ...doc.status,
              [field]: !doc.status[field],
            },
          };
        }
        return doc;
      });
      // Actualizar los documentos de la etapa
      const newDocumentsByStage = {
        ...p.documentsByStage,
        [stage]: docs,
      };
      // Verificar si todos los documentos de todas las etapas están completos
      const allStagesCompleted = stages.every(s => {
        const stageDocs = newDocumentsByStage[s] || [];
        if (s === 'Closing') {
          return stageDocs.every(doc => {
            if ((doc.type === 'Disclosure' || doc.type === 'LoanDoc') && isClosingStatus(doc.status)) {
              const closingStatus = doc.status;
              return closingStatus.sent && closingStatus.signed && closingStatus.filled;
            }
            return true;
          });
        } else {
          return stageDocs.every(doc => typeof doc.status === 'string' && doc.status === 'Approved');
        }
      });
      return {
        ...p,
        documentsByStage: newDocumentsByStage,
        status: allStagesCompleted ? 'Completed' : p.status,
      };
    }));
  };

  // Implementar handleApproveDoc y handleRejectDoc para etapas normales:
  const handleApproveDoc = (stage: StageName, docIdx: number) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      const docs = p.documentsByStage[stage].map((doc, idx) => {
        if (idx !== docIdx) return doc;
        if (typeof doc.status === 'string') {
          return { ...doc, status: 'Approved' };
        }
        return doc;
      });
      // Si todos los documentos están Approved, abrir la siguiente etapa
      const allApproved = docs.every(doc => typeof doc.status === 'string' && doc.status === 'Approved');
      const newOpenStages = [...p.openStages];
      let newCurrentStage = p.currentStage;
      if (allApproved) {
        const idxStage = stages.findIndex(s => s === stage);
        if (idxStage < stages.length - 1) {
          const nextStage = stages[idxStage + 1];
          if (!newOpenStages.includes(nextStage)) {
            newOpenStages.push(nextStage);
          }
          newCurrentStage = nextStage;
        } else {
          newCurrentStage = stage;
        }
      }
      return {
        ...p,
        documentsByStage: {
          ...p.documentsByStage,
          [stage]: docs,
        },
        openStages: newOpenStages,
        currentStage: newCurrentStage,
      };
    }));
  };
  const handleRejectDoc = (stage: StageName, docIdx: number) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== selectedProspectId) return p;
      const docs = p.documentsByStage[stage].map((doc, idx) => {
        if (idx !== docIdx) return doc;
        if (typeof doc.status === 'string') {
          return { ...doc, status: 'Rejected' };
        }
        return doc;
      });
      return {
        ...p,
        documentsByStage: {
          ...p.documentsByStage,
          [stage]: docs,
        },
      };
    }));
  };

  // Filtrado para análisis
  const filteredCreated = prospects.filter(p => {
    const date = p.createdAt ? new Date(p.createdAt) : null;
    return (
      date &&
      date.getFullYear() === selectedYear &&
      date.getMonth() + 1 === selectedMonth
    );
  });
  const filteredClosed = prospects.filter(p => {
    const date = p.closedAt ? new Date(p.closedAt) : null;
    return (
      date &&
      date.getFullYear() === selectedYear &&
      date.getMonth() + 1 === selectedMonth
    );
  });
  const filteredRejected = prospects.filter(p => {
    const date = p.rejectedAt ? new Date(p.rejectedAt) : null;
    return (
      date &&
      date.getFullYear() === selectedYear &&
      date.getMonth() + 1 === selectedMonth
    );
  });

  // Generar el siguiente código disponible
  const generateNextCode = () => {
    const existingCodes = prospects.map(p => p.code);
    let nextCode = 'HKF-ML0001'; // Valor por defecto, se actualizará si hay códigos anteriores
    if (existingCodes.length > 0) {
      const lastCode = existingCodes.reduce((prev, curr) => {
        const prevNum = parseInt(prev.slice(-4));
        const currNum = parseInt(curr.slice(-4));
        return currNum > prevNum ? curr : prev;
      });
      const lastNum = parseInt(lastCode.slice(-4));
      nextCode = `HKF-ML${(lastNum + 1).toString().padStart(4, '0')}`;
    }
    return nextCode;
  };

  // Crear nuevo prospecto
  const handleCreateProspect = () => {
    const newCode = generateNextCode();
    const newProspect: Prospect = {
      id: prospects.length + 1, // Asumiendo que el ID es único en el mock
      name: '',
      type: 'Individual', // Por defecto
      loanType: 'Purchase', // Por defecto
      stage: 'Pre-validation',
      assignedTo: '',
      status: 'In Progress',
      documentsByStage: {
        'Pre-validation': [],
        'KYC (Know Your Customer)': [],
        'Title Work': [],
        'Underwriting (UW)': [],
        'Appraisal': [],
        'Closing': [],
      },
      currentStage: 'Pre-validation',
      openStages: ['Pre-validation'],
      createdAt: new Date().toISOString(),
      closedAt: undefined,
      rejectedAt: undefined,
      code: newCode,
    };
    setProspects(prev => [...prev, newProspect]);
    setSelectedProspectId(newProspect.id);
    setShowModal(false);
  };

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-medium border transition-colors ${selectedTab === 'active' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
          onClick={() => setSelectedTab('active')}
        >
          All Active
        </button>
        <button
          className={`px-4 py-2 rounded font-medium border transition-colors ${selectedTab === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-700 border-red-200 hover:bg-red-50'}`}
          onClick={() => setSelectedTab('rejected')}
        >
          Rejected
        </button>
        <button
          className={`px-4 py-2 rounded font-medium border transition-colors ${selectedTab === 'analysis' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setSelectedTab('analysis')}
        >
          Analysis by Month
        </button>
      </div>

      {/* Filtro de mes/año para análisis */}
      {selectedTab === 'analysis' && (
        <div className="flex gap-4 mb-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Month</label>
            <div className="relative">
              <select
                className="appearance-none w-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Year</label>
            <div className="relative">
              <select
                className="appearance-none w-24 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
              >
                {[2022, 2023, 2024].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla resumen de análisis */}
      {selectedTab === 'analysis' && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Prospects Analysis ({new Date(selectedYear, selectedMonth - 1).toLocaleString('en', { month: 'long', year: 'numeric' })})</h2>
          <table className="min-w-full border text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Count</th>
                <th className="px-3 py-2 border">View</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border">Created</td>
                <td className="px-3 py-2 border text-center">{filteredCreated.length}</td>
                <td className="px-3 py-2 border text-center">
                  <button
                    className="px-3 py-1 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    onClick={() => setDetailGroup('created')}
                    disabled={filteredCreated.length === 0}
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border">Closed</td>
                <td className="px-3 py-2 border text-center">{filteredClosed.length}</td>
                <td className="px-3 py-2 border text-center">
                  <button
                    className="px-3 py-1 rounded bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                    onClick={() => setDetailGroup('closed')}
                    disabled={filteredClosed.length === 0}
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border">Rejected</td>
                <td className="px-3 py-2 border text-center">{filteredRejected.length}</td>
                <td className="px-3 py-2 border text-center">
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    onClick={() => setDetailGroup('rejected')}
                    disabled={filteredRejected.length === 0}
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {/* Lista detallada */}
          {detailGroup && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-lg font-bold">
                  {detailGroup === 'created' && 'Prospects Created'}
                  {detailGroup === 'closed' && 'Prospects Closed'}
                  {detailGroup === 'rejected' && 'Prospects Rejected'}
                </h3>
                <button
                  className="px-2 py-1 rounded border border-gray-300 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => setDetailGroup(null)}
                >
                  Close
                </button>
              </div>
              <ul>
                {(detailGroup === 'created' ? filteredCreated : detailGroup === 'closed' ? filteredClosed : filteredRejected).map(p => (
                  <li key={p.id} className="p-3 border-b last:border-b-0 flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-gray-500">Assigned to: {p.assignedTo}</span>
                    <span className="text-xs text-gray-500">Type: {p.type}</span>
                    <span className="text-xs text-gray-500">Loan: {p.loanType}</span>
                    <span className="text-xs text-gray-500">Stage: {p.currentStage}</span>
                    <span className="text-xs text-gray-500">Code: <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{p.code}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Lista de activos */}
      {selectedTab === 'active' && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Prospects</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg border border-blue-600 font-medium hover:bg-blue-700 transition-colors"
              onClick={handleCreateProspect}
            >
              New Prospect
            </button>
          </div>
          <ul>
            {prospects.filter(p => p.status === 'In Progress' || p.status === 'Completed').map(prospect => {
              // Calcular si este prospecto está completado
              const completed = stages.every(
                stage => (prospect.documentsByStage[stage] || []).length > 0 && (prospect.documentsByStage[stage] || []).every(doc => {
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
                  key={prospect.id}
                  className={`p-4 rounded-lg mb-2 cursor-pointer border ${selectedProspectId === prospect.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`}
                  onClick={() => handleSelectProspect(prospect)}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {prospect.name}
                    {completed && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Completed</span>}
                    {rejected && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>}
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">{prospect.code}</span>
                  </div>
                  <div className="text-sm text-gray-500">Stage: {stageLabel} | Assigned to: {prospect.assignedTo}</div>
                  <div className={`text-xs font-bold mt-1 ${completed ? 'text-green-700' : rejected ? 'text-red-700' : 'text-blue-700'}`}>{completed ? 'Completed' : rejected ? 'Rejected' : prospect.status}</div>
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
              // Calcular si este prospecto está completado
              const completed = stages.every(
                stage => (prospect.documentsByStage[stage] || []).length > 0 && (prospect.documentsByStage[stage] || []).every(doc => {
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
                  key={prospect.id}
                  className={`p-4 rounded-lg mb-2 cursor-pointer border ${selectedProspectId === prospect.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`}
                  onClick={() => handleSelectProspect(prospect)}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {prospect.name}
                    {completed && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Completed</span>}
                    {rejected && <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>}
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">{prospect.code}</span>
                  </div>
                  <div className="text-sm text-gray-500">Stage: {stageLabel} | Assigned to: {prospect.assignedTo}</div>
                  <div className={`text-xs font-bold mt-1 ${completed ? 'text-green-700' : rejected ? 'text-red-700' : 'text-blue-700'}`}>{completed ? 'Completed' : rejected ? 'Rejected' : prospect.status}</div>
                </li>
              );
            })}
          </ul>
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
            <form>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input className="w-full border rounded px-3 py-2" placeholder="E.g., John Doe or Innovate Corp" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2" placeholder="E.g., name@example.com" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input className="w-full border rounded px-3 py-2" placeholder="E.g., 305-555-1234" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Amount</label>
                <input className="w-full border rounded px-3 py-2" placeholder="E.g., 250000" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Client Type</label>
                <div className="flex gap-4 mt-1">
                  <label><input type="radio" name="clientType" className="mr-1" /> Individual</label>
                  <label><input type="radio" name="clientType" className="mr-1" /> Company</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Type</label>
                <div className="flex gap-4 mt-1">
                  <label><input type="radio" name="loanType" className="mr-1" /> Purchase</label>
                  <label><input type="radio" name="loanType" className="mr-1" /> Refinance</label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Assigned to</label>
                <input className="w-full border rounded px-3 py-2" placeholder="E.g., Sebastian" />
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

      {/* Detalle del prospecto seleccionado */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">{selectedProspect.name} - Details</h2>
        <div className="mb-4 flex items-center gap-2">
          <div className="font-semibold">Stage: {isCompleted ? 'Completed' : selectedProspect.status === 'Rejected' && selectedProspect.rejectedAtStage ? `Rejected at ${selectedProspect.rejectedAtStage}` : currentStage}</div>
          <button
            className="ml-2 px-3 py-1 rounded border border-blue-500 bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
            onClick={handleOpenEditModal}
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-500">Assigned to: {selectedProspect.assignedTo}</div>
        {selectedProspect.status === 'Rejected' && selectedProspect.rejectedAtStage && (
          <>
            <div className="text-red-700 font-semibold mt-2 flex items-center gap-2">
              <FaTimes /> This prospect was rejected at stage: {selectedProspect.rejectedAtStage}
            </div>
            <button
              className="mt-2 flex items-center gap-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
              onClick={handleReopen}
            >
              <FaUndo /> Reopen
            </button>
          </>
        )}
        <div className="text-sm text-gray-500">Code: <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{selectedProspect.code}</span></div>
        {/* Stepper visual de etapas */}
        <div className="flex items-center mb-6">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div className={`flex flex-col items-center z-10 ${idx < currentStageIdx ? 'text-green-600' : idx === currentStageIdx ? 'text-blue-700 font-bold' : 'text-gray-400'}`}>
                <div className={`rounded-full w-12 h-12 flex items-center justify-center border-4 shadow-lg transition-all duration-300
                  ${idx < currentStageIdx ? 'border-green-500 bg-green-100' :
                    idx === currentStageIdx ? 'border-blue-500 bg-blue-100' :
                    'border-gray-300 bg-white'}`}
                >
                  {idx < currentStageIdx ? <FaCheck /> : idx + 1}
                </div>
                <span className="text-xs mt-2 text-center w-24 font-semibold">{stage.replace(' (Know Your Customer)', '')}</span>
              </div>
              {idx < stages.length - 1 && <div className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${idx < currentStageIdx ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>
        {/* Accordion de etapas */}
        <div className="divide-y divide-gray-200">
          {stages.map((stage, idx) => (
            <div key={stage} className="py-2">
              <button
                className={`w-full flex justify-between items-center py-2 px-2 rounded transition-colors ${openStages.includes(stage) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => toggleStage(stage)}
              >
                <span className={`font-semibold ${idx === currentStageIdx ? 'text-blue-800' : 'text-gray-700'}`}>{idx + 1}. {stage.replace(' (Know Your Customer)', '')}</span>
                <span className="ml-2 text-xs text-gray-400">{openStages.includes(stage) ? '▼' : '▶'}</span>
              </button>
              {openStages.includes(stage) && (
                <div className="pl-6 pt-2 pb-4">
                  {stage === 'Closing' ? (
                    <>
                      {/* Sección Disclosures */}
                      <h4 className="font-medium mb-2 text-gray-700">Disclosures</h4>
                      {/* Para Disclosures */}
                      <ul>
                        {(selectedProspect.documentsByStage[stage as StageName] || [])
                          .filter(doc => doc.type === 'Disclosure')
                          .map((doc) => {
                            const realIdx = (selectedProspect.documentsByStage[stage as StageName] || []).indexOf(doc);
                            if (stage === 'Closing' && isClosingStatus(doc.status)) {
                              const closingStatus = doc.status;
                              return (
                                <li key={realIdx} className="flex items-center mb-1 gap-4">
                                  <span className="flex-1">{doc.name}</span>
                                  {(['sent', 'signed', 'filled'] as const).map((col) => (
                                    <label key={col} className="flex items-center gap-1 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={closingStatus[col]}
                                        onChange={() => handleClosingCheckbox(stage as StageName, realIdx, col)}
                                        disabled={isCompleted || selectedProspect.status === 'Rejected'}
                                      />
                                      {col.charAt(0).toUpperCase() + col.slice(1)}
                                    </label>
                                  ))}
                                </li>
                              );
                            }
                            return (
                              <li key={realIdx} className="flex items-center mb-1 gap-4">
                                <span className="flex-1">{doc.name}</span>
                              </li>
                            );
                          })}
                      </ul>
                      {/* Sección Loan Docs */}
                      <h4 className="font-medium mb-2 text-gray-700 mt-6">Loan Docs</h4>
                      {/* Para Loan Docs */}
                      <ul>
                        {(selectedProspect.documentsByStage[stage as StageName] || [])
                          .filter(doc => doc.type === 'LoanDoc')
                          .map((doc) => {
                            const realIdx = (selectedProspect.documentsByStage[stage as StageName] || []).indexOf(doc);
                            if (stage === 'Closing' && isClosingStatus(doc.status)) {
                              const closingStatus = doc.status;
                              return (
                                <li key={realIdx} className="flex items-center mb-1 gap-4">
                                  <span className="flex-1">{doc.name}</span>
                                  {(['sent', 'signed', 'filled'] as const).map((col) => (
                                    <label key={col} className="flex items-center gap-1 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={closingStatus[col]}
                                        onChange={() => handleClosingCheckbox(stage as StageName, realIdx, col)}
                                        disabled={isCompleted || selectedProspect.status === 'Rejected'}
                                      />
                                      {col.charAt(0).toUpperCase() + col.slice(1)}
                                    </label>
                                  ))}
                                </li>
                              );
                            }
                            return (
                              <li key={realIdx} className="flex items-center mb-1 gap-4">
                                <span className="flex-1">{doc.name}</span>
                              </li>
                            );
                          })}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium mb-2 text-gray-700">Required Documents</h4>
                      <ul>
                        {(selectedProspect.documentsByStage[stage as StageName] || []).map((doc: Document, docIdx: number) => (
                          <li key={docIdx} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              checked={doc.status === 'Ready for Review' || doc.status === 'Approved'}
                              onChange={() => idx === currentStageIdx && !isCompleted && selectedProspect.status !== 'Rejected' ? handleCheckDoc(stage as StageName, docIdx) : undefined}
                              className="mr-2 accent-blue-600"
                              disabled={idx !== currentStageIdx || isCompleted || selectedProspect.status === 'Rejected'}
                            />
                            <span className="flex-1">{doc.name}</span>
                            <span className={`text-xs ml-2
                              ${doc.status === 'Approved' ? 'text-green-600' :
                                doc.status === 'Ready for Review' ? 'text-yellow-600' :
                                doc.status === 'Missing' ? 'text-red-600' :
                                doc.status === 'Rejected' ? 'text-red-600' :
                                'text-gray-400'}`}>
                              {doc.status === 'Approved' ? 'Approved' :
                                doc.status === 'Ready for Review' ? 'Ready for Review' :
                                doc.status === 'Missing' ? 'Missing' :
                                doc.status === 'Rejected' ? 'Rejected' : ''}
                            </span>
                            {doc.status === 'Ready for Review' && idx === currentStageIdx && !isCompleted && selectedProspect.status !== 'Rejected' && (
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
                      {!isCompleted && idx === currentStageIdx && selectedProspect.status !== 'Rejected' && (
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
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
                  <label><input type="radio" name="editClientType" checked={editFields.type === 'Individual'} onChange={() => setEditFields(f => ({ ...f, type: 'Individual' }))} className="mr-1" /> Individual</label>
                  <label><input type="radio" name="editClientType" checked={editFields.type === 'Company'} onChange={() => setEditFields(f => ({ ...f, type: 'Company' }))} className="mr-1" /> Company</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Loan Type</label>
                <div className="flex gap-4 mt-1">
                  <label><input type="radio" name="editLoanType" checked={editFields.loanType === 'Purchase'} onChange={() => setEditFields(f => ({ ...f, loanType: 'Purchase' }))} className="mr-1" /> Purchase</label>
                  <label><input type="radio" name="editLoanType" checked={editFields.loanType === 'Refinance'} onChange={() => setEditFields(f => ({ ...f, loanType: 'Refinance' }))} className="mr-1" /> Refinance</label>
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