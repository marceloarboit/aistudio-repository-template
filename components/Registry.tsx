// @ts-ignore
import React, { useState } from 'react';
import { Supplier, Location, ConcreteType, Device, Input, Unit } from '../types';
import { MapPin, Truck, Component, Trash2, Plus, Smartphone, Pencil, Package, X } from 'lucide-react';

interface RegistryProps {
  suppliers: Supplier[];
  locations: Location[];
  concreteTypes: ConcreteType[];
  devices: Device[];
  inputs: Input[];
  onAddSupplier: (s: Omit<Supplier, 'id'>) => void;
  onAddLocation: (l: Omit<Location, 'id'>) => void;
  onAddType: (t: Omit<ConcreteType, 'id'>) => void;
  onAddDevice: (d: Omit<Device, 'id'>) => void;
  onAddInput: (i: Omit<Input, 'id'>) => void;
  onUpdateSupplier: (s: Supplier) => void;
  onUpdateLocation: (l: Location) => void;
  onUpdateType: (t: ConcreteType) => void;
  onUpdateDevice: (d: Device) => void;
  onUpdateInput: (i: Input) => void;
  onDelete: (type: 'supplier' | 'location' | 'concreteType' | 'device' | 'input', id: string) => void;
}

export const Registry: React.FC<RegistryProps> = ({
  suppliers, locations, concreteTypes, devices, inputs,
  onAddSupplier, onAddLocation, onAddType, onAddDevice, onAddInput,
  onUpdateSupplier, onUpdateLocation, onUpdateType, onUpdateDevice, onUpdateInput,
  onDelete
}) => {
  // Changed default active tab to 'devices' based on user request order
  const [activeTab, setActiveTab] = useState<'devices' | 'types' | 'suppliers' | 'locations' | 'inputs'>('inputs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Temporary state for new entries
  const [newLoc, setNewLoc] = useState({ name: '', costCenter: '' });
  const [newSup, setNewSup] = useState({ name: '', contact: '', rating: 5 });
  const [newType, setNewType] = useState<{ name: string, description: string, characteristicStrength: number, ingredients: { inputId: string, quantity: number }[] }>({
    name: '', description: '', characteristicStrength: 25, ingredients: []
  });
  const [newDev, setNewDev] = useState({ type: '', ua: '', locationId: '' });
  const [newInput, setNewInput] = useState<{ code: number; name: string; unit: string; price: number }>({
    code: 0,
    name: '',
    unit: Unit.KG,
    price: 0
  });

  // State for adding ingredient to recipe
  const [selectedIngredient, setSelectedIngredient] = useState<{ inputId: string, quantity: number }>({ inputId: '', quantity: 0 });

  const getNextInputCode = () => {
    if (inputs.length === 0) return 1;
    return Math.max(...inputs.map(i => i.code)) + 1;
  };

  const clearForms = () => {
    setNewLoc({ name: '', costCenter: '' });
    setNewSup({ name: '', contact: '', rating: 5 });
    setNewType({ name: '', description: '', characteristicStrength: 25, ingredients: [] });
    setNewDev({ type: '', ua: '', locationId: '' });
    setNewInput({ code: getNextInputCode(), name: '', unit: Unit.KG, price: 0 });
    setSelectedIngredient({ inputId: '', quantity: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleStartAdd = () => {
    clearForms();
    setNewInput(prev => ({ ...prev, code: getNextInputCode() }));
    setShowForm(true);
  };

  const handleEdit = (type: 'locations' | 'suppliers' | 'types' | 'devices' | 'inputs', item: any) => {
    setEditingId(item.id);
    if (type === 'locations') setNewLoc({ name: item.name, costCenter: item.costCenter });
    if (type === 'suppliers') setNewSup({ name: item.name, contact: item.contact, rating: item.rating });
    if (type === 'types') setNewType({
      name: item.name,
      description: item.description,
      characteristicStrength: item.characteristicStrength,
      ingredients: item.ingredients || []
    });
    if (type === 'devices') setNewDev({ type: item.type, ua: item.ua, locationId: item.locationId });
    if (type === 'inputs') setNewInput({ code: item.code, name: item.name, unit: item.unit, price: item.price });
    setShowForm(true);
  };

  const handleSave = () => {
    if (activeTab === 'locations' && newLoc.name) {
      if (editingId) onUpdateLocation({ ...newLoc, id: editingId });
      else onAddLocation({ ...newLoc });
    } else if (activeTab === 'suppliers' && newSup.name) {
      if (editingId) onUpdateSupplier({ ...newSup, id: editingId });
      else onAddSupplier({ ...newSup });
    } else if (activeTab === 'types' && newType.name) {
      if (editingId) onUpdateType({ ...newType, id: editingId });
      else onAddType({ ...newType });
    } else if (activeTab === 'devices' && newDev.type && newDev.ua && newDev.locationId) {
      if (editingId) onUpdateDevice({ ...newDev, id: editingId });
      else onAddDevice({ ...newDev });
    } else if (activeTab === 'inputs' && newInput.name && newInput.price > 0) {
      if (editingId) onUpdateInput({ ...newInput, id: editingId });
      else onAddInput({ ...newInput });
    }
    clearForms();
  };

  const handleAddIngredient = () => {
    if (selectedIngredient.inputId && selectedIngredient.quantity > 0) {
      setNewType(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, selectedIngredient]
      }));
      setSelectedIngredient({ inputId: '', quantity: 0 });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setNewType(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => {
        setActiveTab(id);
        clearForms();
      }}
      className={`flex-1 py-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
        }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.substring(0, 4)}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] flex flex-col">
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {/* Reordered Tabs: Disposit., Tipos, Forneced, Locais */}
        <TabButton id="inputs" label="Insumos" icon={Package} />
        <TabButton id="types" label="Tipos" icon={Component} />
        <TabButton id="devices" label="Disposit." icon={Smartphone} />
        <TabButton id="suppliers" label="Forneced." icon={Truck} />
        <TabButton id="locations" label="Locais" icon={MapPin} />
      </div>

      <div className="p-4 flex-1">
        {!showForm ? (
          <>
            <button
              type="button"
              onClick={handleStartAdd}
              className="w-full mb-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Adicionar Novo
            </button>

            <div className="space-y-2">
              {/* RENDER INPUTS (New Tab) */}
              {activeTab === 'inputs' && inputs.sort((a, b) => a.code - b.code).map(i => (
                <div key={i.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">#{i.code}</span>
                      <p className="font-medium text-gray-800 text-sm">{i.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Preço/Unid: <span className="text-green-600 font-medium">R$ {Number(i.price).toFixed(2)} / {i.unit}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit('inputs', i)} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={16} /></button>
                    <button type="button" onClick={() => onDelete('input', i.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {/* RENDER DEVICES (New First Tab) */}
              {activeTab === 'devices' && [...devices].sort((a, b) => {
                const locA = locations.find(l => l.id === a.locationId)?.name || '';
                const locB = locations.find(l => l.id === b.locationId)?.name || '';
                const locCompare = locA.localeCompare(locB);
                if (locCompare !== 0) return locCompare;
                return a.type.localeCompare(b.type);
              }).map(d => {
                const locName = locations.find(l => l.id === d.locationId)?.name || 'Sem local';
                return (
                  <div key={d.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{d.type}</p>
                      <p className="text-xs text-gray-500">UA: {d.ua} • <span className="text-blue-500">{locName}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit('devices', d)} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={16} /></button>
                      <button type="button" onClick={() => onDelete('device', d.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )
              })}

              {/* RENDER TYPES (New Second Tab) */}
              {activeTab === 'types' && concreteTypes.map(t => (
                <div key={t.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      {t.ingredients?.length || 0} insumos cadastrados
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit('types', t)} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={16} /></button>
                    <button type="button" onClick={() => onDelete('concreteType', t.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {/* RENDER SUPPLIERS (New Third Tab) */}
              {activeTab === 'suppliers' && suppliers.map(s => (
                <div key={s.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.contact}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit('suppliers', s)} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={16} /></button>
                    <button type="button" onClick={() => onDelete('supplier', s.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {/* RENDER LOCATIONS (New Fourth Tab) */}
              {activeTab === 'locations' && locations.map(l => (
                <div key={l.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{l.name}</p>
                    <p className="text-xs text-gray-500">{l.costCenter}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit('locations', l)} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={16} /></button>
                    <button type="button" onClick={() => onDelete('location', l.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-gray-700 mb-4">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>

            {activeTab === 'inputs' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-1/4">
                    <label className="text-xs text-gray-500 mb-1 block">Código</label>
                    <input
                      disabled
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm"
                      value={newInput.code}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                    <input
                      placeholder="Ex: Cimento CP-II"
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newInput.name}
                      onChange={e => setNewInput({ ...newInput, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block">Unidade</label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newInput.unit}
                      onChange={e => setNewInput({ ...newInput, unit: e.target.value as Unit })}
                    >
                      <option value="">Selecione a Unidade...</option>
                      <option value={Unit.KG}>kg</option>
                      <option value={Unit.M3}>m³</option>
                      <option value={Unit.BAG}>un (saco)</option>
                      <option value={Unit.LITER}>litros</option>
                      <option value={Unit.TON}>toneladas</option>
                      <option value={Unit.UN}>unidade</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block">Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newInput.price}
                      onChange={e => setNewInput({ ...newInput, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tipo do Dispositivo</label>
                  <input
                    placeholder="Ex: Tablet, Sensor"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newDev.type}
                    onChange={e => setNewDev({ ...newDev, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">UA (Unidade de Apropriação)</label>
                  <input
                    placeholder="Identificador Único"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newDev.ua}
                    onChange={e => setNewDev({ ...newDev, ua: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Local de Aplicação</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newDev.locationId}
                    onChange={e => setNewDev({ ...newDev, locationId: e.target.value })}
                  >
                    <option value="">Selecione o Local...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'types' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome do Traço</label>
                  <input
                    placeholder="Ex: FCK 40"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newType.name}
                    onChange={e => setNewType({ ...newType, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                  <input
                    placeholder="Ex: Concreto Bombeável"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newType.description}
                    onChange={e => setNewType({ ...newType, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Resistência Característica (Fck - MPa)</label>
                  <input
                    type="number"
                    placeholder="Ex: 25"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newType.characteristicStrength}
                    onChange={e => setNewType({ ...newType, characteristicStrength: parseFloat(e.target.value) })}
                  />
                </div>

                {/* Ingredients Section */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Traço / Composição (por m³)</h4>

                  {/* List of added ingredients */}
                  <div className="space-y-2 mb-3">
                    {newType.ingredients.map((ing, idx) => {
                      const inputData = inputs.find(i => i.id === ing.inputId);
                      return (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-sm">
                          <span>{inputData?.name || 'Item removido'}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono">{Number(ing.quantity).toFixed(3)} {inputData?.unit}</span>
                            <button
                              onClick={() => handleRemoveIngredient(idx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {newType.ingredients.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-2">Nenhum insumo adicionado</p>
                    )}
                  </div>

                  {/* Add Ingredient Form */}
                  <div className="flex gap-2">
                    <select
                      className="flex-1 p-2 border border-gray-200 rounded bg-white text-sm"
                      value={selectedIngredient.inputId}
                      onChange={e => setSelectedIngredient({ ...selectedIngredient, inputId: e.target.value })}
                    >
                      <option value="">Selecione Insumo...</option>
                      {inputs.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Qtd (0.000)"
                      className="w-32 p-2 border border-gray-200 rounded bg-white text-sm"
                      value={selectedIngredient.quantity || ''}
                      onChange={e => setSelectedIngredient({ ...selectedIngredient, quantity: parseFloat(e.target.value) })}
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Razão Social / Nome</label>
                  <input
                    placeholder="Empresa"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newSup.name}
                    onChange={e => setNewSup({ ...newSup, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Contato / Telefone</label>
                  <input
                    placeholder="Contato"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newSup.contact}
                    onChange={e => setNewSup({ ...newSup, contact: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome do Local</label>
                  <input
                    placeholder="Ex: Bloco B"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newLoc.name}
                    onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Centro de Custo</label>
                  <input
                    placeholder="Ex: CC-202"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newLoc.costCenter}
                    onChange={e => setNewLoc({ ...newLoc, costCenter: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={clearForms} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">Cancelar</button>
              <button type="button" onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">Salvar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};