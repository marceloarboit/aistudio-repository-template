// @ts-ignore
export enum Unit {
  M3 = 'm³',
  KG = 'kg',
  BAG = 'saco',
  LITER = 'l',
  TON = 'ton',
  UN = 'un'
}

export interface Input {
  id: string;
  code: number; // Auto-increment code
  name: string; // Description/Name of the material
  unit: Unit | string;
  price: number;
}

export interface ConcreteType {
  id: string;
  name: string;
  description: string; // e.g., "FCK 30 Bombeável"
  characteristicStrength: number; // MPa
  ingredients?: {
    inputId: string;
    quantity: number; // Qty per m³
  }[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  rating: number; // 1-5 stars based on reliability
}

export interface Location {
  id: string;
  name: string; // e.g., "Bloco A - Laje 1"
  costCenter: string; // e.g., "CC-101"
}

export interface Device {
  id: string;
  type: string; // e.g., "Tablet", "Sensor", "Câmera"
  ua: string; // Unidade de Aplicação / Identificador
  locationId: string; // Link para o Local
}

export interface PourRecord {
  id: string;
  date: string;
  invoiceNumber: string; // NF
  locationId: string;
  deviceId?: string; // Dispositivo vinculado ao lançamento
  supplierId: string;
  concreteTypeId: string;
  volumeDelivered: number; // Volume Real/NF (m³)
  truckId?: string; // Placa/Número do caminhão
  startTime?: string;
  endTime?: string;
  weather?: 'Sunny' | 'Cloudy' | 'Rainy';
  notes?: string;
}

export interface DashboardStats {
  totalVolume: number;
  totalPours: number;
}