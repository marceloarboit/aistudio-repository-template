import React, { useState, useMemo } from 'react';
import { PourRecord, Supplier, Location, ConcreteType, Device } from '../types';
import { Calendar, FileSpreadsheet, FileText, Download } from 'lucide-react';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ReportsProps {
  pours: PourRecord[];
  suppliers: Supplier[];
  locations: Location[];
  concreteTypes: ConcreteType[];
  devices: Device[];
}

export const Reports: React.FC<ReportsProps> = ({ pours, suppliers, locations, concreteTypes, devices }) => {
  // Default to first day of current month and current date, local time
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return new Date(localDate.getFullYear(), localDate.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  });

  // Filter logic
  const filteredPours = useMemo(() => {
    return pours.filter(p => {
      const pDate = p.date;
      return (!startDate || pDate >= startDate) && (!endDate || pDate <= endDate);
    });
  }, [pours, startDate, endDate]);

  // Stats
  const totalVolume = filteredPours.reduce((acc, p) => acc + p.volumeDelivered, 0);
  const count = filteredPours.length;

  // Helper for manual date formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Data preparation helper
  const getEnrichedData = () => {
    return filteredPours.map(p => {
      const loc = locations.find(l => l.id === p.locationId);
      const sup = suppliers.find(s => s.id === p.supplierId);
      const type = concreteTypes.find(t => t.id === p.concreteTypeId);
      const dev = devices.find(d => d.id === p.deviceId);
      
      return {
        Data: formatDate(p.date),
        NF: p.invoiceNumber,
        Local: loc?.name || 'N/A',
        CentroCusto: loc?.costCenter || 'N/A',
        Fornecedor: sup?.name || 'N/A',
        Traco: type?.name || 'N/A',
        Dispositivo: dev ? `${dev.type} (${dev.ua})` : '-',
        Volume_m3: p.volumeDelivered,
        Caminhao: p.truckId || '-',
        Observacoes: p.notes || ''
      };
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = getEnrichedData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Concretagens");
    XLSX.writeFile(workbook, `Relatorio_Concretagem_${startDate}_a_${endDate}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Concretagens", 14, 15);
    
    doc.setFontSize(10);
    const startFmt = formatDate(startDate);
    const endFmt = formatDate(endDate);

    doc.text(`Período: ${startFmt} a ${endFmt}`, 14, 22);
    doc.text(`Total Volume: ${totalVolume.toFixed(1)} m³ | Registros: ${count}`, 14, 27);

    const tableColumn = ["Data", "NF", "Local", "Fornecedor", "Disp.", "Vol (m³)"];
    const tableRows: any[] = [];

    filteredPours.forEach(p => {
      const loc = locations.find(l => l.id === p.locationId);
      const sup = suppliers.find(s => s.id === p.supplierId);
      const dev = devices.find(d => d.id === p.deviceId);
      
      const rowData = [
        formatDate(p.date),
        p.invoiceNumber,
        loc?.name || 'N/A',
        sup?.name || 'N/A',
        dev ? dev.ua : '-',
        p.volumeDelivered.toFixed(1)
      ];
      tableRows.push(rowData);
    });

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 32,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] } // Blue header
    });

    doc.save(`Relatorio_Concretagem_${startDate}_a_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Relatórios de Exportação
        </h2>

        {/* Filters - Corrigido para grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full min-w-0 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Final</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full min-w-0 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleExportExcel}
            disabled={count === 0}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} />
            <span>Excel</span>
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={count === 0}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileText size={18} />
            <span>PDF</span>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center mb-6">
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase">Volume Total</p>
            <p className="text-xl font-bold text-blue-900">{totalVolume.toFixed(1)} m³</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-blue-600 font-medium uppercase">Registros</p>
             <p className="text-xl font-bold text-blue-900">{count}</p>
          </div>
        </div>

        {/* Preview Table */}
        <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                Pré-visualização
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Local</th>
                            <th className="px-4 py-3 text-right">Vol. (m³)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPours.slice(0, 5).map((p) => {
                             const loc = locations.find(l => l.id === p.locationId);
                             return (
                                <tr key={p.id} className="bg-white hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">{formatDate(p.date)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{loc?.name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{p.volumeDelivered}</td>
                                </tr>
                             );
                        })}
                         {count === 0 && (
                             <tr>
                                 <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                     Nenhum dado no período selecionado
                                 </td>
                             </tr>
                         )}
                    </tbody>
                </table>
            </div>
            {count > 5 && (
                <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
                    + {count - 5} registros não exibidos na prévia
                </div>
            )}
        </div>
      </div>
    </div>
  );
};