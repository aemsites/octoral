// add delayed functionality here
import { loadScript } from './aem.js';

async function loadConsentManager() {
  await loadScript('https://nexus.ensighten.com/sherwin/p-octoral_gdpr/Bootstrap.js');
}

await loadConsentManager();
