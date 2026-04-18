export type StageState = "done" | "current" | "blocked" | "";
export type ProjectState = "normal" | "warn" | "danger" | "done";

export interface Project {
  id: string;
  name: string;
  client: string;
  code: string;
  stage: number;
  stages: StageState[];
  state: ProjectState;
  days: number;
  cost: string;
  sessions: number;
  initials: string;
  dotColor: string;
  progress: number;
}

export const PROJECTS: Project[] = [
  {
    id: "megamart",
    name: "Mega Mart DOOH",
    client: "Mega Mart Retail",
    code: "MEGAMART-DOOH-2026",
    stage: 3,
    stages: ["done", "done", "current", "", "", "", ""],
    state: "normal",
    days: 47,
    cost: "$18.40",
    sessions: 4,
    initials: "MM",
    dotColor: "var(--teal-500)",
    progress: 42,
  },
  {
    id: "tpbank",
    name: "TPBank CRM Sales",
    client: "TPBank · via TNTech",
    code: "TPB-CRM-2026",
    stage: 3,
    stages: ["done", "done", "blocked", "", "", "", ""],
    state: "warn",
    days: -3,
    cost: "$42.10",
    sessions: 5,
    initials: "TP",
    dotColor: "var(--amber-500)",
    progress: 38,
  },
  {
    id: "msb",
    name: "MSB FXDealing DR",
    client: "MSB · via TNTech",
    code: "MSB-FXD-DR-2026",
    stage: 5,
    stages: ["done", "done", "done", "done", "current", "", ""],
    state: "normal",
    days: 21,
    cost: "$67.80",
    sessions: 7,
    initials: "MS",
    dotColor: "var(--blue-500)",
    progress: 65,
  },
  {
    id: "rox",
    name: "Rox Key BPM",
    client: "Rox Key Holdings",
    code: "ROXKEY-BPM-2026",
    stage: 4,
    stages: ["done", "done", "done", "current", "", "", ""],
    state: "normal",
    days: 68,
    cost: "$31.20",
    sessions: 3,
    initials: "RK",
    dotColor: "var(--violet-500)",
    progress: 52,
  },
  {
    id: "staffx",
    name: "StaffX Marketplace v2",
    client: "Internal · Reborn",
    code: "STAFFX-MKP-V2",
    stage: 7,
    stages: ["done", "done", "done", "done", "done", "done", "current"],
    state: "done",
    days: 5,
    cost: "$124.50",
    sessions: 11,
    initials: "SX",
    dotColor: "var(--emerald-500)",
    progress: 95,
  },
  {
    id: "tng",
    name: "TNG Archive System",
    client: "TNG Holdings",
    code: "TNG-ARCH-2026",
    stage: 2,
    stages: ["done", "current", "", "", "", "", ""],
    state: "normal",
    days: 92,
    cost: "$4.20",
    sessions: 1,
    initials: "TN",
    dotColor: "var(--slate-500)",
    progress: 18,
  },
];

export function findProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
