import React, { useState } from 'react';

// Mock de clientes importados
const initialImportedClients = [
  {
    id: 1001,
    code: 'EXT-0001',
    name: 'Legacy Client 1',
    type: 'Company',
    assignedTo: 'External',
    createdAt: '2022-01-01T10:00:00Z',
    imported: true,
  },
  {
    id: 1002,
    code: 'EXT-0002',
    name: 'Legacy Client 2',
    type: 'Individual',
    assignedTo: 'External',
    createdAt: '2022-02-01T10:00:00Z',
    imported: true,
  },
];

// Simulación de clientes desde prospectos (esto normalmente vendría de la base de datos o props)
const initialProspectClients = [
  {
    id: 1,
    code: 'HKF-ML0001',
    name: 'Innovate Corp',
    type: 'Company',
    assignedTo: 'Sebastian',
    createdAt: '2023-01-01T10:00:00Z',
    imported: false,
  },
  {
    id: 2,
    code: 'HKF-ML0002',
    name: 'Alice Johnson',
    type: 'Individual',
    assignedTo: 'Catalina',
    createdAt: '2023-02-10T11:00:00Z',
    imported: false,
  },
];

export default function ClientsPage() {
  const [importedClients, setImportedClients] = useState(initialImportedClients);
  const [prospectClients] = useState(initialProspectClients);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Handler para leer el archivo CSV
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Parseo simple CSV (asume cabecera: code,name,type,assignedTo,createdAt)
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setCsvError('CSV must have a header and at least one row.');
        setCsvPreview([]);
        return;
      }
      const header = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        header.forEach((h, i) => {
          obj[h.trim()] = values[i]?.trim();
        });
        return obj;
      });
      setCsvPreview(rows);
      setCsvError(null);
    };
    reader.readAsText(file);
  };

  // Confirmar importación
  const handleImportConfirm = () => {
    // Validar duplicados por code
    const existingCodes = new Set([
      ...importedClients.map(c => c.code),
      ...prospectClients.map(c => c.code),
    ]);
    const filtered = csvPreview.filter(c => c.code && !existingCodes.has(c.code));
    const toImport = filtered.map((c, idx) => ({
      id: 2000 + importedClients.length + idx,
      code: c.code,
      name: c.name,
      type: c.type,
      assignedTo: c.assignedTo,
      createdAt: c.createdAt || new Date().toISOString(),
      imported: true,
    }));
    setImportedClients(prev => [...prev, ...toImport]);
    setShowImportModal(false);
    setCsvPreview([]);
    setCsvError(null);
  };

  // Lista combinada
  const allClients = [...prospectClients, ...importedClients];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg border border-blue-600 font-medium hover:bg-blue-700 transition-colors"
          onClick={() => setShowImportModal(true)}
        >
          Import Clients
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <ul>
          {allClients.map(client => (
            <li key={client.id} className="p-4 border-b last:border-b-0 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="font-semibold text-lg">{client.name}</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold font-mono">{client.code}</span>
              {client.imported ? (
                <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Imported</span>
              ) : (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">From Prospect</span>
              )}
              <span className="text-xs text-gray-500">Type: {client.type}</span>
              <span className="text-xs text-gray-500">Assigned to: {client.assignedTo}</span>
              <span className="text-xs text-gray-500">Created: {new Date(client.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Modal de importación */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => { setShowImportModal(false); setCsvPreview([]); setCsvError(null); }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Import Clients (CSV)</h3>
            <input
              type="file"
              accept=".csv"
              className="mb-4"
              onChange={handleCsvFile}
            />
            {csvError && <div className="text-red-600 mb-2">{csvError}</div>}
            {csvPreview.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-2">Preview:</div>
                <table className="min-w-full border text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(csvPreview[0]).map(h => (
                        <th key={h} className="px-2 py-1 border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 border">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                  onClick={handleImportConfirm}
                >
                  Import
                </button>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">CSV header: code,name,type,assignedTo,createdAt</div>
          </div>
        </div>
      )}
    </div>
  );
} 