/**
 * Origine canonique du site (www).
 * Apex sans www doit 301 vers cette origine (voir vercel.json).
 */
const SITE_ORIGIN = "https://www.studiopilatesnarbonne.com";
const SITE_HOST = "www.studiopilatesnarbonne.com";
const APEX_HOST = "studiopilatesnarbonne.com";

module.exports = {
  SITE_ORIGIN,
  SITE_HOST,
  APEX_HOST,
};
