export interface ClientContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  primary: boolean;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  taxId: string;
  industry: string;
  address: string;
  website: string;
  initials: string;
  color: string;
  projects: number;
  contacts: ClientContact[];
  portal: {
    enabled: boolean;
    inviteLink?: string;
  };
  since: string;
}

export const CLIENTS: Client[] = [
  {
    id: "megamart",
    name: "Mega Mart Retail",
    code: "MEGAMART",
    taxId: "0301-xxx",
    industry: "Retail — Supermarket chain",
    address: "Tòa nhà Mega Mart HQ, Nguyễn Văn Linh, HCM",
    website: "https://megamart.vn",
    initials: "MM",
    color: "var(--teal-500)",
    projects: 2,
    since: "12/02/2025",
    portal: { enabled: true, inviteLink: "https://portal.reborn.vn/mm-xk9r" },
    contacts: [
      {
        id: "1",
        name: "A. Minh",
        title: "Marketing Director",
        email: "minh.a@megamart.vn",
        phone: "0912 345 678",
        primary: true,
      },
      {
        id: "2",
        name: "C. Lan",
        title: "IT Manager",
        email: "lan.c@megamart.vn",
        phone: "0934 567 890",
        primary: false,
      },
    ],
  },
  {
    id: "tpbank",
    name: "TPBank",
    code: "TPB",
    taxId: "0305-xxx",
    industry: "Banking — Retail",
    address: "Hội sở TPBank, Hà Nội",
    website: "https://tpb.vn",
    initials: "TP",
    color: "var(--amber-500)",
    projects: 1,
    since: "03/03/2026",
    portal: { enabled: false },
    contacts: [
      {
        id: "1",
        name: "Chị Thu",
        title: "PM — Digital Banking",
        email: "thu.tran@tpb.vn",
        phone: "0988 123 456",
        primary: true,
      },
    ],
  },
  {
    id: "msb",
    name: "MSB",
    code: "MSB",
    taxId: "0304-xxx",
    industry: "Banking — FX/Treasury",
    address: "MSB Tower, Hà Nội",
    website: "https://msb.com.vn",
    initials: "MS",
    color: "var(--blue-500)",
    projects: 1,
    since: "18/01/2026",
    portal: { enabled: true, inviteLink: "https://portal.reborn.vn/msb-a2d1" },
    contacts: [
      {
        id: "1",
        name: "A. Nam",
        title: "Head of FX Dealing",
        email: "nam.le@msb.com.vn",
        phone: "0901 234 567",
        primary: true,
      },
    ],
  },
  {
    id: "rox",
    name: "Rox Key Holdings",
    code: "ROXKEY",
    taxId: "0306-xxx",
    industry: "Holding — Finance",
    address: "Rox Tower, Hà Nội",
    website: "https://roxkey.vn",
    initials: "RK",
    color: "var(--violet-500)",
    projects: 1,
    since: "22/11/2025",
    portal: { enabled: false },
    contacts: [
      {
        id: "1",
        name: "C. Mai",
        title: "Chief Product Officer",
        email: "mai.nguyen@roxkey.vn",
        phone: "0977 456 123",
        primary: true,
      },
    ],
  },
];

export function findClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}
