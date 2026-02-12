// @ts-ignore
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PourForm } from './components/PourForm';
import { Registry } from './components/Registry';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { PourRecord, Supplier, Location, ConcreteType, Device, Input } from './types';
import { ClipboardList, Calendar, Pencil, Trash2, Loader2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { dbService } from './services/db';
import { auth } from './services/firebase';
// @ts-ignore
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [editingPour, setEditingPour] = useState<PourRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [pours, setPours] = useState<PourRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [concreteTypes, setConcreteTypes] = useState<ConcreteType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Define loadData as reusable function
  const loadData = useCallback(async () => {
    try {
      const [loadedPours, loadedSuppliers, loadedLocations, loadedTypes, loadedDevices, loadedInputs] = await Promise.all([
        dbService.getAll<PourRecord>('pours'),
        dbService.getAll<Supplier>('suppliers'),
        dbService.getAll<Location>('locations'),
        dbService.getAll<ConcreteType>('concreteTypes'),
        dbService.getAll<Device>('devices'),
        dbService.getAll<Input>('inputs')
      ]);

      setPours(loadedPours);
      setSuppliers(loadedSuppliers);
      setLocations(loadedLocations);
      setConcreteTypes(loadedTypes);
      setDevices(loadedDevices);
      setInputs(loadedInputs);
    } catch (error) {
      console.error("Failed to load online database:", error);
    }
  }, []);

  // Load data from DB only when User is logged in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setIsLoading(true);

    const initSystem = async () => {
      await loadData();
      if (isMounted) setIsLoading(false);
    };

    initSystem();

    return () => { isMounted = false; };
  }, [user, loadData]);

  const handleSavePour = async (recordData: Omit<PourRecord, 'id'>) => {
    try {
      if (editingPour) {
        // Update existing record
        await dbService.update('pours', { ...recordData, id: editingPour.id });
        // Reload to ensure consistency or optimistically update
        setPours(prev => prev.map(p => p.id === editingPour.id ? { ...recordData, id: editingPour.id } as PourRecord : p));
        setEditingPour(null);
      } else {
        // Create new record
        const newId = await dbService.add('pours', recordData);
        const newPour: PourRecord = {
          ...recordData,
          id: newId
        };

        setPours(prev => [newPour, ...prev]);
      }
      setCurrentTab('dashboard');
    } catch (error) {
      console.error("Error saving pour:", error);
      alert("Erro ao salvar registro. Verifique sua conexão.");
    }
  };

  const handleEditPour = (pour: PourRecord) => {
    setEditingPour(pour);
    setCurrentTab('entry');
  };

  const handleDeletePour = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

    try {
      await dbService.delete('pours', id);
      setPours(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting pour:", error);
    }
  };

  const handleDelete = async (type: 'supplier' | 'location' | 'concreteType' | 'device' | 'input', id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este item do cadastro?")) return;

    try {
      if (type === 'supplier') {
        await dbService.delete('suppliers', id);
        setSuppliers(prev => prev.filter(i => i.id !== id));
      }
      if (type === 'location') {
        await dbService.delete('locations', id);
        setLocations(prev => prev.filter(i => i.id !== id));
      }
      if (type === 'concreteType') {
        await dbService.delete('concreteTypes', id);
        setConcreteTypes(prev => prev.filter(i => i.id !== id));
      }
      if (type === 'device') {
        await dbService.delete('devices', id);
        setDevices(prev => prev.filter(i => i.id !== id));
      }
      if (type === 'input') {
        await dbService.delete('inputs', id);
        setInputs(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  // ADD HANDLERS
  const handleAddLocation = async (l: Omit<Location, 'id'>) => {
    const id = await dbService.add('locations', l);
    setLocations(prev => [...prev, { ...l, id }]);
  };

  const handleAddSupplier = async (s: Omit<Supplier, 'id'>) => {
    const id = await dbService.add('suppliers', s);
    setSuppliers(prev => [...prev, { ...s, id }]);
  };

  const handleAddType = async (t: Omit<ConcreteType, 'id'>) => {
    const id = await dbService.add('concreteTypes', t);
    setConcreteTypes(prev => [...prev, { ...t, id }]);
  };

  const handleAddDevice = async (d: Omit<Device, 'id'>) => {
    const id = await dbService.add('devices', d);
    setDevices(prev => [...prev, { ...d, id }]);
  };

  const handleAddInput = async (i: Omit<Input, 'id'>) => {
    const id = await dbService.add('inputs', i);
    setInputs(prev => [...prev, { ...i, id }]);
  };

  // UPDATE HANDLERS
  const handleUpdateLocation = async (l: Location) => {
    await dbService.update('locations', l);
    setLocations(prev => prev.map(item => item.id === l.id ? l : item));
  };

  const handleUpdateSupplier = async (s: Supplier) => {
    await dbService.update('suppliers', s);
    setSuppliers(prev => prev.map(item => item.id === s.id ? s : item));
  };

  const handleUpdateType = async (t: ConcreteType) => {
    await dbService.update('concreteTypes', t);
    setConcreteTypes(prev => prev.map(item => item.id === t.id ? t : item));
  };

  const handleUpdateDevice = async (d: Device) => {
    await dbService.update('devices', d);
    setDevices(prev => prev.map(item => item.id === d.id ? d : item));
  };

  const handleUpdateInput = async (i: Input) => {
    await dbService.update('inputs', i);
    setInputs(prev => prev.map(item => item.id === i.id ? i : item));
  };


  const handleTabChange = (tab: string) => {
    if (tab !== 'entry') {
      setEditingPour(null);
    }
    setCurrentTab(tab);
  };

  // Helper to format date string directly without timezone conversion
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Assumes YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Sorting Logic
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPours = useMemo(() => {
    let sortableItems = [...pours];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof PourRecord];
        let bValue: any = b[sortConfig.key as keyof PourRecord];

        // Handle special cases (Lookup names instead of IDs)
        if (sortConfig.key === 'location') {
          aValue = locations.find(l => l.id === a.locationId)?.name || '';
          bValue = locations.find(l => l.id === b.locationId)?.name || '';
        } else if (sortConfig.key === 'supplier') {
          aValue = suppliers.find(s => s.id === a.supplierId)?.name || '';
          bValue = suppliers.find(s => s.id === b.supplierId)?.name || '';
        } else if (sortConfig.key === 'nf') {
          // Alias for sorting by invoice number
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
        } else if (sortConfig.key === 'volume') {
          aValue = a.volumeDelivered;
          bValue = b.volumeDelivered;
        }

        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Number comparison
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [pours, sortConfig, locations, suppliers]);

  const SortHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <th
      className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey && (
          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
        )}
      </div>
    </th>
  );


  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard pours={pours} suppliers={suppliers} locations={locations} />;
      case 'entry':
        return (
          <PourForm
            suppliers={suppliers}
            locations={locations}
            concreteTypes={concreteTypes}
            devices={devices}
            onSave={handleSavePour}
            onCancel={() => {
              setEditingPour(null);
              setCurrentTab('dashboard');
            }}
            initialData={editingPour}
          />
        );
      case 'registry':
        return (
          <Registry
            suppliers={suppliers}
            locations={locations}
            concreteTypes={concreteTypes}
            devices={devices}
            inputs={inputs}
            onAddLocation={handleAddLocation}
            onAddSupplier={handleAddSupplier}
            onAddType={handleAddType}
            onAddDevice={handleAddDevice}
            onAddInput={handleAddInput}
            onUpdateLocation={handleUpdateLocation}
            onUpdateSupplier={handleUpdateSupplier}
            onUpdateType={handleUpdateType}
            onUpdateDevice={handleUpdateDevice}
            onUpdateInput={handleUpdateInput}
            onDelete={handleDelete}
          />
        );
      case 'reports':
        return (
          <Reports
            pours={pours}
            suppliers={suppliers}
            locations={locations}
            concreteTypes={concreteTypes}
            devices={devices}
          />
        );
      case 'records':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList size={20} /> Histórico Completo
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortHeader label="Data" sortKey="date" />
                      <SortHeader label="NF" sortKey="nf" />
                      <SortHeader label="Local" sortKey="location" />
                      <SortHeader label="Fornecedor" sortKey="supplier" />
                      <SortHeader label="Vol." sortKey="volume" />
                      <th className="px-4 py-3 whitespace-nowrap text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedPours.map(pour => {
                      const loc = locations.find(l => l.id === pour.locationId);
                      const sup = suppliers.find(s => s.id === pour.supplierId);

                      return (
                        <tr key={pour.id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {formatDate(pour.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                            {pour.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            {loc?.name || 'Local Removido'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {sup?.name || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-800">
                            {pour.volumeDelivered} m³
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPour(pour);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePour(pour.id);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {pours.length === 0 && (
                <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                  <AlertTriangle size={32} className="mb-2 opacity-50" />
                  <p>Sem registros encontrados.</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <Dashboard pours={pours} suppliers={suppliers} locations={locations} />;
    }
  };

  // 1. checking auth status
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white opacity-50" size={32} />
      </div>
    );
  }

  // 2. Not logged in -> Show Login
  if (!user) {
    return <Login />;
  }

  // 3. Logged in, but loading data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
        <p className="text-sm font-medium">Carregando dados da nuvem...</p>
      </div>
    );
  }

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;