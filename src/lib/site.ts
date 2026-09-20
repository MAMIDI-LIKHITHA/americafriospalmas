export const WHATSAPP_NUMBERS = [
  { display: "(63) 98402-1014", tel: "+5563984021014", intl: "5563984021014" },
  { display: "(63) 99220-7950", tel: "+5563992207950", intl: "5563992207950" },
] as const;

// Mantido para compatibilidade com código legado (order.ts).
export const WHATSAPP_NUMBER = WHATSAPP_NUMBERS[0].intl;

export const DEFAULT_WA_MESSAGE =
  "Olá! Vim pelo site e gostaria de saber mais sobre os produtos.";

export const waLinkFor = (intl: string, text: string = DEFAULT_WA_MESSAGE) =>
  `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

export const waLink = (text: string = DEFAULT_WA_MESSAGE) => waLinkFor(WHATSAPP_NUMBER, text);

export const CONTACT = {
  phoneDisplays: WHATSAPP_NUMBERS.map((n) => n.display),
  phonesTel: WHATSAPP_NUMBERS.map((n) => n.tel),
  phoneDisplay: WHATSAPP_NUMBERS[0].display,
  phoneIntl: "+55 63 98402-1014",
  email: "empoemporiofinanceiro2018@yahoo.com",
  instagram: "https://www.instagram.com/americafriospalmas/",
  instagramHandle: "@americafriospalmas",
  facebook: "https://www.facebook.com/search/top?q=am%C3%A9rica%20frios",
  hours: "8h às 20h, de segunda a sábado; até às 13h no domingo",
};

export type Store = {
  slug: string;
  name: string;
  badge?: string;
  street: string;
  district: string;
  city: string;
  postal: string;
  mapQuery: string;
  phoneDisplay: string;
  phoneIntl: string;
  hours: string;
  verifyStatus?: boolean;
};

export const STORES: Store[] = [
  {
    slug: "305-sul",
    name: "Loja 305 Sul",
    badge: "Matriz",
    street: "Av. LO 5, Q. 205 Sul, Alameda 1, 11",
    district: "Plano Diretor Sul",
    city: "Palmas - TO",
    postal: "77015-000",
    mapQuery:
      "Av. LO 5, Q. 205 Sul, Alameda 1, 11, Plano Diretor Sul, Palmas - TO, 77015-000",
    phoneDisplay: "(63) 98402-1014",
    phoneIntl: "5563984021014",
    hours: "8h às 20h, de segunda a sábado; até às 13h no domingo",
  },
  {
    slug: "903-sul",
    name: "Loja 903 Sul",
    street: "Alameda 11, Q. 903 Sul",
    district: "Plano Diretor Sul",
    city: "Palmas - TO",
    postal: "77017-282",
    mapQuery: "Alameda 11, Quadra 903 Sul, Plano Diretor Sul, Palmas - TO, 77017-282",
    phoneDisplay: "(63) 99220-7950",
    phoneIntl: "5563992207950",
    hours: "8h às 20h, de segunda a sábado; até às 13h no domingo",
  },
];

export const mapEmbed = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

export const mapDirections = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export const localBusinessSchema = () =>
  STORES.map((s) => ({
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: `América Frios — ${s.name}`,
    image: "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas/main/src/assets/Homepage.png",
    telephone: s.phoneIntl,
    email: CONTACT.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: "Palmas",
      addressRegion: "TO",
      postalCode: s.postal,
      addressCountry: "BR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "08:00",
        closes: "13:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "25",
    },
    sameAs: [CONTACT.instagram],
  }));
