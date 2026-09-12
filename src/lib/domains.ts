export type DomainId = 1 | 2 | 3 | 4 | 5;

export interface DomainMeta {
  id: DomainId;
  slug: string;
  labelBn: string;
  labelEn: string;
  weight: number;
  lessons: number;
  accent: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 1,
    slug: '1-agentic-architecture',
    labelBn: 'এজেন্টিক আর্কিটেকচার ও অর্কেস্ট্রেশন',
    labelEn: 'Agentic Architecture & Orchestration',
    weight: 27,
    lessons: 7,
    accent: '#3b82f6',
  },
  {
    id: 2,
    slug: '2-tool-design-mcp',
    labelBn: 'টুল ডিজাইন ও MCP ইন্টিগ্রেশন',
    labelEn: 'Tool Design & MCP Integration',
    weight: 18,
    lessons: 5,
    accent: '#14b8a6',
  },
  {
    id: 3,
    slug: '3-claude-code-config',
    labelBn: 'Claude Code কনফিগারেশন ও ওয়ার্কফ্লো',
    labelEn: 'Claude Code Configuration & Workflows',
    weight: 20,
    lessons: 6,
    accent: '#f59e0b',
  },
  {
    id: 4,
    slug: '4-prompt-engineering',
    labelBn: 'প্রম্পট ইঞ্জিনিয়ারিং ও স্ট্রাকচার্ড আউটপুট',
    labelEn: 'Prompt Engineering & Structured Output',
    weight: 20,
    lessons: 6,
    accent: '#8b5cf6',
  },
  {
    id: 5,
    slug: '5-context-management',
    labelBn: 'কনটেক্সট ম্যানেজমেন্ট ও রিলায়েবিলিটি',
    labelEn: 'Context Management & Reliability',
    weight: 15,
    lessons: 6,
    accent: '#f43f5e',
  },
];

export const TOTAL_LESSONS = DOMAINS.reduce((sum, domain) => sum + domain.lessons, 0);
export const SOURCE_SITE = 'https://claudecertificationguide.com';
