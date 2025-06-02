/**
 * Centralized redirect configuration
 * Used by both production and development redirect systems
 */

const redirects = [
  // Redirect old /welkom URL to new homepage
  {
    from: '/welkom',
    to: '/',
  },
  // English redirects commented out after disabling i18n
  // {
  //   from: '/en/welkom',
  //   to: '/en/welcome',
  // },
  // Add more redirects here as needed
  // {
  //   from: '/en/over-kroescontrol',
  //   to: '/en/about-kroescontrol',
  // },
];

module.exports = redirects;