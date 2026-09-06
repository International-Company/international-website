/**
 * Describes which dictionary strings the admin panel may edit, and how to
 * render each one. The editor UI is generated entirely from this file, so
 * exposing a new field is a one-line change here — no new form markup.
 */

/** `lines` edits a string[] as one item per line; `num` stores a number. */
export type FieldType = "text" | "area" | "lines" | "num";

export type Field = {
  /** Dot path into the dictionary, e.g. "hero.title". */
  path: string;
  label: string;
  type?: FieldType;
  /** Helper text shown under the input. */
  hint?: string;
  /** Renders a narrow input — for a single glyph or a short code. */
  compact?: boolean;
};

export type ListBlock = {
  kind: "list";
  /** Path of the array, e.g. "faq.items". */
  path: string;
  label: string;
  /** Arabic noun for one row, used in the "add" button and row headers. */
  itemLabel: string;
  /** Field paths here are relative to the row. */
  fields: Field[];
  /** Relative path of the field shown in the collapsed row header. */
  titleField: string;
  /** Rows may be added and removed. Off for fixed-size lists. */
  addable?: boolean;
  max?: number;
};

export type FieldBlock = { kind: "fields"; fields: Field[] };
export type Block = FieldBlock | ListBlock;

export type Group = {
  id: string;
  label: string;
  icon: string;
  /** One-line description shown under the group title. */
  hint?: string;
  sections: { title: string; blocks: Block[] }[];
};

export const CONTENT_GROUPS: Group[] = [
  {
    id: "home",
    label: "الصفحة الرئيسية",
    icon: "🏠",
    hint: "النصوص التي يراها الزائر أول ما يفتح الموقع",
    sections: [
      {
        title: "الواجهة الرئيسية (الهيرو)",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "hero.badge", label: "الشارة العلوية" },
              { path: "hero.kicker", label: "السطر الإنجليزي الصغير" },
              { path: "hero.title", label: "الاسم الكبير" },
              { path: "hero.titleThin", label: "الجملة التالية للاسم" },
              { path: "hero.lead", label: "الفقرة التعريفية", type: "area" },
              { path: "hero.cta1", label: "زر أساسي" },
              { path: "hero.cta2", label: "زر ثانوي" },
              {
                path: "hero.trust",
                label: "عناصر الثقة",
                type: "lines",
                hint: "عنصر واحد في كل سطر",
              },
            ],
          },
          {
            kind: "list",
            path: "hero.chips",
            label: "بطاقات الهيرو الصغيرة",
            itemLabel: "بطاقة",
            titleField: "t",
            addable: true,
            max: 4,
            fields: [
              { path: "icon", label: "الأيقونة", hint: "رمز أو إيموجي واحد", compact: true },
              { path: "t", label: "النص" },
            ],
          },
        ],
      },
      {
        title: "قسم العرض (لماذا إنترنشونال)",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "showcase.title", label: "العنوان فوق الصورة" },
              { path: "showcase.sub", label: "الوصف فوق الصورة", type: "area" },
              { path: "showcase.tag", label: "وسم القسم" },
              {
                path: "showcase.heading",
                label: "العنوان الرئيسي",
                type: "area",
                hint: "اضغط Enter لكسر السطر",
              },
              { path: "showcase.body", label: "الفقرة", type: "area" },
              { path: "showcase.badge", label: "شارة الصورة" },
              { path: "showcase.cta", label: "نص الزر" },
            ],
          },
          {
            kind: "list",
            path: "showcase.points",
            label: "نقاط التميّز",
            itemLabel: "نقطة",
            titleField: "t",
            addable: true,
            fields: [
              { path: "icon", label: "الأيقونة", compact: true },
              { path: "t", label: "العنوان" },
              { path: "d", label: "الوصف", type: "area" },
            ],
          },
        ],
      },
      {
        title: "الأرقام",
        blocks: [
          {
            kind: "list",
            path: "stats.items",
            label: "إحصائيات الشركة",
            itemLabel: "رقم",
            titleField: "label",
            addable: true,
            max: 6,
            fields: [
              { path: "value", label: "الرقم", type: "num", compact: true },
              { path: "suffix", label: "اللاحقة", hint: "مثل + أو K+", compact: true },
              { path: "label", label: "الوصف" },
            ],
          },
        ],
      },
      {
        title: "قسم الشبكة",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "network.tag", label: "وسم القسم" },
              { path: "network.title", label: "العنوان", type: "area" },
              { path: "network.sub", label: "الوصف", type: "area" },
            ],
          },
        ],
      },
      {
        title: "أسعار الذهب",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "markets.tag", label: "وسم القسم" },
              { path: "markets.title", label: "العنوان", type: "area" },
              { path: "markets.sub", label: "الوصف", type: "area" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "about",
    label: "من نحن",
    icon: "🏛",
    hint: "قصة الشركة، القيم، والمسيرة الزمنية",
    sections: [
      {
        title: "التعريف",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "about.tag", label: "وسم القسم" },
              { path: "about.title", label: "العنوان", type: "area" },
              { path: "about.p1", label: "الفقرة التعريفية", type: "area" },
              { path: "about.visionLabel", label: "عنوان الرؤية" },
              { path: "about.vision", label: "نص الرؤية", type: "area" },
              { path: "about.missionLabel", label: "عنوان الرسالة" },
              { path: "about.mission", label: "نص الرسالة", type: "area" },
            ],
          },
          {
            kind: "list",
            path: "about.values",
            label: "قيم الشركة",
            itemLabel: "قيمة",
            titleField: "title",
            addable: true,
            fields: [
              { path: "icon", label: "الأيقونة", compact: true },
              { path: "title", label: "العنوان" },
              { path: "desc", label: "الوصف", type: "area" },
            ],
          },
        ],
      },
      {
        title: "المسيرة",
        blocks: [
          { kind: "fields", fields: [{ path: "timeline.tag", label: "وسم القسم" }] },
          {
            kind: "list",
            path: "timeline.items",
            label: "المحطات",
            itemLabel: "محطة",
            titleField: "year",
            addable: true,
            fields: [
              { path: "year", label: "السنة والعنوان" },
              { path: "title", label: "العنوان" },
              { path: "desc", label: "الوصف", type: "area" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "services",
    label: "الخدمات",
    icon: "💼",
    hint: "القطاعات الأربعة وصفحة كل خدمة",
    sections: [
      {
        title: "ترويسة القسم",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "services.tag", label: "وسم القسم" },
              { path: "services.title", label: "العنوان", type: "area" },
              { path: "services.sub", label: "الوصف", type: "area" },
              { path: "services.link", label: "نص رابط التفاصيل" },
            ],
          },
        ],
      },
      {
        title: "الخدمات",
        blocks: [
          {
            kind: "list",
            path: "services.items",
            label: "قائمة الخدمات",
            itemLabel: "خدمة",
            titleField: "title",
            fields: [
              { path: "icon", label: "الأيقونة", compact: true },
              { path: "title", label: "الاسم بالعربية" },
              { path: "en", label: "الاسم بالإنجليزية" },
              { path: "desc", label: "الوصف المختصر", type: "area" },
              {
                path: "feats",
                label: "المزايا",
                type: "lines",
                hint: "ميزة واحدة في كل سطر",
              },
              {
                path: "long",
                label: "الشرح المطوّل",
                type: "lines",
                hint: "فقرة واحدة في كل سطر",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "trust",
    label: "الثقة",
    icon: "⭐",
    hint: "آراء العملاء والأسئلة الشائعة",
    sections: [
      {
        title: "آراء العملاء",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "testimonials.tag", label: "وسم القسم" },
              { path: "testimonials.title", label: "العنوان", type: "area" },
            ],
          },
          {
            kind: "list",
            path: "testimonials.items",
            label: "الآراء",
            itemLabel: "رأي",
            titleField: "who",
            addable: true,
            fields: [
              { path: "quote", label: "نص الرأي", type: "area" },
              { path: "who", label: "الاسم" },
              { path: "role", label: "الصفة" },
            ],
          },
        ],
      },
      {
        title: "الأسئلة الشائعة",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "faq.tag", label: "وسم القسم" },
              { path: "faq.title", label: "العنوان", type: "area" },
            ],
          },
          {
            kind: "list",
            path: "faq.items",
            label: "الأسئلة",
            itemLabel: "سؤال",
            titleField: "q",
            addable: true,
            fields: [
              { path: "q", label: "السؤال" },
              { path: "a", label: "الإجابة", type: "area" },
            ],
          },
        ],
      },
      {
        title: "الشركاء",
        blocks: [
          {
            kind: "fields",
            fields: [{ path: "partners.label", label: "نص شريط الشركاء", type: "area" }],
          },
        ],
      },
    ],
  },

  {
    id: "contact",
    label: "صفحة التواصل",
    icon: "☎️",
    hint: "عنوان صفحة «تواصل معنا»",
    sections: [
      {
        title: "ترويسة الصفحة",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "contact.tag", label: "وسم القسم" },
              { path: "contact.title", label: "العنوان", type: "area" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "meta",
    label: "الهوية والتذييل",
    icon: "🏷",
    hint: "اسم الشركة، شاشة البداية، القائمة، ومحركات البحث",
    sections: [
      {
        title: "محركات البحث",
        blocks: [
          {
            kind: "fields",
            fields: [
              {
                path: "meta.title",
                label: "عنوان الموقع",
                hint: "يظهر في نتائج جوجل وفي تبويب المتصفح",
              },
              { path: "meta.description", label: "وصف الموقع", type: "area" },
            ],
          },
        ],
      },
      {
        title: "الهوية",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "brand.ar", label: "الاسم بالعربية" },
              { path: "brand.en", label: "الاسم بالإنجليزية" },
              { path: "preloader.title", label: "عنوان شاشة البداية" },
              { path: "preloader.tagline", label: "سطر شاشة البداية" },
            ],
          },
        ],
      },
      {
        title: "القائمة العلوية",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "nav.home", label: "الرئيسية" },
              { path: "nav.about", label: "من نحن" },
              { path: "nav.services", label: "خدماتنا" },
              { path: "nav.network", label: "انتشارنا" },
              { path: "nav.contact", label: "تواصل معنا" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "legal",
    label: "الخصوصية والشروط",
    icon: "⚖",
    hint: "صفحة السياسات القانونية",
    sections: [
      {
        title: "الترويسة",
        blocks: [
          {
            kind: "fields",
            fields: [
              { path: "legal.heading", label: "العنوان", type: "area" },
              { path: "legal.updated", label: "سطر آخر تحديث" },
            ],
          },
        ],
      },
      {
        title: "سياسة الخصوصية",
        blocks: [
          {
            kind: "list",
            path: "legal.privacy",
            label: "بنود الخصوصية",
            itemLabel: "بند",
            titleField: "h",
            addable: true,
            fields: [
              { path: "h", label: "العنوان" },
              { path: "p", label: "النص", type: "area" },
            ],
          },
        ],
      },
      {
        title: "شروط الاستخدام",
        blocks: [
          {
            kind: "list",
            path: "legal.terms",
            label: "بنود الشروط",
            itemLabel: "بند",
            titleField: "h",
            addable: true,
            fields: [
              { path: "h", label: "العنوان" },
              { path: "p", label: "النص", type: "area" },
            ],
          },
        ],
      },
    ],
  },
];

export const findGroup = (id: string) => CONTENT_GROUPS.find((g) => g.id === id);

/** Every block in a group, flattened — used when building the save payload. */
export function groupBlocks(group: Group): Block[] {
  return group.sections.flatMap((s) => s.blocks);
}
