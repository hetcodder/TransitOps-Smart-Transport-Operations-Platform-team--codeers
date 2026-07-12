import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db.json");

interface LocalDbStructure {
  vehicles: any[];
  drivers: any[];
  users?: any[];
  sessions?: any[];
  trips?: any[];
  dispatches?: any[];
  maintenances?: any[];
  fuelLogs?: any[];
  expenses?: any[];
  documents?: any[];
  calendarEvents?: any[];
  notifications?: any[];
  activityLogs?: any[];
}

export function readLocalDb(): LocalDbStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { 
        vehicles: [], drivers: [], users: [], sessions: [], 
        trips: [], dispatches: [], maintenances: [], fuelLogs: [], 
        expenses: [], documents: [], calendarEvents: [], notifications: [], activityLogs: [] 
      };
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return {
      vehicles: parsed.vehicles || [],
      drivers: parsed.drivers || [],
      users: parsed.users || [],
      sessions: parsed.sessions || [],
      trips: parsed.trips || [],
      dispatches: parsed.dispatches || [],
      maintenances: parsed.maintenances || [],
      fuelLogs: parsed.fuelLogs || [],
      expenses: parsed.expenses || [],
      documents: parsed.documents || [],
      calendarEvents: parsed.calendarEvents || [],
      notifications: parsed.notifications || [],
      activityLogs: parsed.activityLogs || []
    };
  } catch (error) {
    console.error("🚨 Error reading local JSON DB:", error);
    return { 
      vehicles: [], drivers: [], users: [], sessions: [], 
      trips: [], dispatches: [], maintenances: [], fuelLogs: [], 
      expenses: [], documents: [], calendarEvents: [], notifications: [], activityLogs: [] 
    };
  }
}

export function writeLocalDb(data: LocalDbStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("🚨 Error writing local JSON DB:", error);
  }
}
