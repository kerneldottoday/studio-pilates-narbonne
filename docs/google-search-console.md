# Google Search Console — Studio Pilates Narbonne

Guide de référence pour indexer le site sur Google et faire apparaître la description dans les résultats de recherche.

**Site :** https://studiopilatesnarbonne.com  
**Sitemap :** https://studiopilatesnarbonne.com/sitemap.xml  
**Dernière mise à jour :** 15 juin 2026

---

## Contexte

Google affichait encore l’ancienne version (Canva) avec le titre « Studio Pilates » sans description.  
Le site actuel (Webflow/Vercel) contient déjà :

- Meta description optimisée sur l’accueil
- Title : `Studio Pilates Narbonne | Reformer, Mat & Yoga`
- Canonical, robots.txt, sitemap.xml
- JSON-LD LocalBusiness + HealthClub sur la homepage

Search Console est nécessaire pour **accélérer la réindexation** par Google.

---

## 1. Créer / ouvrir Search Console

1. Aller sur https://search.google.com/search-console
2. Se connecter avec le compte Google à utiliser pour le studio

---

## 2. Ajouter le site

1. Cliquer **« Ajouter une propriété »**
2. Choisir **« Préfixe d’URL »** (plus simple que « Domaine »)
3. Entrer : `https://studiopilatesnarbonne.com`
4. Cliquer **Continuer**

---

## 3. Vérifier que le site vous appartient

### Option A — Balise HTML (recommandée)

1. Google affiche une balise du type :
   ```html
   <meta name="google-site-verification" content="XXXXXXXX" />
   ```
2. Copier le code `content="..."` et l’ajouter dans le `<head>` du site (script `patch-homepage-seo.js` ou patch dédié sur toutes les pages)
3. Déployer sur Vercel (push GitHub)
4. Cliquer **Vérifier** dans Search Console

### Option B — Enregistrement DNS

1. Choisir **« Enregistrement TXT »** dans Search Console
2. Ajouter l’enregistrement TXT chez le registrar du domaine (OVH, Gandi, etc.)
3. Attendre 5 à 30 minutes
4. Cliquer **Vérifier**

---

## 4. Soumettre le sitemap

Une fois la propriété vérifiée :

1. Menu gauche → **Sitemaps**
2. Dans « Ajouter un sitemap », entrer uniquement :
   ```
   sitemap.xml
   ```
3. Cliquer **Envoyer**

Statut attendu : **Réussite** (parfois après quelques heures).

---

## 5. Demander l’indexation de la page d’accueil

1. Menu gauche → **Inspection de l’URL** (barre en haut)
2. Coller : `https://studiopilatesnarbonne.com/`
3. Attendre l’analyse
4. Vérifier que le title contient `Reformer, Mat & Yoga`
5. Cliquer **« Demander une indexation »**

Pages optionnelles à indexer ensuite :

- https://studiopilatesnarbonne.com/classes
- https://studiopilatesnarbonne.com/contact
- https://studiopilatesnarbonne.com/planning

---

## 6. Suivre l’évolution

| Section Search Console | Utilité |
|------------------------|---------|
| Performances | Impressions, clics, requêtes |
| Pages | Pages indexées / exclues |
| Inspection d’URL | Ce que Google voit sur une URL |

**Délai habituel :** 1 à 2 semaines après la demande d’indexation pour voir la nouvelle description dans Google.

**Vérification manuelle :** rechercher sur Google :
```
site:studiopilatesnarbonne.com
```

---

## Checklist

- [ ] Propriété `https://studiopilatesnarbonne.com` ajoutée
- [ ] Vérification OK (balise HTML ou DNS)
- [ ] Sitemap `sitemap.xml` soumis
- [ ] Indexation demandée pour `/`
- [ ] Attendre 1–2 semaines, retester `site:studiopilatesnarbonne.com`

---

## Déploiement du site (rappel)

Le site se déploie automatiquement via **GitHub → Vercel** à chaque push sur `master`.  
Aucun déploiement Vercel manuel nécessaire si l’intégration GitHub est active.

---

## Fichiers SEO du projet

| Fichier | Rôle |
|---------|------|
| `yoga-you-webflow-io-mirror/yoga-you.webflow.io/sitemap.xml` | Plan du site |
| `yoga-you-webflow-io-mirror/yoga-you.webflow.io/robots.txt` | Directives crawlers |
| `yoga-you-webflow-io-mirror/yoga-you.webflow.io/_vendor/tools/patch-homepage-seo.js` | Title, description, JSON-LD accueil |
| `yoga-you-webflow-io-mirror/yoga-you.webflow.io/_vendor/tools/generate-sitemap.js` | Génération sitemap |
