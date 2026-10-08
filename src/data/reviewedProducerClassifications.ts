import type { Category, ProducerProductSection, VisitorFeature } from '../types/terroir';

export interface ReviewedProducerClassification {
  id: string;
  primaryCategory: Category;
  additionalCategories: Category[];
  visitorFeatures?: VisitorFeature[];
  productSections?: ProducerProductSection[];
  categorySources: Partial<Record<Category, string[]>>;
  featureSources?: Partial<Record<VisitorFeature, string[]>>;
  featureVerificationType?: 'first_party_source' | 'public_listing';
}

/** Reviewed 2026-10-08. Used only by the explicit development preview and migration preparation.
 * Production Supabase remains authoritative; these proposals never override production records.
 * Only existing producer identities are included. No coordinates, visit status or road grades change.
 * Canava's museum is supported by a dated public listing, not a current first-party access claim.
 */
export const REVIEWED_PRODUCER_CLASSIFICATIONS: ReviewedProducerClassification[] = [
  {
    "id": "anoskeli-estate",
    "primaryCategory": "winery",
    "additionalCategories": [
      "olive_mill"
    ],
    "visitorFeatures": [
      "tasting"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "Estate-grown wines"
        ]
      },
      {
        "category": "olive_mill",
        "specialties": [
          "Extra virgin olive oil"
        ]
      }
    ],
    "categorySources": {
      "olive_mill": [
        "https://anoskeli.gr/"
      ]
    },
    "featureSources": {
      "tasting": [
        "https://anoskeli.gr/experiences"
      ]
    }
  },
  {
    "id": "tyrnavos-winery-cooperative-thessaly",
    "primaryCategory": "winery",
    "additionalCategories": [
      "distillery"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "PGI Tyrnavos wines",
          "Moschato Tyrnavou wines",
          "Grape must products"
        ],
        "varieties": [
          "Moschato Tyrnavou",
          "Roditis",
          "Assyrtiko",
          "Bantiki",
          "Malagousia",
          "Limniona",
          "Xinomavro"
        ]
      },
      {
        "category": "distillery",
        "specialties": [
          "Tsipouro of Tyrnavos",
          "Ouzo of Tyrnavos",
          "Oak-aged tsipouro"
        ]
      }
    ],
    "categorySources": {
      "distillery": [
        "https://www.tirnavoswinery.gr/en/the-cooperative/"
      ]
    }
  },
  {
    "id": "tsililis-theopetra-thessaly",
    "primaryCategory": "winery",
    "additionalCategories": [
      "distillery"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "Theopetra Estate wines"
        ],
        "varieties": [
          "Limniona",
          "Xinomavro",
          "Malagousia",
          "Assyrtiko"
        ]
      },
      {
        "category": "distillery",
        "specialties": [
          "Tsililis Tsipouro",
          "Dark Cave aged grape distillate",
          "Greek grape spirits"
        ]
      }
    ],
    "categorySources": {
      "distillery": [
        "https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055"
      ]
    }
  },
  {
    "id": "hardanger-saft-siderfabrikk-vestland",
    "primaryCategory": "cidery",
    "additionalCategories": [
      "distillery"
    ],
    "productSections": [
      {
        "category": "cidery",
        "specialties": [
          "Hardanger cider",
          "Spontaneously fermented cider",
          "Apple juice",
          "Alcohol-free cider"
        ],
        "varieties": [
          "Gravenstein",
          "Summerred",
          "Discovery",
          "Aroma"
        ]
      },
      {
        "category": "distillery",
        "specialties": [
          "Apple brandy",
          "Aquavit"
        ]
      }
    ],
    "categorySources": {
      "distillery": [
        "https://hardangersider.no/om-oss/"
      ]
    }
  },
  {
    "id": "ipsa-istria",
    "primaryCategory": "olive_mill",
    "additionalCategories": [
      "winery"
    ],
    "productSections": [
      {
        "category": "olive_mill",
        "specialties": [
          "Frantoio EVOO",
          "Leccino EVOO",
          "Istarska Bjelica EVOO",
          "Ipša Selekcija EVOO"
        ],
        "varieties": [
          "Istarska bjelica",
          "Buža",
          "Rosinjola",
          "Karbonaca"
        ]
      },
      {
        "category": "winery",
        "specialties": [
          "Istrian wines",
          "Malvazija wines",
          "Teran wines"
        ],
        "varieties": [
          "Istarska malvazija",
          "Teran",
          "Refošk"
        ]
      }
    ],
    "categorySources": {
      "winery": [
        "https://ipsa-maslinovaulja.com/en/proizvodnja/"
      ]
    }
  },
  {
    "id": "herdade-do-esporao-alentejo",
    "primaryCategory": "winery",
    "additionalCategories": [
      "olive_mill"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "Alentejo wines",
          "Organic estate wines",
          "Single-variety wines"
        ]
      },
      {
        "category": "olive_mill",
        "specialties": [
          "Estate extra virgin olive oil"
        ]
      }
    ],
    "categorySources": {
      "olive_mill": [
        "https://esporao.com/en/the-olive-groves"
      ]
    }
  },
  {
    "id": "kazani-stilianou",
    "primaryCategory": "winery",
    "additionalCategories": [
      "olive_oil_producer"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "Natural and bio-organic wines",
          "Cretan indigenous grape varieties"
        ],
        "varieties": [
          "Vidiano",
          "Thrapsathiri",
          "Vilana",
          "Kotsifali",
          "Mandilari"
        ]
      },
      {
        "category": "olive_oil_producer",
        "specialties": [
          "Organic extra virgin olive oil"
        ]
      }
    ],
    "categorySources": {
      "olive_oil_producer": [
        "https://stilianouwinery.com/"
      ]
    }
  },
  {
    "id": "fattoria-corzano-e-paterno-tuscany",
    "primaryCategory": "winery",
    "additionalCategories": [
      "cheese_dairy",
      "olive_oil_producer"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "Estate wines"
        ],
        "varieties": [
          "Sangiovese",
          "Canaiolo",
          "Malvasia",
          "Trebbiano"
        ]
      },
      {
        "category": "cheese_dairy",
        "specialties": [
          "Artisan sheep's-milk cheeses"
        ]
      },
      {
        "category": "olive_oil_producer",
        "specialties": [
          "Extra virgin olive oil"
        ]
      }
    ],
    "categorySources": {
      "cheese_dairy": [
        "https://www.corzanoepaterno.com/en/cheese/"
      ],
      "olive_oil_producer": [
        "https://www.corzanoepaterno.com/vendita-olio-extra-vergine-di-oliva/"
      ]
    }
  },
  {
    "id": "cascina-barroero-piedmont",
    "primaryCategory": "farm",
    "additionalCategories": [
      "confectionery",
      "apiary"
    ],
    "productSections": [
      {
        "category": "farm",
        "specialties": [
          "Nocciola Piemonte IGP",
          "Roasted hazelnuts",
          "Hazelnut flour",
          "Hazelnut granella",
          "100% hazelnut paste"
        ]
      },
      {
        "category": "confectionery",
        "specialties": [
          "Gianduja creams",
          "Hazelnut pastries"
        ]
      },
      {
        "category": "apiary",
        "specialties": [
          "Seasonal honey"
        ]
      }
    ],
    "categorySources": {
      "confectionery": [
        "https://www.barroero.it/en/patisserie/"
      ],
      "apiary": [
        "https://www.barroero.it/"
      ]
    }
  },
  {
    "id": "la-vinyeta-catalonia",
    "primaryCategory": "winery",
    "additionalCategories": [
      "olive_oil_producer",
      "cheese_dairy",
      "apiary"
    ],
    "productSections": [
      {
        "category": "winery",
        "specialties": [
          "DO Empordà wines",
          "Small-production and native-variety wines"
        ],
        "varieties": [
          "Carinyena"
        ]
      },
      {
        "category": "olive_oil_producer",
        "specialties": [
          "Estate olive oil"
        ]
      },
      {
        "category": "cheese_dairy",
        "specialties": [
          "Estate-made cheese"
        ]
      },
      {
        "category": "apiary",
        "specialties": [
          "Estate-made honey"
        ]
      }
    ],
    "categorySources": {
      "olive_oil_producer": [
        "https://www.lavinyeta.es/ca/lots/5/lot-costa-brava"
      ],
      "cheese_dairy": [
        "https://www.lavinyeta.es/ca/lots/5/lot-costa-brava"
      ],
      "apiary": [
        "https://www.lavinyeta.es/ca/noticia/12"
      ]
    }
  },
  {
    "id": "canava-santorini-distillery",
    "primaryCategory": "distillery",
    "additionalCategories": [],
    "visitorFeatures": [
      "museum"
    ],
    "categorySources": {},
    "featureSources": {
      "museum": [
        "https://www.santorini.net/canava-santorini-where-distillation-meets-history/"
      ]
    },
    "featureVerificationType": "public_listing"
  }
];
