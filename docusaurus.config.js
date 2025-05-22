require('dotenv').config();
// Boolean flags voor features
const ENABLE_CHAT_PAGE = process.env.ENABLE_CHAT_PAGE === 'true';
const PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true';
const ENABLE_EXTRA_META_TAGS = process.env.ENABLE_EXTRA_META_TAGS === 'true'; // Default uit tenzij expliciet aangezet
// Base URL voor GitHub Pages vs. normale omgeving
const BASE_URL = process.env.BASE_URL || '/';
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
  
  // Presets
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          include: ['**/*.md', '**/*.mdx'],
          exclude: [
            "_meta/", 
            '_meta/',
            ...(PUBLIC_ONLY ? [
              // In public-only modus, excluderen we specifieke mappen die we niet willen tonen
              'internal/**', 
              'operation/**',
              'finance/**',
              // Behoud public map, submappen en root index
              // LET OP: Geen wildcard exclusie zoals '**/*.md' want dat blokkeert alles!
            ] : [])
          ],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/kroescontrol/kroescontrol-docs/edit/main/',
        },
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
            label: 'Werkafspraken',
          },
          ...(ENABLE_CHAT_PAGE ? [
            {
              to: '/chat',
              label: 'AI Assistant Pagina',
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
