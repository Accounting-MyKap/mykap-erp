export default function CreditsPage() {
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
      status: 'Completed', // Ejemplo de prospecto completado
    },
    {
      id: 2,
      code: 'HKF-ML0002',
      name: 'Alice Johnson',
      type: 'Individual',
      assignedTo: 'Catalina',
      createdAt: '2023-02-10T11:00:00Z',
      imported: false,
      status: 'Completed', // Ejemplo de prospecto completado
    },
    {
      id: 3,
      code: 'HKF-ML0003',
      name: 'Beta LLC',
      type: 'Company',
      assignedTo: 'Juan',
      createdAt: '2023-03-15T09:00:00Z',
      imported: false,
      status: 'In Progress', // No se mostrará en créditos
    },
  ];

  // Simulación de clientes importados (esto normalmente vendría de la base de datos o props)
  const importedClients = [
    {
      id: 4,
      code: 'HKF-ML0004',
      name: 'Gamma Inc',
      type: 'Company',
      assignedTo: 'Maria',
      createdAt: '2023-04-01T10:00:00Z',
      imported: true,
      status: 'Completed', // Ejemplo de cliente importado
    },
    {
      id: 5,
      code: 'HKF-ML0005',
      name: 'Delta Corp',
      type: 'Company',
      assignedTo: 'Pedro',
      createdAt: '2023-05-10T11:00:00Z',
      imported: true,
      status: 'In Progress', // Ejemplo de cliente importado
    },
  ];

  // Lista combinada: solo prospectos completados y clientes importados
  const allClients = [
    ...initialProspectClients.filter(c => c.status === 'Completed'),
    ...importedClients
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Credits</h1>
      <p className="mb-6 text-gray-600">Here you can see all credits generated from completed prospects and imported clients.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allClients.map(client => (
          <div
            key={client.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-base font-bold text-gray-800">{client.code}</span>
              {client.imported ? (
                <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Imported</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">From Prospect</span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-auto
                ${client.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
              >
                {client.status}
              </span>
            </div>
            <div className="font-semibold text-lg text-gray-900 mb-1">{client.name}</div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="">Type: <span className="font-medium text-gray-800">{client.type}</span></span>
              <span className="">Assigned to: <span className="font-medium text-gray-800">{client.assignedTo}</span></span>
              <span className="">Created: <span className="font-medium text-gray-800">{new Date(client.createdAt).toLocaleDateString()}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 