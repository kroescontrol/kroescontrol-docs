require('dotenv').config();
const { detectEncryptedDirectories, isEncrypted } = require('./src/utils/encryption-utils');
const { getBuildConfig, shouldIncludeDirectory, generateExcludePatterns, debugBuildConfig } = require('./src/utils/build-exclusion-utils');

// Boolean flags voor features
const ENABLE_CHAT_PAGE = process.env.ENABLE_CHAT_PAGE === 'true';
const PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true';
const ENABLE_EXTRA_META_TAGS = process.env.ENABLE_EXTRA_META_TAGS === 'true'; // Default uit tenzij expliciet aangezet

// Build configuration
const buildConfig = getBuildConfig();
debugBuildConfig();

// Base URL voor GitHub Pages vs. normale omgeving
const BASE_URL = process.env.BASE_URL || '/';

// Environment-specific routing
console.log(`KROESCONTROL_LOCAL_DEV: ${process.env.KROESCONTROL_LOCAL_DEV || 'undefined'}`);
console.log(`Build environment: ${process.env.VERCEL ? 'VERCEL' : 'LOCAL'}`);
console.log(`Using direct route paths - post-build will secure production`);

// Check access to different documentation modules
function hasAccess(modulePath) {
  try {
    // Check build type inclusion
    if (!shouldIncludeDirectory(modulePath)) {
      return false;
    }
    
    // Check git-crypt encryption (fallback to old behavior)
    const categoryPath = `./${modulePath}/_category_.json`;
    return !isEncrypted(categoryPath);
  } catch (e) {
    return false;
  }
}

// Determine which modules should be included based on build config and encryption
const HAS_INTERNAL = !PUBLIC_ONLY && hasAccess('docs-internal');
const HAS_FINANCE = !PUBLIC_ONLY && hasAccess('docs-finance'); 
const HAS_OPERATION = !PUBLIC_ONLY && hasAccess('docs-operation');

console.log(`Access - Internal: ${HAS_INTERNAL ? 'YES' : 'NO'}, Finance: ${HAS_FINANCE ? 'YES' : 'NO'}, Operation: ${HAS_OPERATION ? 'YES' : 'NO'}`);
console.log(`Chat page plugin: ${ENABLE_CHAT_PAGE ? 'ENABLED' : 'DISABLED'}`);
console.log(`Public-only mode: ${PUBLIC_ONLY ? 'ENABLED' : 'DISABLED'}`);
console.log(`Extra meta tags: ${ENABLE_EXTRA_META_TAGS ? 'ENABLED' : 'DISABLED'}`);
console.log(`Base URL: ${BASE_URL}`);
const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Kroescontrol Werkafspraken',
  tagline: 'Interne werkprocessen en procedures',
  url: 'https://docs.kroescontrol.nl',
  baseUrl: BASE_URL,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'kroescontrol',
  projectName: 'werkafspraken',
  customFields: {
    enableExtraMetaTags: ENABLE_EXTRA_META_TAGS,
  },
  // Plugins
  plugins: [
    // LinkedIn meta tags plugin
    [
      require.resolve('./src/plugins/docusaurus-linkedin-tags'),
      {
        defaultImage: '/img/logo.svg',
      },
    ],
    // Chat page plugin
    ...(ENABLE_CHAT_PAGE ? [
      [
        "docusaurus-plugin-chat-page",
        {
          path: "chat",
          openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: "gpt-4-turbo",
          },
          pageTitle: "Kroescontrol Assistant",
          pageName: "Vraag het de Kroescontrol Assistant",
          description: "Stel een vraag over de werkafspraken bij Kroescontrol",
          prompt: "Je bent een behulpzame assistent voor Kroescontrol documentatie. Gebruik de gegeven context om vragen over werkafspraken, budgetten en processen te beantwoorden. Onderscheid duidelijk tussen Kroescontrol en Freelancecontrol wanneer van toepassing. Als je het antwoord niet weet of het niet in de documentatie staat, geef dit eerlijk aan en suggereer waar de gebruiker mogelijk meer informatie kan vinden.",
          embeddings: {
            chunking: {
              maxChunkLength: 1500,
              chunkOverlap: 100,
            },
          },
        },
      ]
    ] : []),
    // Redirect plugin
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Since the root URL is already occupied, we'll set up other redirects if needed
        redirects: [
          // Example: redirect from old paths to new paths if needed in the future
          // {
          //   from: '/old-path',
          //   to: '/new-path',
          // },
        ],
      },
    ],
  ],
  
  // Google Fonts toevoegen voor Poppins en Noto Sans
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap',
      type: 'text/css',
    },
  ],
  
  // Plugins
  plugins: [
    // LinkedIn meta tags plugin
    [
      require.resolve('./src/plugins/docusaurus-linkedin-tags'),
      {
        defaultImage: '/img/logo.svg',
      },
    ],
    // Chat page plugin
    ...(ENABLE_CHAT_PAGE ? [
      [
        "docusaurus-plugin-chat-page",
        {
          path: "chat",
          openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: "gpt-4-turbo",
          },
          pageTitle: "Kroescontrol Assistant",
          pageName: "Vraag het de Kroescontrol Assistant",
          description: "Stel een vraag over de werkafspraken bij Kroescontrol",
          prompt: "Je bent een behulpzame assistent voor Kroescontrol documentatie. Gebruik de gegeven context om vragen over werkafspraken, budgetten en processen te beantwoorden. Onderscheid duidelijk tussen Kroescontrol en Freelancecontrol wanneer van toepassing. Als je het antwoord niet weet of het niet in de documentatie staat, geef dit eerlijk aan en suggereer waar de gebruiker mogelijk meer informatie kan vinden.",
          embeddings: {
            chunking: {
              maxChunkLength: 1500,
              chunkOverlap: 100,
            },
          },
        },
      ]
    ] : []),
    // Redirect plugin
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Since the root URL is already occupied, we'll set up other redirects if needed
        redirects: [
          // Example: redirect from old paths to new paths if needed in the future
          // {
          //   from: '/old-path',
          //   to: '/new-path',
          // },
        ],
      },
    ],
    // Public docs plugin - route depends on mode
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'public',
        path: 'docs-public',
        routeBasePath: '/',
        include: ['**/*.md', '**/*.mdx'],
        exclude: generateExcludePatterns(),
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
      },
    ],
    ...(HAS_INTERNAL ? [[
      '@docusaurus/plugin-content-docs',
      {
        id: 'internal',
        path: 'docs-internal',
        routeBasePath: '/internal',
        include: ['**/*.md', '**/*.mdx'],
        exclude: generateExcludePatterns(),
        // Auto-generate sidebar based on file structure
        editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
      },
    ]] : []),
    ...(HAS_FINANCE ? [[
      '@docusaurus/plugin-content-docs',
      {
        id: 'finance',
        path: 'docs-finance',
        routeBasePath: '/finance',
        include: ['**/*.md', '**/*.mdx'],
        exclude: generateExcludePatterns(),
        // Auto-generate sidebar based on file structure
        editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
      },
    ]] : []),
    ...(HAS_OPERATION ? [[
      '@docusaurus/plugin-content-docs',
      {
        id: 'operation',
        path: 'docs-operation',
        routeBasePath: '/operation',
        include: ['**/*.md', '**/*.mdx'],
        exclude: generateExcludePatterns(),
        // Auto-generate sidebar based on file structure
        editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
      },
    ]] : []),
    // TEST AUTH plugin
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'test-auth',
        path: 'docs-test-auth',
        routeBasePath: '/test-auth',
        include: ['**/*.md', '**/*.mdx'],
        editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
      },
    ],
  ],
  
  // Presets
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false, // Disable default docs, we use custom plugins above
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Extra meta tags voor sociale media
      metadata: [
        {name: 'author', content: 'Kroescontrol B.V.'},
        {name: 'image', property: 'og:image', content: '/img/logo.svg'},
      ],
      // Kleuren configuratie volgens Kroescontrol huisstijl
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      navbar: {
        title: 'Kroescontrol Docs',
        logo: {
          alt: 'Kroescontrol Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/home',
            position: 'left',
            label: PUBLIC_ONLY ? 'Welkom' : 'Public',
          },
          ...(HAS_INTERNAL ? [{
            to: '/internal',
            position: 'left',
            label: 'Internal',
          }] : []),
          ...(HAS_OPERATION ? [{
            to: '/operation',
            position: 'left',
            label: 'Operations',
          }] : []),
          ...(HAS_FINANCE ? [{
            to: '/finance',
            position: 'left',
            label: 'Finance',
          }] : []),
          // TEST AUTH navigation item
          {
            to: '/test-auth',
            position: 'left',
            label: 'Test Auth',
          },
          ...(ENABLE_CHAT_PAGE ? [
            {
              to: '/chat',
              label: 'AI Assistant',
              position: 'right',
            }
          ] : []),
          {
            href: 'https://github.com/kroescontrol/kroescontrol-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentatie',
            items: [
              {
                label: 'Werkafspraken',
                to: '/home',
              },
            ],
          },
          {
            title: 'Kroescontrol',
            items: [
              {
                label: 'Website',
                href: 'https://kroescontrol.nl',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Kroescontrol. Alle rechten voorbehouden.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};
