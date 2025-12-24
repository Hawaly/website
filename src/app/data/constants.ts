// Données statiques externalisées pour optimiser les performances

export const NAV_LINKS = [
  { href: '#hero', label: 'Accueil' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#results', label: 'Résultats' },
  { href: '#offers', label: 'Offres' },
  { href: '#testimonials-full', label: 'Avis' },
  { href: '#faq', label: 'FAQ' },
] as const;

export const FORMAT_CARDS = [
  {
    title: 'Vidéo présentative Boca Food&Juice',
    description: 'Boca Food & Juices à Neuchâtel est un snack moderne et sain proposant wraps, açaí bowls et jus frais',
    videoId: '1135383362',
    videoTitle: 'Boca_01',
  },
  {
    title: 'Sakura Sushi',
    description: 'Sakura à Neuchâtel est un restaurant japonais moderne qui propose sushis, sashimis, poke bowls et plats chauds',
    videoId: '1135380601',
    videoTitle: 'Sakura_01',
  },
  {
    title: 'Vidéo présentative Sraps',
    description: 'Sraps à Neuchâtel est un comptoir "healthy" où l\'on compose soi-même son poke bowl, son wrap ou sa salade',
    videoId: '1135382333',
    videoTitle: 'Sraps_01',
  },
] as const;

export const ADDITIONAL_VIDEOS = [
  {
    title: "Sraps",
    description: 'Sraps à Neuchâtel est un comptoir "healthy" où l\'on compose soi-même son poke bowl, son wrap ou sa salade',
    videoId: '1135381558',
    videoTitle: 'Sraps_02',
  },
  {
    title: 'Melimelo barbershop',
    description: 'MeliMelo Barbershop est un salon de coiffure & barbier moderne à Neuchâte',
    videoId: '1135383645',
    videoTitle: 'melimelo_02',
  },
  {
    title: 'Le Spot',
    description: 'Un fast food qui propose des smash burger et des crousty à la chaux de fonds',
    videoId: '1135380845',
    videoTitle: 'leSpot_01',
  },
] as const;

export const KPI_CARDS = [
  {
    title: "3x plus de ventes",
    description: "En moyenne, nos clients multiplient leurs conversions grâce à des vidéos qui racontent leur histoire.",
  },
  {
    title: "10x plus d'engagement",
    description: "Vos vidéos génèrent des likes, partages et commentaires qui boostent votre visibilité organique.",
  },
  {
    title: "Retour sur investissement garanti",
    description: "Chaque franc investi dans vos vidéos vous rapporte en nouveaux clients et en notoriété.",
  },
] as const;

export const OFFERS = [
  {
    title: "Pack de 10 posts",
    price: "2000 CHF",
    description: "Stratégie marketing complète + 10 posts par mois (6 vidéos + 4 carrousels).",
    inclusions: [
      "Stratégie marketing personnalisée",
      "Analyse de votre cible & positionnement",
      "Production de 6 vidéos professionnelles",
      "Création de 4 carrousels engageants",
      "Proposition de 15 concepts créatifs",
      "Rédaction de scripts optimisés SEO",
      "Activation d'un acteur professionnel",
      "Tournage et montage complet en interne",
      "Modifications illimitées jusqu'à satisfaction",
      "Publication et suivi des performances",
    ],
  },
  {
    title: "Business Booster",
    price: "1400 CHF",
    description: "Stratégie marketing ciblée + 6 vidéos percutantes pour booster votre croissance.",
    inclusions: [
      "Stratégie marketing sur mesure",
      "Analyse de votre audience cible",
      "Production de 6 vidéos optimisées",
      "Proposition de 15 concepts créatifs",
      "Rédaction de scripts orientés conversion",
      "Activation d'un acteur professionnel",
      "Tournage et montage premium",
      "Modifications illimitées",
      "Publication clé en main",
    ],
  },
] as const;

export const TESTIMONIALS = [
  {
    quote: "YourStory a su capturer la vibe unique de ClassiGym avec une qualité exceptionnelle. Leur travail reflète parfaitement notre énergie et notre passion pour le fitness. Chaque vidéo respire l'authenticité !",
    name: "Alessio, Fondateur @ ClassiGym",
  },
  {
    quote: "Des stratégies créatives qui font la différence ! L'équipe YourStory comprend notre vision et crée des contenus dans une superbe ambiance de travail. Leur créativité booste vraiment notre image de marque.",
    name: "Sami, Fondateur @ NxtLvl",
  },
  {
    quote: "La créativité et l'ambiance que YourStory apporte à nos vidéos sont incroyables. Ils ont su créer un univers visuel qui correspond parfaitement à l'identité de Boca. Nos clients sont conquis !",
    name: "Fabio, Gérant @ Boca Food & Juice",
  },
  {
    quote: "Résultat exceptionnel : notre chiffre d'affaires a doublé grâce aux vidéos YourStory ! Leur approche professionnelle et leur compréhension de notre marché ont fait toute la différence.",
    name: "Mohammed, Directeur @ Alibaba",
  },
  {
    quote: "Process ultra professionnel de A à Z. L'équipe a capté l'essence de notre concept healthy et ça se voit dans chaque vidéo. Nos clients adorent !",
    name: "Sofian, Fondateur @ Sraps",
  },
  {
    quote: "Enfin des vidéos qui nous ressemblent ! YourStory a su mettre en valeur notre univers barbershop avec un style moderne et authentique. Résultat : +40% de nouveaux clients.",
    name: "Ahmed, Co-fondateur @ MeliMelo Barbershop",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Combien de temps prend la production d'une vidéo ?",
    answer: "Le processus complet prend généralement 3 à 4 semaines : 1 semaine pour la stratégie et les concepts, 1 semaine pour le tournage, et 1 à 2 semaines pour le montage et les retours. Pour les projets urgents, nous proposons des versions express sous 10 jours.",
  },
  {
    question: "Que comprend exactement un pack YourStory ?",
    answer: "Chaque pack inclut une stratégie marketing personnalisée, la rédaction de scripts optimisés, le tournage professionnel avec acteur, le montage complet avec sous-titres, les exports pour Instagram, TikTok et autres réseaux, ainsi que des modifications jusqu'à satisfaction. Tout est inclus, de A à Z.",
  },
  {
    question: "Combien de modifications puis-je demander ?",
    answer: "Les modifications sont illimitées jusqu'à votre satisfaction totale. Nous travaillons en collaboration étroite avec vous pour affiner chaque détail : narration, rythme, couleurs, textes, jusqu'à ce que le résultat vous convienne parfaitement.",
  },
  {
    question: "Qui détient les droits sur les vidéos ?",
    answer: "Vous disposez d'une licence d'utilisation complète et illimitée pour tous les canaux prévus dans votre contrat (Instagram, TikTok, Facebook, site web, etc.). Les vidéos vous appartiennent pour une utilisation commerciale sans restriction de durée.",
  },
  {
    question: "Travaillez-vous avec des acteurs professionnels ?",
    answer: "Oui, nous collaborons avec un réseau d'acteurs, créateurs et spécialistes professionnels sélectionnés. Nous choisissons le talent qui correspond le mieux à votre marque et à votre message pour garantir une performance authentique et engageante.",
  },
  {
    question: "Les vidéos sont-elles optimisées pour les réseaux sociaux ?",
    answer: "Absolument ! Toutes nos vidéos sont exportées dans les formats optimaux pour chaque plateforme : format vertical 9:16 pour Instagram Reels et TikTok, format carré pour les posts Instagram, et formats adaptés pour Facebook et LinkedIn. Nous incluons également les sous-titres pour maximiser l'engagement.",
  },
  {
    question: "Proposez-vous un suivi des performances ?",
    answer: "Oui, nous fournissons des recommandations stratégiques basées sur les performances de vos vidéos. Nous analysons les métriques clés (vues, engagement, conversions) et vous donnons des insights actionnables pour optimiser vos futures campagnes.",
  },
  {
    question: "Puis-je utiliser les vidéos pour de la publicité payante ?",
    answer: "Oui, toutes nos vidéos sont conçues pour performer aussi bien en organique qu'en publicité payante. Elles sont optimisées pour les algorithmes des réseaux sociaux et peuvent être utilisées directement dans vos campagnes publicitaires sans modification supplémentaire.",
  },
] as const;

export const FORMATS = [
  { id: 'all', label: 'Tous les formats' },
  { id: 'iphone', label: "Format à l'iPhone" },
  { id: 'camera', label: 'Format à la caméra' },
  { id: 'founder', label: 'Founder stories' },
] as const;

export const GUARANTEES = [
  "Sans engagement",
  "Modifications incluses",
  "Publicité & organique",
] as const;

export const CLIENT_LOGOS = [
  { src: '/images/logos/clientLogos/alibaba.png', alt: 'Alibaba' },
  { src: '/images/logos/clientLogos/classiGym.cpng.png', alt: 'ClassiGym' },
  { src: '/images/logos/clientLogos/ladifférence.png', alt: 'La Différence' },
  { src: '/images/logos/clientLogos/Lespot.png', alt: 'Le Spot' },
  { src: '/images/logos/clientLogos/logo_sraps.png', alt: 'Sraps' },
  { src: '/images/logos/clientLogos/logo-boca-scaled.png', alt: 'Boca Food & Juice' },
  { src: '/images/logos/clientLogos/melimeloLogo.png', alt: 'MeliMelo' },
  { src: '/images/logos/clientLogos/nxtlvl.png', alt: 'NxtLvl' },
] as const;

export const METHOD_STEPS = [
  {
    number: 1,
    title: "Stratégie",
    emoji: "🎯",
    description: "On plonge dans l'univers de ta marque pour comprendre tes clients, tes concurrents et créer un plan d'attaque vidéo qui déchire.",
    side: "left" as const,
  },
  {
    number: 2,
    title: "Concepts",
    emoji: "💡",
    description: "On te balance une quinzaine d'idées créatives testées et approuvées, conçues pour faire stopper le scroll de ton audience.",
    side: "right" as const,
  },
  {
    number: 3,
    title: "Scripts",
    emoji: "✍️",
    description: "On écrit des scénarios accros qui transforment ton message en histoire captivante, avec un début qui accroche et une fin qui convertit.",
    side: "left" as const,
  },
  {
    number: 4,
    title: "Acteurs",
    emoji: "👨‍💼",
    description: "On recrute des talents pros (comédiens, créateurs ou spécialistes) qui donnent vie à ton contenu avec charisme et authenticité.",
    side: "right" as const,
  },
  {
    number: 5,
    title: "Tournage",
    emoji: "🎬",
    description: "Notre équipe débarque avec tout le matériel pro et gère chaque prise de vue pour garantir un rendu cinématique de folie.",
    side: "left" as const,
  },
  {
    number: 6,
    title: "Montage",
    emoji: "✂️",
    description: "On peaufine chaque seconde : cuts dynamiques, sous-titres accros, effets sonores et couleurs calibrées pour maximiser l'engagement.",
    side: "right" as const,
  },
  {
    number: 7,
    title: "Livraison",
    emoji: "🚀",
    description: "Tu reçois tes vidéos exportées dans tous les formats nécessaires, plus un guide stratégique pour exploser tes performances.",
    side: "left" as const,
  },
  {
    number: 8,
    title: "Satisfaction",
    emoji: "💖",
    description: "On affine ensemble jusqu'à ce que chaque détail soit parfait. Modifications illimitées jusqu'à ce que tu sois 100% satisfait.",
    side: "right" as const,
  },
  {
    number: 9,
    title: "Analyse",
    emoji: "📊",
    description: "On track les résultats de tes vidéos et on te livre des recommandations data-driven pour optimiser tes futures campagnes.",
    side: "left" as const,
  },
] as const;

