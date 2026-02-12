import React, { useMemo, useState } from 'react';
import { PourRecord, Supplier, Location } from '../types';
import { Droplets, Layers, Filter, Calendar } from 'lucide-react';

interface DashboardProps {
  pours: PourRecord[];
  suppliers: Supplier[];
  locations: Location[];
}

export const Dashboard: React.FC<DashboardProps> = ({ pours, suppliers, locations }) => {
  // Default to current month
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    // Use timezone aware date for inputs
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return new Date(localDate.getFullYear(), localDate.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
     // Use timezone aware date for inputs
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return new Date(localDate.getFullYear(), localDate.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const filteredPours = useMemo(() => {
    return pours.filter(p => {
      if (!startDate && !endDate) return true;
      const pDate = p.date;
      return (!startDate || pDate >= startDate) && (!endDate || pDate <= endDate);
    });
  }, [pours, startDate, endDate]);

  const stats = useMemo(() => {
    const totalVol = filteredPours.reduce((acc, p) => acc + p.volumeDelivered, 0);
    const totalPours = filteredPours.length;
    
    return {
      totalVol,
      totalPours
    };
  }, [filteredPours]);

  // Helper to format date without timezone shifting
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if(parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium text-sm">
          <Filter size={16} className="text-blue-600" />
          <span>Filtrar Período</span>
        </div>
        {/* Changed grid-cols-2 to grid-cols-1 sm:grid-cols-2 for better mobile view */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Início</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full min-w-0 p-2 pl-8 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full min-w-0 p-2 pl-8 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Droplets size={16} />
            <span className="text-xs font-medium uppercase">Volume (Período)</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.totalVol.toFixed(1)} <span className="text-sm text-gray-500">m³</span></span>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Layers size={16} />
            <span className="text-xs font-medium uppercase">Lançamentos</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats.totalPours}
          </span>
          <span className="text-xs text-gray-400">No período selecionado</span>
        </div>
      </div>

      {/* Recent Activity Snippet (Filtered) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-sm text-gray-700">Concretagens no Período</h3>
          <span className="text-xs text-gray-400">{filteredPours.length} registros</span>
        </div>
        <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto no-scrollbar">
          {filteredPours.slice(0, 20).map(pour => {
            const loc = locations.find(l => l.id === pour.locationId);
            return (
              <div key={pour.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{loc?.name || 'Local indefinido'}</p>
                  <p className="text-xs text-gray-500">{formatDate(pour.date)} • NF {pour.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-gray-900">{pour.volumeDelivered} m³</span>
                </div>
              </div>
            );
          })}
          {filteredPours.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">Nenhum registro encontrado neste período.</p>}
        </div>
      </div>
    </div>
  );
};