import {themes as prismThemes} from 'prism-react-renderer';
import { createConfig } from './.shared-config/index.js';
import { providerName, providerTitle } from './provider.js';

const config = createConfig({
  providerName,
  providerTitle,
  prismThemes,
  overrides: {
    // Docusaurus Faster (rspack + swc, via @docusaurus/faster) - not
    // strictly required at this site's page count, but kept for build
    // speed and consistency with the other provider microsites.
    future: {
      v4: true,
      faster: true,
    },
  },
});

// Use the locally vendored registry-branded logos (STACKQL>> | REGISTRY,
// matching the awscc microsite) instead of the shared config's hotlinked
// main-site wordmark - self-contained assets, no cross-origin fetch.
// global.css swaps in the -mobile variants below 996px.
const registryLogo = {
  alt: 'StackQL',
  href: '/',
  src: 'img/stackql-registry-logo.svg',
  srcDark: 'img/stackql-registry-logo-white.svg',
};
config.themeConfig.navbar.logo = { ...registryLogo };
config.themeConfig.footer.logo = { ...registryLogo };

// Date-stamp every doc page ("Last updated on ..."). Timestamps come from
// git history, so the regenerated docs tree must be committed after each
// provider refresh for pages to carry the refresh date (the deploy workflow
// checks out with fetch-depth: 0 for this).
config.presets[0][1].docs.showLastUpdateTime = true;

config.projectName = 'stackql-provider-deno';

// URL form. Keep the Docusaurus default (pages emitted as <route>/index.html)
// regardless of the shared config's trailingSlash setting, so GitHub Pages
// serves both /services/x/y and /services/x/y/. A trailingSlash: false site
// emits <route>.html instead, which returns 404 for the trailing-slash URL.
delete config.trailingSlash;

export default config;
