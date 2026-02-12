import React, { useState, useEffect, useMemo } from 'react';
import { ConcreteType, Location, Supplier, PourRecord, Device } from '../types';
import { Save, Calendar, MapPin, Truck, FileText, Activity, Beaker, AlertCircle, Smartphone } from 'lucide-react';

interface PourFormProps {
  suppliers: Supplier[];
  locations: Location[];
  concreteTypes: ConcreteType[];
  devices: Device[];
  onSave: (record: Omit<PourRecord, 'id'>) => void;
  onCancel: () => void;
  initialData?: PourRecord | null;
}

export const PourForm: React.FC<PourFormProps> = ({ 
  suppliers, 
  locations, 
  concreteTypes, 
  devices,
  onSave, 
  onCancel,
  initialData 
}) => {
  // Helper to get local date string YYYY-MM-DD correctly
  const getTodayLocal = () => {
    const date = new Date();
    // Adjust for timezone offset to ensure we get the local user's date, not UTC
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  };

  const defaultState = {
    date: getTodayLocal(),
    invoiceNumber: '',
    locationId: '', 
    deviceId: '',
    supplierId: '', 
    concreteTypeId: '', 
    volumeDelivered: '',
    notes: '',
    weather: 'Sunny' as 'Sunny' | 'Cloudy' | 'Rainy'
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        invoiceNumber: initialData.invoiceNumber,
        locationId: initialData.locationId,
        deviceId: initialData.deviceId || '',
        supplierId: initialData.supplierId,
        concreteTypeId: initialData.concreteTypeId,
        volumeDelivered: initialData.volumeDelivered.toString(),
        notes: initialData.notes || '',
        weather: initialData.weather || 'Sunny'
      });
    } else {
      // Reset to empty defaults for new entries
      setFormData(defaultState);
    }
  }, [initialData]); 

  // Filter devices based on selected location
  const availableDevices = useMemo(() => {
    return devices.filter(d => d.locationId === formData.locationId);
  }, [devices, formData.locationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.locationId) {
        alert('Selecione um Local de Aplicação');
        return;
    }
    if (!formData.supplierId) {
        alert('Selecione um Fornecedor');
        return;
    }
    if (!formData.concreteTypeId) {
        alert('Selecione um Traço de Concreto');
        return;
    }
    if (!formData.volumeDelivered) {
      alert('Volume da Nota Fiscal é obrigatório');
      return;
    }

    const volDelivered = parseFloat(formData.volumeDelivered);

    const record: Omit<PourRecord, 'id'> = {
      ...formData,
      volumeDelivered: volDelivered,
    };

    onSave(record);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
        const updates: any = { [field]: value };
        // If location changes, reset selected device
        if (field === 'locationId') {
            updates.deviceId = '';
        }
        return { ...prev, ...updates };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">
          {initialData ? 'Editar Concretagem' : 'Nova Concretagem'}
        </h2>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
      </div>

      {/* Section: Geral */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Calendar size={12} /> Data
            </label>
            <input 
              type="date" 
              required
              className="w-full min-w-0 p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FileText size={12} /> NF
            </label>
            <input 
              type="text" 
              required
              placeholder="12345"
              className="w-full min-w-0 p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <MapPin size={12} /> Local de Aplicação
          </label>
          <select 
            required
            className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={formData.locationId}
            onChange={(e) => handleChange('locationId', e.target.value)}
          >
             <option value="" disabled>Selecione...</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.costCenter})</option>)}
          </select>
        </div>

        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Smartphone size={12} /> Dispositivo (Opcional)
            </label>
            <select 
                className={`w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${!formData.locationId ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={formData.deviceId}
                onChange={(e) => handleChange('deviceId', e.target.value)}
                disabled={!formData.locationId}
            >
                <option value="">
                    {availableDevices.length === 0 && formData.locationId 
                        ? 'Nenhum dispositivo neste local' 
                        : 'Selecione o dispositivo...'}
                </option>
                {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>{d.type} - {d.ua}</option>
                ))}
            </select>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section: Fornecimento */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Truck size={12} /> Fornecedor
            </label>
            <select 
              required
              className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.supplierId}
              onChange={(e) => handleChange('supplierId', e.target.value)}
            >
              <option value="" disabled>Selecione...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
           <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Beaker size={12} /> Traço
            </label>
            <select 
              required
              className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.concreteTypeId}
              onChange={(e) => handleChange('concreteTypeId', e.target.value)}
            >
              <option value="" disabled>Selecione...</option>
              {concreteTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section: Medições */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Activity size={16} className="text-blue-500" /> 
          Controles de Campo
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vol. Nota Fiscal (m³)</label>
            <input 
              type="number" step="0.1" required
              className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.volumeDelivered}
              onChange={(e) => handleChange('volumeDelivered', e.target.value)}
            />
          </div>
          {/* Removed Truck/Plate input */}
        </div>

        <div>
           <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
             <AlertCircle size={12} /> Observações
           </label>
           <textarea 
              rows={2}
              className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Ex: Atraso na chegada, chuva durante a aplicação..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
           />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {initialData ? 'Atualizar Registro' : 'Registrar Concretagem'}
      </button>
    </form>
  );
};