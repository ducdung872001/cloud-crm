export type TeamRole = "BA" | "SA" | "Dev" | "QA" | "PM" | "TechLead" | "Admin";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  initials: string;
  color: string;
  active: boolean;
  workload: number; // 0-100
  skills: string[];
  joinedAt: string;
  projects: string[];
}

export const MEMBERS: Member[] = [
  {
    id: "phan-dung",
    name: "Phan Dũng",
    email: "ceo@reborn.vn",
    role: "Admin",
    initials: "PD",
    color: "var(--teal-500)",
    active: true,
    workload: 60,
    skills: ["Leadership", "SA", "BPM"],
    joinedAt: "01/01/2024",
    projects: ["Mega Mart DOOH", "TPBank CRM"],
  },
  {
    id: "an-minh",
    name: "An Minh",
    email: "minh.a@reborn.vn",
    role: "BA",
    initials: "AM",
    color: "var(--blue-500)",
    active: true,
    workload: 85,
    skills: ["URD", "User research", "BPMN"],
    joinedAt: "15/03/2024",
    projects: ["Mega Mart DOOH", "MSB FXD", "Rox Key"],
  },
  {
    id: "chi-lan",
    name: "Chi Lan",
    email: "lan.c@reborn.vn",
    role: "PM",
    initials: "CL",
    color: "var(--violet-500)",
    active: true,
    workload: 95,
    skills: ["Agile", "Client management"],
    joinedAt: "22/01/2024",
    projects: ["Mega Mart DOOH", "TPBank CRM"],
  },
  {
    id: "huong-c",
    name: "Chị Hương",
    email: "huong.c@reborn.vn",
    role: "Dev",
    initials: "CH",
    color: "var(--amber-500)",
    active: true,
    workload: 70,
    skills: ["Next.js", "Spring Boot", "DevOps"],
    joinedAt: "10/02/2024",
    projects: ["Mega Mart DOOH"],
  },
  {
    id: "duc-a",
    name: "A Đức",
    email: "duc.a@reborn.vn",
    role: "TechLead",
    initials: "AD",
    color: "var(--emerald-500)",
    active: true,
    workload: 75,
    skills: ["Architecture", "Kafka", "K8s", "Go"],
    joinedAt: "08/05/2024",
    projects: ["MSB FXD", "Rox Key"],
  },
  {
    id: "qa-thao",
    name: "Thảo QA",
    email: "thao.q@reborn.vn",
    role: "QA",
    initials: "TQ",
    color: "var(--rose-500)",
    active: true,
    workload: 55,
    skills: ["Playwright", "Cypress", "JMeter"],
    joinedAt: "18/07/2024",
    projects: ["Mega Mart DOOH", "TPBank CRM"],
  },
  {
    id: "sa-hung",
    name: "Hùng SA",
    email: "hung.s@reborn.vn",
    role: "SA",
    initials: "HS",
    color: "var(--slate-600)",
    active: false,
    workload: 0,
    skills: ["System design", "DDD"],
    joinedAt: "12/11/2023",
    projects: [],
  },
];

export const ROLE_LABEL: Record<TeamRole, string> = {
  BA: "Business Analyst",
  SA: "Solution Architect",
  Dev: "Developer",
  QA: "Quality Assurance",
  PM: "Project Manager",
  TechLead: "Tech Lead",
  Admin: "Administrator",
};

export const PERMISSIONS = [
  { key: "project.create", label: "Tạo project mới" },
  { key: "project.archive", label: "Archive project" },
  { key: "urd.approve", label: "Duyệt URD" },
  { key: "urd.edit", label: "Sửa URD" },
  { key: "prototype.regenerate", label: "Regenerate prototype" },
  { key: "code.deploy.staging", label: "Deploy staging" },
  { key: "code.deploy.prod", label: "Deploy production" },
  { key: "cr.approve", label: "Duyệt CR (internal)" },
  { key: "test.sign", label: "Ký QA test report" },
  { key: "uat.sign", label: "Ký UAT (cho Reborn)" },
  { key: "team.invite", label: "Mời member mới" },
  { key: "team.role.edit", label: "Sửa role member khác" },
  { key: "settings.api", label: "Quản lý API keys" },
  { key: "settings.billing", label: "Quản lý billing" },
];

export const ROLE_PERMS: Record<TeamRole, string[]> = {
  Admin: PERMISSIONS.map((p) => p.key),
  PM: ["project.create", "project.archive", "urd.approve", "cr.approve", "uat.sign", "team.invite"],
  TechLead: ["code.deploy.staging", "code.deploy.prod", "cr.approve", "prototype.regenerate"],
  BA: ["urd.edit", "urd.approve", "prototype.regenerate"],
  SA: ["urd.edit", "urd.approve"],
  Dev: ["code.deploy.staging", "prototype.regenerate"],
  QA: ["test.sign"],
};
