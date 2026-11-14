// The mind map: topics around "Samiul", each with items that open a card.
// Every `card` id must exist in cards.json (a unit test checks this).

export interface GraphItem {
  label: string; // short, shown on the graph; use \n to break lines
  card?: string; // a leaf opens this card
  children?: GraphItem[]; // a group opens its own view instead
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
      {
        label: 'Orbitax',
        children: [
          { card: 'orbitax-company', label: 'About Orbitax' },
          { card: 'about-role', label: 'My role' },
          { card: 'work-event-driven', label: 'Event-driven services' },
          { card: 'work-race-condition', label: 'Race condition fix' },
          { card: 'work-async-70', label: '70% faster workflow' },
          { card: 'work-import-pipeline', label: 'Data import pipeline' },
          { card: 'work-spreadsheet-import', label: 'Spreadsheet import' },
          { card: 'work-file-publishing', label: 'File publishing' },
          { card: 'work-form-generation', label: '60% faster forms' },
          { card: 'work-testing', label: 'Testing' },
          { card: 'work-access-control', label: 'Access control' },
          { card: 'work-template-redesign', label: 'Template redesign' },
          { card: 'work-stack', label: 'Work stack' },
        ],
      },
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
    items: [
      {
        label: 'BRAC University',
        children: [
          { card: 'education', label: 'BSc in Computer Science' },
          { card: 'research-paper', label: 'Thesis' },
        ],
      },
    ],
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
      {
        label: 'Online judges',
        children: [
          { card: 'cp-codeforces', label: 'Codeforces' },
          { card: 'cp-codechef', label: 'CodeChef' },
          { card: 'cp-atcoder', label: 'AtCoder' },
        ],
      },
      {
        label: 'ICPC',
        children: [
          { card: 'cp-icpc-asia-west', label: 'Asia West Final 2023' },
          { card: 'cp-icpc-dhaka', label: 'Dhaka Regional 2023' },
        ],
      },
      {
        label: 'University contests',
        children: [
          { card: 'cp-iut', label: 'IUT IUPC 2024' },
          { card: 'cp-cuet', label: 'CUET IUPC 2024' },
          { card: 'cp-buet', label: 'BUET IUPC 2023' },
          { card: 'cp-bracu', label: 'BRACU CS Spectrum 2023' },
        ],
      },
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
