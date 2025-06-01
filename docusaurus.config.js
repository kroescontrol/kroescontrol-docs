require('dotenv').config();
const path = require('path');
const { execSync } = require('child_process');
const { detectEncryptedDirectories, isEncrypted } = require('./src/utils/encryption-utils');
const { getBuildConfig, shouldIncludeDirectory, generateExcludePatterns, debugBuildConfig } = require('./src/utils/build-exclusion-utils');

// Build informatie voor footer
function getBuildInfo() {
  try {
    // Probeer eerst Vercel environment variables
    if (process.env.VERCEL) {
      const branchName = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
      const commitHash = process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) : 'unknown';
      const buildDate = new Date().toISOString();
      
      return {
        branch: branchName,
        commit: commitHash,
        date: buildDate,
        environment: 'VERCEL'
      };
    }
    
    // Fall back naar git commands voor andere omgevingen
    const branchName = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const buildDate = new Date().toISOString();
    const buildEnv = process.env.GITHUB_ACTIONS ? 'GITHUB' : 'LOCAL';
    
    return {
      branch: branchName,
      commit: commitHash,
      date: buildDate,
      environment: buildEnv
    };
  } catch (error) {
    console.warn('Could not get build info:', error.message);
    return {
      branch: 'unknown',
      commit: 'unknown',
      date: new Date().toISOString(),
      environment: 'unknown'
    };
  }
}

const buildInfo = getBuildInfo();
console.log(`🏗️  Build Info: ${buildInfo.branch}@${buildInfo.commit} (${buildInfo.environment}) - ${buildInfo.date}`);

// Boolean flags voor features
const ENABLE_CHAT_PAGE = process.env.ENABLE_CHAT_PAGE === 'true';
const PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true';
const ENABLE_EXTRA_META_TAGS = process.env.ENABLE_EXTRA_META_TAGS === 'true'; // Default uit tenzij expliciet aangezet

// Build configuration
const buildConfig = getBuildConfig();
debugBuildConfig();

// Base URL voor GitHub Pages vs. normale omgeving
const BASE_URL = process.env.BASE_URL || '/';

// i18n configuration - DISABLED temporarily
const locales = ['nl']; // Only Dutch for now

console.log(`i18n configuration - DISABLED`);
console.log(`Available locales: ${locales.join(', ')}`);

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
const redirects = require('./config/redirects');

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
  // i18n configuratie - DISABLED temporarily
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl'],
    localeConfigs: {
      nl: {
        label: 'Nederlands',
        direction: 'ltr',
        htmlLang: 'nl-NL',
        calendar: 'gregory',
      }
    }
  },
  // Google Fonts toevoegen voor Poppins en Noto Sans
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap',
      type: 'text/css',
    },
  ],
  
  // Plugins
  plugins: [
    // Development redirects plugin
    require.resolve('./src/plugins/dev-redirects'),
    // Build info injection plugin
    [
      require.resolve('./src/plugins/inject-build-info'),
      {
        buildInfo: buildInfo,
      },
    ],
    // LinkedIn meta tags plugin
    [
      require.resolve('./src/plugins/docusaurus-linkedin-tags'),
      {
        defaultImage: '/img/logo.svg',
      },
    ],
    // FrontMatter provider plugin (for development UX components)
    require.resolve('./src/plugins/frontmatter-provider'),
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
        redirects: redirects,
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
    // docStatus filter plugin
    [
      path.resolve(__dirname, 'src/plugins/filter-docs-by-status'),
      {
        excludeStatuses: process.env.NODE_ENV === 'production' ? ['templated', 'generated'] : [],
        hideFromSidebar: process.env.NODE_ENV === 'production' ? ['completed'] : [],
        excludeFromSidebar: ['PROMPT.md'], // Exclude PROMPT.md files from sidebar entirely
        enableVisualIndicators: process.env.NODE_ENV === 'development',
        statusLabels: {
          templated: 'Template',
          generated: 'Gegenereerd',
          completed: 'Voltooid',
          live: 'Live',
          locked: 'Vergrendeld',
        },
      },
    ],
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
            type: 'doc',
            docId: 'index',
            docsPluginId: 'public',
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
          // Language switcher - DISABLED
          // ...(showEnglish ? [{
          //   type: 'localeDropdown',
          //   position: 'right',
          // }] : []),
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
                to: '/welkom',
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
        copyright: `Copyright © ${new Date().getFullYear()} Kroescontrol. Alle rechten voorbehouden.<br/><small>Build: ${buildInfo.branch}@${buildInfo.commit} (${buildInfo.environment}) - ${new Date(buildInfo.date).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</small>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};
