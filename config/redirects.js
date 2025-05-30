/**
 * Centralized redirect configuration
 * Used by both production and development redirect systems
 */

const redirects = [
  {
    from: '/en/welkom',
    to: '/en/welcome',
  },
  // Add more redirects here as needed
  // {
  //   from: '/en/over-kroescontrol',
  //   to: '/en/about-kroescontrol',
  // },
];

module.exports = redirects;