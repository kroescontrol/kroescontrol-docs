import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import DevDocStatusBadge from '@site/src/components/DevDocStatusBadge';
import DevDocStatusToggle from '@site/src/components/DevDocStatusToggle';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <DevDocStatusBadge />
      <DevDocStatusToggle />
    </>
  );
}
