import Dexie, { type Table } from 'dexie';

export interface Medication {
  id?: number;
  name: string;
  dosage: string;
  schedule: 'morning' | 'evening' | 'custom';
  reminderTime: string;
}

export interface FlareUp {
  locationId: string;
  severity: number;
  itchLevel: number;
  photoUrl?: string;
  note?: string;
}

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  medsTaken: number[]; // Array of med IDs
  flareUps: FlareUp[];
  lifestyle: {
    sleepHours: number;
    stressLevel: 1 | 2 | 3;
    dietNotes: string;
  };
}

export class MyDatabase extends Dexie {
  medications!: Table<Medication>;
  logs!: Table<DailyLog>;

  constructor() {
    super('PsoriasisDB');
    this.version(1).stores({
      medications: '++id, name, schedule',
      logs: '++id, date'
    });
  }
}

export const db = new MyDatabase();
