import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Simpele categoriegegevens
const categories = [
  {
    title: 'Welkom bij Kroescontrol',
    description: 'Leer meer over onze werkprocessen, onboarding en bedrijfscultuur.',
    link: '/welkom'
  },
  {
    title: 'Werken bij Kroescontrol',
    description: 'Ontdek alles over de Kroescontrol werkwijze, bedrijfscultuur en voordelen.',
    link: '/werken-bij'
  },
  {
    title: 'Kroescontrol Engineer',
    description: 'Ontdek wat het betekent om als engineer bij Kroescontrol te werken.',
    link: '/kroescontrol-engineer'
  },
  {
    title: 'Freelancecontrol Model',
    description: 'Informatie over Freelancecontrol, wallet structuur en doelgroep.',
    link: '/freelancecontrol'
  },
  {
    title: 'Arbeidsvoorwaarden',
    description: 'Informatie over onze primaire arbeidsvoorwaarden, contracten en vergoedingen.',
    link: '/werken-bij/voordelen'
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
              to="/public/tools/documentatie">
              Documentatie bij Kroescontrol
            </Link>
            <p className="margin-top--sm text--center">
              Documentatieoverzicht van Kroescontrol
            </p>
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
