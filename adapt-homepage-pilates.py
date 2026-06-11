#!/usr/bin/env python3
"""Adapt yoga-you homepage.html for Studio Pilates Narbonne."""
from pathlib import Path

SITE = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io"
)
HOMEPAGE = SITE / "homepage.html"
INDEX = SITE / "index.html"

REPLACEMENTS = [
    ('lang="en"', 'lang="fr"'),
    (
        "<title>Homepage | Yoga You - Webflow Ecommerce website template</title>",
        "<title>Studio Pilates Narbonne — Accueil</title>",
    ),
    (
        'content="Yoga You is a beautiful and minimalistic Webflow Template designed for yoga teachers and wellness coaches. It features modern design, a fully working CMS, and E-commerce."',
        'content="Studio Pilates Narbonne — Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne. Cours avec Souhila Chekara, instructrice certifiée."',
    ),
    (
        'content="Homepage | Yoga You - Webflow Ecommerce website template"',
        'content="Studio Pilates Narbonne — Accueil"',
    ),
    ('"currencyCode":"USD","symbol":"$"', '"currencyCode":"EUR","symbol":"€"'),
    ('href="index.html" class="brand-link-navbar', 'href="homepage.html" class="brand-link-navbar'),
    ('>home</a>', '>Accueil</a>'),
    ('>about</a>', '>Le studio</a>'),
    ('>classes</a>', '>Cours</a>'),
    ('>contact</a>', '>Contact</a>'),
    ('>more pages</div>', '>Plus</div>'),
    ('>expertises</a>', '>Atouts</a>'),
    ('>class page</a>', '>Détail cours</a>'),
    ('>blog</a>', '>Voyage</a>'),
    ('>pricing</a>', '>Tarifs</a>'),
    ('>legal</a>', '>Mentions</a>'),
    ('>see all pages</a>', '>Toutes les pages</a>'),
    ('>template</div>', '>Template</div>'),
    ('>template home</a>', '>Vitrine template</a>'),
    ('>style guide</a>', '>Style guide</a>'),
    ('>licenses</a>', '>Licences</a>'),
    ('>changelog</a>', '>Changelog</a>'),
    ('>start here</a>', '>Start here</a>'),
    ('>cart</div>', '>Panier</div>'),
    ('>yoga with Jessica Kent</div>', '>Studio Pilates — Narbonne</div>'),
    ('>Online yoga classes</h1>', '>Un espace calme pour renforcer son corps et libérer son esprit.</h1>'),
    (
        'class="subtitle">From regenerative to vinyasa I will create a personalized yoga and wellness classes no matter your sport level or age,</div>',
        'class="subtitle">Une pratique fidèle aux principes de Joseph Pilates : précision, contrôle, respiration et alignement, en petits groupes à Narbonne.</div>',
    ),
    ('>Free classes</a>', '>Réserver un cours</a>'),
    ('href="classes.html" class="cta w-button">Réserver un cours</a>', 'href="contact.html" class="cta w-button">Réserver un cours</a>'),
    ('>Start now</a>', '>Voir le planning</a>'),
    ('href="pricing.html" class="cta ghost-cta w-button">Voir le planning</a>', 'href="classes.html" class="cta ghost-cta w-button">Voir le planning</a>'),
    (
        'class="big-text">Join me on a beautiful joruney to your body and soul reaching for the top performance of your physical and mental health.</div>',
        'class="big-text">Un corps plus libre, chaque jour — retrouvez force, posture et sérénité grâce à une méthode authentique et un accompagnement personnalisé.</div>',
    ),
    ('>Bespoke approach</div>', '>Méthode authentique et précise</div>'),
    (
        '<div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div><div id="w-node-f14425de',
        '<div>Chaque séance respecte les principes fondamentaux du Pilates : respiration, contrôle, fluidité et posture, pour un travail profond et durable.</div></div></div><div id="w-node-f14425de',
    ),
    ('>Sustainable practices</div>', '>Petits groupes pour un vrai suivi</div>'),
    (
        '<div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div><div id="w-node-_3022c29e',
        '<div>Nous limitons volontairement le nombre de participants pour garantir corrections ciblées et une progression douce, régulière et sécurisée.</div></div></div><div id="w-node-_3022c29e',
    ),
    ('>Certified skills</div>', '>Instructeur certifié</div>'),
    (
        '<div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div></div><div data-w-id="0d12ee22',
        '<div>Votre pratique est guidée par Souhila Chekara, professionnelle formée et attentive à vos besoins, pour évoluer avec confort et confiance.</div></div></div></div><div data-w-id="0d12ee22',
    ),
    ('>Praesent egestas tristique nibh</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4064166c7d653bde0f3_check.svg"', '>Travail précis &amp; complet</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4064166c7d653bde0f3_check.svg"'),
    ('>Praesent egestas tristique nibh</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4221d761910b1404032_check%20dark.svg" loading="lazy" alt="" class="icon-check"/></div><div>Praesent egestas tristique nibh</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4221d761910b1404032_check%20dark.svg"', '>Posture et alignement optimisés</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4221d761910b1404032_check%20dark.svg" loading="lazy" alt="" class="icon-check"/></div><div>Améliore force et souplesse</div></div><div class="single-checklist"><div class="circle-checlist"><img src="65939d1f139e1daa37da455f/6593c4221d761910b1404032_check%20dark.svg"'),
    ('>My recent free classes</h2>', '>Découvrez nos cours</h2>'),
    ('>see all</a>', '>Voir tous les cours</a>'),
    ('>1 Hour Pilates</h3>', '>Pilates Reformer</h3>'),
    ('<div>Beginner</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>1 hour</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Pilates Reformer</h3><div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div><div class="text-read-more">Start class</div>',
     '<div>Petit groupe</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>32 €</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Pilates Reformer</h3><div>Cours en petit groupe — travail précis et complet, respect de la méthode originale.</div><div class="text-read-more">Réserver</div>'),
    ('>30 Minutes Morning Yoga</h3>', '>Pilates Mat</h3>'),
    ('<div>Intermediate</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>30 minutes</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Pilates Mat</h3><div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div><div class="text-read-more">Start class</div>',
     '<div>Tous niveaux</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>12,50 €</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Pilates Mat</h3><div>Renforcement en profondeur — travail du centre, de la posture et de l\'alignement.</div><div class="text-read-more">Réserver</div>'),
    ('>Yoga for focus</h3>', '>Yoga Ashtanga</h3>'),
    ('<div>Intermediate</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>30 minutes</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Yoga Ashtanga</h3><div>Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div><div class="text-read-more">Start class</div>',
     '<div>Dynamique</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>12,50 €</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">Yoga Ashtanga</h3><div>Pratique dynamique et fluide — améliore force et souplesse, adaptée à tous les niveaux.</div><div class="text-read-more">Réserver</div>'),
    ('>Start class</div>', '>Réserver</div>'),
    ('>Bringing excellence to every training</h1>', '>Un corps plus libre, chaque jour</h1>'),
    ('>Watch showreel</div>', '>Découvrir le studio</div>'),
    (
        '<h2 class="no-margins">Hey! I’m Jessica Kent and I’m a certified yoga and breathwork coach.</h2>',
        '<h2 class="no-margins">Souhila Chekara — instructrice Pilates certifiée à Narbonne.</h2>',
    ),
    (
        '<div class="paragraph-big">In dui magna, posuere eget, vestibulum et, tempor auctor, justo. Praesent congue erat at massa. Vivamus aliquet elit.</div></div><div data-w-id="7426890c-b328-a27d-2cd4-530562b3f124"',
        '<div class="paragraph-big">Un studio calme dédié au Pilates et au bien-être, où chaque séance est pensée pour vous aider à gagner en force, en mobilité et en confiance au quotidien.</div></div><div data-w-id="7426890c-b328-a27d-2cd4-530562b3f124"',
    ),
    ('>Trusted by hundreds</div>', '>Méthode authentique</div>'),
    ('>Certification</div>', '>Petits groupes</div>'),
    ('>Offline classes</div>', '>Suivi personnalisé</div>'),
    ('>Proven success</div>', '>Résultats posture &amp; mobilité</div>'),
    ('>About me</a>', '>Le studio</a>'),
    ('>Breathwork</div><div class="circle-moving-text"></div><div class="text-moving-text">Yin</div>', '>Reformer</div><div class="circle-moving-text"></div><div class="text-moving-text">Mat</div>'),
    ('>Sun salutations</div>', '>Posture</div>'),
    ('>VinyasA</div>', '>Narbonne</div>'),
    ('>Astanga</div>', '>Ashtanga</div>'),
    ('>Wellness</div>', '>Mobilité</div>'),
    ('>Bikram</div>', '>Respiration</div>'),
    ('>Kundalini</div>', '>Alignement</div>'),
    ('>My main areas of expertise</h2>', '>Nos disciplines</h2>'),
    (
        '<div class="paragraph-big">In dui magna, posuere eget, vestibulum et, tempor auctor, justo.</div></div><div data-w-id="5e70e026-1281-9721-175d-7cbb165cd3ba"',
        '<div class="paragraph-big">Pilates Reformer, Pilates Mat et Yoga Ashtanga — trois approches complémentaires pour renforcer le corps en profondeur.</div></div><div data-w-id="5e70e026-1281-9721-175d-7cbb165cd3ba"',
    ),
    ('<div>Yoga</div></a><a data-w-tab="Tab 1"', '<div>Pilates Reformer</div></a><a data-w-tab="Tab 1"'),
    ('<div>Breathwork</div></a><a data-w-tab="Tab 3"', '<div>Pilates Mat</div></a><a data-w-tab="Tab 3"'),
    ('<div>Pilates</div></a></div>', '<div>Yoga Ashtanga</div></a></div>'),
    ('<h3 class="no-margins">Yoga</h3><div class="paragraph-big">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div></div></div></div><div data-w-tab="Tab 1"',
     '<h3 class="no-margins">Pilates Reformer</h3><div class="paragraph-big">Cours en petit groupe sur reformer — travail précis, complet et fidèle à la méthode originale. 32 € la séance.</div></div></div></div></div></div><div data-w-tab="Tab 1"'),
    ('<h3 class="no-margins">Breathwork</h3><div class="paragraph-big">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div></div></div></div><div data-w-tab="Tab 3"',
     '<h3 class="no-margins">Pilates Mat</h3><div class="paragraph-big">Renforcement en profondeur au sol — centre, posture et alignement optimisés. 12,50 € la séance.</div></div></div></div></div></div><div data-w-tab="Tab 3"'),
    ('<h3 class="no-margins">Pilates</h3><div class="paragraph-big">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div></div></div></div></div></div></div></div><div class="flex-cta-center',
     '<h3 class="no-margins">Yoga Ashtanga</h3><div class="paragraph-big">Pratique dynamique et fluide pour améliorer force et souplesse — adaptée à tous les niveaux. 12,50 € la séance.</div></div></div></div></div></div></div></div><div class="flex-cta-center'),
    ('>My expertises</a>', '>Découvrir nos cours</a>'),
    ('href="expertises.html" class="cta w-button">Découvrir nos cours</a>', 'href="classes.html" class="cta w-button">Découvrir nos cours</a>'),
    ('>Don’t just take my word for it</h2>', '>Ce que disent nos élèves</h2>'),
    (
        '"Jessica Kent helped me so much on every level. She really took time to understand my work and sports routine and organized series of online classes that helped me to release back pain and improve my scores in football."',
        '"Un accompagnement attentif et des corrections précises à chaque séance. J\'ai gagné en posture et en confiance, avec une vraie progression semaine après semaine."',
    ),
    ('>Kelly Kapor</div>', '>Élève du studio</div>'),
    ('>Simple and proven process for your better well being.</h2>', '>Réserver votre cours en trois étapes.</h2>'),
    ('>Praesent ac massa at ligula laoreet iaculis. Vivamus aliquet elit ac nisl. Sed aliquam ultrices.</div><div class="flex-cta-left mg-top-16"><a href="pricing.html" class="cta w-button">Start now</a>',
     '>Contactez-nous, choisissez votre cours et progressez en toute sérénité avec un suivi adapté à votre niveau.</div><div class="flex-cta-left mg-top-16"><a href="contact.html" class="cta w-button">Réserver</a>'),
    ('>Get in touch</h3>', '>Nous contacter</h3>'),
    ('>Understand goals</h3>', '>Choisir votre cours</h3>'),
    ('>Practice and improve</h3>', '>Progresser en confiance</h3>'),
    (
        '<div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div></div><div class="tile-process-sticky"><div class="top-process-tile"><img src="65939d1f139e1daa37da455f/6593e705f34c0f8678ea2382_Process%202.svg"',
        '<div class="paragraph-big">Par email ou téléphone — nous répondons à vos questions et vous orientons vers la formule adaptée.</div></div><div class="tile-process-sticky"><div class="top-process-tile"><img src="65939d1f139e1daa37da455f/6593e705f34c0f8678ea2382_Process%202.svg"',
    ),
    (
        '<div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div></div><div class="tile-process-sticky"><div class="top-process-tile"><img src="65939d1f139e1daa37da455f/6593e7050375bb617253310d_Process%203.svg"',
        '<div class="paragraph-big">Reformer, Mat ou Yoga Ashtanga — sélectionnez le cours qui correspond à vos objectifs et à votre rythme.</div></div><div class="tile-process-sticky"><div class="top-process-tile"><img src="65939d1f139e1daa37da455f/6593e7050375bb617253310d_Process%203.svg"',
    ),
    (
        '<div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div></div></div></div></div></div></section><section class="section image-quote-section"',
        '<div class="paragraph-big">En petits groupes, progressez avec des corrections ciblées dans un cadre calme et bienveillant.</div></div></div></div></div></div></section><section class="section image-quote-section"',
    ),
    (
        '<h2 data-w-id="b02265a5-5f45-8380-7c5c-4c69138d8140">I will approach your practice in a bespoke manner, optimizing fully for your goals and dreams.</h2>',
        '<h2 data-w-id="b02265a5-5f45-8380-7c5c-4c69138d8140">Votre transformation commence ici — un studio pensé pour vous accompagner durablement.</h2>',
    ),
    (
        '<div data-w-id="b02265a5-5f45-8380-7c5c-4c69138d8142">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna. Vestibulum suscipit nulla quis orci. Sed fringilla mauris sit amet nibh. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Duis vel nibh at velit scelerisque suscipit. Ut id nisl quis enim dignissim sagittis.</div>',
        '<div data-w-id="b02265a5-5f45-8380-7c5c-4c69138d8142">Un travail profond sur les muscles stabilisateurs améliore votre alignement et votre confort physique. Vous gagnez en mobilité, en force et en fluidité pour mieux bouger au quotidien.</div>',
    ),
    ('>Book a lesson today</h2>', '>Découvrez nos tarifs</h2>'),
    ('>Single class</div>', '>Pilates Reformer</div>'),
    ('class="text-price">$ 80.00 USD</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>All levels</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>60 minutes</div></div></div><div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div><a href="product/single-class.html" class="cta pricing-cta w-button">Get started</a>',
     'class="text-price">32 €</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Petit groupe</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Cours complet</div></div></div><div class="paragraph-big">Travail précis sur reformer — respect de la méthode originale, corrections personnalisées.</div><a href="contact.html" class="cta pricing-cta w-button">Réserver</a>'),
    ('>5 Classes</div>', '>Pilates Mat</div>'),
    ('class="text-price">$ 320.00 USD</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>All levels</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>60 minutes each</div></div></div><div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div><a href="product/5-classes.html" class="cta pricing-cta w-button">Get started</a>',
     'class="text-price">12,50 €</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Tous niveaux</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Renforcement</div></div></div><div class="paragraph-big">Travail du centre et de la posture en profondeur — alignement et force stabilisatrice.</div><a href="contact.html" class="cta pricing-cta w-button">Réserver</a>'),
    ('>10 Classes</div>', '>Yoga Ashtanga</div>'),
    ('class="text-price">$ 600.00 USD</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>All levels</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>60 minutes each</div></div></div><div class="paragraph-big">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div><a href="product/10-classes.html" class="cta pricing-cta w-button">Get started</a>',
     'class="text-price">12,50 €</div></div><div class="wrap-pricing-details"><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Dynamique</div></div><div class="single-pricing-detail"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-pricing-detail"/><div>Fluide</div></div></div><div class="paragraph-big">Pratique dynamique et fluide — force, souplesse et respiration, adaptée à tous les niveaux.</div><a href="contact.html" class="cta pricing-cta w-button">Réserver</a>'),
    ('>Get started</a>', '>Réserver</a>'),
    ('href="index.html" class="brand-link-footer', 'href="homepage.html" class="brand-link-footer'),
    ('>hi@yoga.com</div>', '>lahissou@hotmail.fr</div>'),
    ('>+1 800 000 000</div>', '>+33 6 50 08 02 22</div>'),
    ('>California, Santa Monica</div>', '>8 Rue du Luxembourg, 11100 Narbonne</div>'),
    ('href="homepage.html#" class="single-contact-list-footer w-inline-block"><img src="65939d1f139e1daa37da455f/6594010c897ecdee07de46a2_send-mail.svg"', 'href="mailto:lahissou@hotmail.fr" class="single-contact-list-footer w-inline-block"><img src="65939d1f139e1daa37da455f/6594010c897ecdee07de46a2_send-mail.svg"'),
    ('href="homepage.html#" class="single-contact-list-footer w-inline-block"><img src="65939d1f139e1daa37da455f/6594010c4166c7d653e3b8f0_phone.svg"', 'href="tel:+33650080222" class="single-contact-list-footer w-inline-block"><img src="65939d1f139e1daa37da455f/6594010c4166c7d653e3b8f0_phone.svg"'),
    ('>Main pages</div>', '>Navigation</div>'),
    ('>Home</a>', '>Accueil</a>'),
    ('>About</a>', '>Le studio</a>'),
    ('>Contact</a>', '>Contact</a>'),
    ('>Classes</a>', '>Cours</a>'),
    ('>Expertises</a>', '>Atouts</a>'),
    ('>Other pages</div>', '>Pages</div>'),
    ('>Template home</a>', '>Vitrine template</a>'),
    ('>Blog</a>', '>Voyage</a>'),
    ('>Pricing</a>', '>Tarifs</a>'),
    ('>Legal</a>', '>Mentions</a>'),
    ('>CMS pages</div>', '>Filtres</div>'),
    ('>Class page</a>', '>Détail cours</a>'),
    ('>Level filter</a>', '>Par niveau</a>'),
    ('>Duration filter</a>', '>Par durée</a>'),
    ('>Type filter</a>', '>Par type</a>'),
    ('>Blog post</a>', '>Article</a>'),
    ('>Template</div>', '>Template</div>'),
    ('>Style guide</a>', '>Style guide</a>'),
    ('>Licenses</a>', '>Licences</a>'),
    ('>Changelog</a>', '>Changelog</a>'),
    ('>Start here</a>', '>Start here</a>'),
    ('>All pages</a>', '>Toutes les pages</a>'),
    (
        'Template designed with love by <a href="https://www.wavesdesign.io" target="_blank" class="white-link">Wavesdesign</a>',
        '© 2026 Studio Pilates Narbonne — Souhila Chekara, instructrice Pilates',
    ),
]

INDEX_REDIRECT = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Studio Pilates Narbonne</title>
  <meta http-equiv="refresh" content="0; url=homepage.html"/>
  <link rel="canonical" href="homepage.html"/>
  <script>location.replace("homepage.html");</script>
</head>
<body>
  <p>Redirection vers <a href="homepage.html">Studio Pilates Narbonne</a>…</p>
</body>
</html>
"""


def main():
    text = HOMEPAGE.read_text(encoding="utf-8", errors="replace")
    original = text
    applied = 0
    for old, new in REPLACEMENTS:
        if old in text:
            text = text.replace(old, new, 1)
            applied += 1
        else:
            print(f"MISSING: {old[:70]}...")

    if text != original:
        HOMEPAGE.write_text(text, encoding="utf-8")
        print(f"homepage.html updated ({applied} replacements applied)")

    INDEX.write_text(INDEX_REDIRECT, encoding="utf-8")
    print("index.html → redirect to homepage.html")


if __name__ == "__main__":
    main()
