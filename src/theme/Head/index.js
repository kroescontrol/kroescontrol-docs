/**
 * Custom implementation of Docusaurus Head component to add name="image" meta tag
 */
import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function HeadCustom(props) {
  const {
    children,
    ...customProps
  } = props;
  
  const {siteConfig} = useDocusaurusContext();
  const enableExtraMetaTags = siteConfig.customFields?.enableExtraMetaTags ?? false;
  
  // Extract image URL from OG image if present
  const ogImageMeta = React.Children.toArray(children).find(
    child => child?.props?.property === 'og:image'
  );
  
  // Add extra meta tags
  const extraTags = [];
  
  // Add name="image" tag if enabled and we have og:image
  if (enableExtraMetaTags) {
    if (ogImageMeta) {
      extraTags.push(
        <meta key="image" name="image" content={ogImageMeta.props.content} />
      );
    } else {
      // Fallback to default logo if no og:image is specified
      extraTags.push(
        <meta key="image" name="image" content="/img/logo.svg" />
      );
    }
  }
  
  return (
    <Head {...customProps}>
      {children}
      {extraTags}
    </Head>
  );
}