import { DOMAINS, SOURCE_SITE, type DomainId } from './domains';

export interface LessonMeta {
  id: string;
  domain: DomainId;
  slug: string;
  titleEn: string;
  titleBn: string;
}

export const LESSONS: LessonMeta[] = [
  { id: '1-1', domain: 1, slug: '1-1-agentic-loops', titleEn: 'Agentic Loops', titleBn: 'এজেন্টিক লুপ' },
  { id: '1-2', domain: 1, slug: '1-2-orchestration-patterns', titleEn: 'Multi-Agent Orchestration', titleBn: 'মাল্টি-এজেন্ট অর্কেস্ট্রেশন' },
  { id: '1-3', domain: 1, slug: '1-3-subagent-invocation-context', titleEn: 'Subagent Invocation and Context Passing', titleBn: 'সাবএজেন্ট ইনভোকেশন ও কনটেক্সট পাসিং' },
  { id: '1-4', domain: 1, slug: '1-4-workflow-enforcement-handoff', titleEn: 'Workflow Enforcement and Handoff', titleBn: 'ওয়ার্কফ্লো এনফোর্সমেন্ট ও হ্যান্ডঅফ' },
  { id: '1-5', domain: 1, slug: '1-5-agent-sdk-hooks', titleEn: 'Agent SDK Hooks', titleBn: 'Agent SDK হুক' },
  { id: '1-6', domain: 1, slug: '1-6-task-decomposition', titleEn: 'Task Decomposition Strategies', titleBn: 'টাস্ক ডিকম্পোজিশন স্ট্র্যাটেজি' },
  { id: '1-7', domain: 1, slug: '1-7-session-state-resumption', titleEn: 'Session State and Resumption', titleBn: 'সেশন স্টেট ও রিজাম্পশন' },

  { id: '2-1', domain: 2, slug: '2-1-tool-schema-design', titleEn: 'Tool Interface Design', titleBn: 'টুল ইন্টারফেস ডিজাইন' },
  { id: '2-2', domain: 2, slug: '2-2-structured-error-responses', titleEn: 'Structured Error Responses', titleBn: 'স্ট্রাকচার্ড এরর রেসপন্স' },
  { id: '2-3', domain: 2, slug: '2-3-tool-distribution-choice', titleEn: 'Tool Distribution & Tool Choice', titleBn: 'টুল ডিস্ট্রিবিউশন ও tool_choice' },
  { id: '2-4', domain: 2, slug: '2-4-mcp-server-integration', titleEn: 'MCP Server Integration', titleBn: 'MCP সার্ভার ইন্টিগ্রেশন' },
  { id: '2-5', domain: 2, slug: '2-5-built-in-tools', titleEn: 'Built-in Tools', titleBn: 'বিল্ট-ইন টুল' },

  { id: '3-1', domain: 3, slug: '3-1-claude-md-hierarchy', titleEn: 'CLAUDE.md Hierarchy, Scoping, and Modular Organisation', titleBn: 'CLAUDE.md হায়ারার্কি, স্কোপিং ও মডুলার অর্গানাইজেশন' },
  { id: '3-2', domain: 3, slug: '3-2-slash-commands-skills', titleEn: 'Custom Slash Commands and Skills', titleBn: 'কাস্টম স্ল্যাশ কমান্ড ও Skills' },
  { id: '3-3', domain: 3, slug: '3-3-path-specific-rules', titleEn: 'Path-Specific Rules for Conditional Convention Loading', titleBn: 'পাথ-স্পেসিফিক রুল' },
  { id: '3-4', domain: 3, slug: '3-4-plan-mode-execution', titleEn: 'Plan Mode vs Direct Execution', titleBn: 'প্ল্যান মোড বনাম সরাসরি এক্সিকিউশন' },
  { id: '3-5', domain: 3, slug: '3-5-iterative-refinement', titleEn: 'Iterative Refinement Techniques', titleBn: 'ইটারেটিভ রিফাইনমেন্ট' },
  { id: '3-6', domain: 3, slug: '3-6-cicd-integration', titleEn: 'CI/CD Integration', titleBn: 'CI/CD ইন্টিগ্রেশন' },

  { id: '4-1', domain: 4, slug: '4-1-system-prompts', titleEn: 'System Prompts with Explicit Criteria', titleBn: 'স্পষ্ট ক্রাইটেরিয়াসহ সিস্টেম প্রম্পট' },
  { id: '4-2', domain: 4, slug: '4-2-few-shot-prompting', titleEn: 'Few-Shot Prompting', titleBn: 'ফিউ-শট প্রম্পটিং' },
  { id: '4-3', domain: 4, slug: '4-3-structured-output', titleEn: 'Structured Output with Tool Use', titleBn: 'টুল ইউজ দিয়ে স্ট্রাকচার্ড আউটপুট' },
  { id: '4-4', domain: 4, slug: '4-4-validation-retry-loops', titleEn: 'Validation, Retry, and Feedback Loops', titleBn: 'ভ্যালিডেশন, রিট্রাই ও ফিডব্যাক লুপ' },
  { id: '4-5', domain: 4, slug: '4-5-batch-processing', titleEn: 'Batch Processing Strategies', titleBn: 'ব্যাচ প্রসেসিং স্ট্র্যাটেজি' },
  { id: '4-6', domain: 4, slug: '4-6-multi-pass-review', titleEn: 'Multi-Instance and Multi-Pass Review', titleBn: 'মাল্টি-ইনস্ট্যান্স ও মাল্টি-পাস রিভিউ' },

  { id: '5-1', domain: 5, slug: '5-1-context-window-management', titleEn: 'Context Window Management', titleBn: 'কনটেক্সট উইন্ডো ম্যানেজমেন্ট' },
  { id: '5-2', domain: 5, slug: '5-2-escalation-ambiguity', titleEn: 'Escalation & Ambiguity Resolution', titleBn: 'এসকেলেশন ও অ্যাম্বিগুইটি রেজল্যুশন' },
  { id: '5-3', domain: 5, slug: '5-3-error-propagation', titleEn: 'Error Propagation in Multi-Agent Systems', titleBn: 'মাল্টি-এজেন্ট সিস্টেমে এরর প্রোপাগেশন' },
  { id: '5-4', domain: 5, slug: '5-4-codebase-exploration', titleEn: 'Codebase Exploration & Context Degradation', titleBn: 'কোডবেস এক্সপ্লোরেশন ও কনটেক্সট ডিগ্রেডেশন' },
  { id: '5-5', domain: 5, slug: '5-5-human-review-calibration', titleEn: 'Human Review & Confidence Calibration', titleBn: 'হিউম্যান রিভিউ ও কনফিডেন্স ক্যালিব্রেশন' },
  { id: '5-6', domain: 5, slug: '5-6-information-provenance', titleEn: 'Information Provenance & Multi-Source Synthesis', titleBn: 'ইনফরমেশন প্রোভেন্যান্স ও মাল্টি-সোর্স সিন্থেসিস' },
];

export function domainLessons(domain: DomainId): LessonMeta[] {
  return LESSONS.filter((lesson) => lesson.domain === domain);
}

export function lessonPath(lesson: LessonMeta): string {
  const domain = DOMAINS.find((item) => item.id === lesson.domain);
  return `learn/${domain?.slug}/${lesson.slug}`;
}

export function lessonSourceUrl(lesson: LessonMeta): string {
  return `${SOURCE_SITE}/${lessonPath(lesson)}`;
}
