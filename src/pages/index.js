import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Simpele categoriegegevens
const categories = [
  {
    title: 'Algemene Informatie',
    description: 'Leer meer over onze werkprocessen, onboarding en bedrijfscultuur.',
    link: '/public/algemeen/introductie'
  },
  {
    title: 'Werken bij Kroescontrol',
    description: 'Ontdek alles over de Kroescontrol werkwijze, bedrijfscultuur en voordelen.',
    link: '/public/werken-bij'
  },
  {
    title: 'Kennismaking',
    description: 'Informatie over onze budgetten, Engineer Hub en projecten.',
    link: '/public/kennismaking'
  },
  {
    title: 'Freelancecontrol Model',
    description: 'Informatie over Freelancecontrol, wallet structuur en doelgroep.',
    link: '/public/freelancecontrol'
  },
  {
    title: 'Arbeidsvoorwaarden',
    description: 'Informatie over onze primaire arbeidsvoorwaarden, contracten en vergoedingen.',
    link: '/public/werken-bij/voordelen'
  },
  {
    title: 'AI Chat',
    description: 'Praat met onze AI assistent voor directe hulp en informatie.',
    link: '/chat'
  }
];

// Eenvoudige functionele home pagina
export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Documentatie voor Kroescontrol werkafspraken">

      {/* Hero section */}
      <div className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className="padding-vert--md">
            <Link
              className="button button--lg button--secondary"
              to="/public/">
              Bekijk documentatie
            </Link>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="container padding-vert--xl">
        <h2 className="text--center margin-bottom--lg">Documentatie Categorieën</h2>
        <div className="row">
          {categories.map((category, idx) => (
            <div key={idx} className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <h3>{category.title}</h3>
                </div>
                <div className="card__body">
                  <p>{category.description}</p>
                </div>
                <div className="card__footer">
                  <Link
                    className="button button--primary button--block"
                    to={category.link}>
                    Naar {category.title}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
