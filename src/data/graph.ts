// The mind map: topics around "Samiul", each with items that open a card.
// Every `card` id must exist in cards.json (a unit test checks this).

export interface GraphItem {
  card: string;
  label: string; // short, shown on the graph; use \n to break lines
  inProgress?: boolean;
}

export interface GraphTopic {
  id: string;
  label: string;
  items: GraphItem[];
}

export const ROOT_CARD = 'about-intro';

export const TOPICS: GraphTopic[] = [
  {
    id: 'experience',
    label: 'Experience',
    items: [
      { card: 'orbitax-company', label: 'Orbitax' },
      { card: 'work-event-driven', label: 'Event-driven\nservices' },
      { card: 'work-race-condition', label: 'Race\ncondition fix' },
      { card: 'work-async-70', label: '70% faster\nworkflow' },
      { card: 'work-import-pipeline', label: 'Data import\npipeline' },
      { card: 'work-spreadsheet-import', label: 'Spreadsheet\nimport' },
      { card: 'work-file-publishing', label: 'File\npublishing' },
      { card: 'work-form-generation', label: '60% faster\nforms' },
      { card: 'work-testing', label: 'Testing' },
      { card: 'work-access-control', label: 'Access\ncontrol' },
      { card: 'work-template-redesign', label: 'Template\nredesign' },
      { card: 'work-stack', label: 'Work\nstack' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    items: [
      { card: 'project-ecommerce', label: 'E-commerce\nAPI' },
      { card: 'project-student-ms', label: 'Student\nManagement' },
      { card: 'project-codelens', label: 'CodeLens', inProgress: true },
      { card: 'project-chatbotbackend', label: 'Chatbot\nBackend', inProgress: true },
      { card: 'project-fraction', label: 'Fraction\nconverter', inProgress: true },
      { card: 'project-portfolio', label: 'This site', inProgress: true },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    items: [
      { card: 'skills-backend', label: 'Backend' },
      { card: 'skills-messaging', label: 'Messaging' },
      { card: 'skills-data', label: 'Databases' },
      { card: 'skills-ai', label: 'AI / LLM' },
      { card: 'skills-frontend', label: 'Frontend\n& tools' },
      { card: 'skills-learning', label: 'Learning\nnow' },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    items: [{ card: 'education', label: 'BSc CS\nBRAC Univ.' }],
  },
  {
    id: 'research',
    label: 'Research',
    items: [{ card: 'research-paper', label: 'IEEE\nICICT 2024' }],
  },
  {
    id: 'cp',
    label: 'Coding\ncontests',
    items: [
      { card: 'cp-overview', label: 'Codeforces\nExpert' },
      { card: 'cp-icpc', label: 'ICPC' },
      { card: 'cp-other', label: 'Other\ncontests' },
    ],
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    items: [
      { card: 'hobby-japanese', label: 'Japanese' },
      { card: 'hobby-tools', label: 'Building\ntools' },
      { card: 'hobby-selfstudy', label: 'LLM & RAG\nself-study' },
    ],
  },
];

export const SUGGESTED_QUESTIONS = [
  'What do you work on?',
  'Hardest bug you fixed?',
  'What projects have you built?',
  'Codeforces rating?',
  'How does this chatbot work?',
  'How can I contact you?',
];
