import type {
  CategoryDefinition,
  CategorySection,
} from "@/lib/types";

export const SECTION_META: Record<
  CategorySection,
  { label: string; eyebrow: string; description: string }
> = {
  foundation: {
    label: "Dinh dưỡng nền tảng",
    eyebrow: "Nền 01",
    description: "Vitamin, khoáng chất, hệ tiêu hóa và hoạt chất nền tảng.",
  },
  "body-goal": {
    label: "Theo mục tiêu",
    eyebrow: "Đích 02",
    description: "Khám phá theo nhu cầu thường được người dùng tìm kiếm.",
  },
  "life-stage": {
    label: "Theo giai đoạn sống",
    eyebrow: "Đời 03",
    description: "Các công thức được định vị cho từng nhóm tuổi và giai đoạn.",
  },
  sport: {
    label: "Thể thao & hiệu suất",
    eyebrow: "Lực 04",
    description: "Protein, sức bền, phục hồi và dinh dưỡng quanh buổi tập.",
  },
};

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "vitamins-multivitamins",
    section: "foundation",
    label: "Vitamin & đa vitamin",
    description: "Vitamin đơn chất, B-complex và công thức đa vitamin.",
    queries: ["multivitamin", "vitamin d3", "vitamin c", "b complex"],
    tagHints: ["en:vitamin-supplements", "en:multivitamin-supplements"],
    aliases: ["vitamin", "đa vitamin", "multivitamin"],
  },
  {
    id: "minerals",
    section: "foundation",
    label: "Khoáng chất",
    description: "Magiê, kẽm, canxi, sắt và các khoáng chất bổ sung.",
    queries: ["magnesium", "zinc", "calcium", "iron supplement"],
    tagHints: ["en:mineral-supplements"],
    aliases: ["khoáng chất", "canxi", "kẽm", "magiê"],
  },
  {
    id: "essential-fatty-acids",
    section: "foundation",
    label: "Omega & acid béo",
    description: "Omega-3, dầu cá, dầu nhuyễn thể, DHA và EPA.",
    queries: ["omega 3", "fish oil", "krill oil", "cod liver oil"],
    tagHints: ["en:omega-3-supplements", "en:fish-oils"],
    aliases: ["omega", "omega 3", "dầu cá", "acid béo"],
  },
  {
    id: "amino-acids-general",
    section: "foundation",
    label: "Acid amin",
    description: "Acid amin đơn lẻ và công thức bổ sung hằng ngày.",
    queries: ["amino acid", "l-arginine", "l-glutamine", "l-lysine"],
    tagHints: ["en:amino-acid-supplements"],
    aliases: ["acid amin", "amino acid"],
  },
  {
    id: "probiotics-synbiotics",
    section: "foundation",
    label: "Probiotic & synbiotic",
    description: "Men vi sinh và công thức kết hợp probiotic–prebiotic.",
    queries: ["probiotic", "synbiotic", "lactobacillus", "bifidobacterium"],
    tagHints: ["en:probiotic-supplements"],
    aliases: ["probiotic", "men vi sinh", "synbiotic"],
  },
  {
    id: "prebiotics-fiber",
    section: "foundation",
    label: "Prebiotic & chất xơ",
    description: "Psyllium, inulin và các nguồn chất xơ bổ sung.",
    queries: ["prebiotic", "fiber supplement", "psyllium", "inulin"],
    tagHints: ["en:prebiotic-supplements", "en:fibre-supplements"],
    aliases: ["prebiotic", "chất xơ", "fiber"],
  },
  {
    id: "digestive-enzymes",
    section: "foundation",
    label: "Enzyme tiêu hóa",
    description: "Lactase, bromelain, papain và hỗn hợp enzyme.",
    queries: ["digestive enzyme", "lactase", "bromelain", "papain"],
    tagHints: ["en:digestive-enzyme-supplements"],
    aliases: ["enzyme tiêu hóa", "men tiêu hóa", "lactase"],
  },
  {
    id: "herbal-botanicals",
    section: "foundation",
    label: "Thảo dược & chiết xuất",
    description: "Nhân sâm, nghệ, kế sữa và các chiết xuất thực vật.",
    queries: ["ginseng", "turmeric extract", "milk thistle", "herbal supplement"],
    tagHints: ["en:herbal-supplements", "en:plant-extracts"],
    aliases: ["thảo dược", "nhân sâm", "nghệ", "chiết xuất"],
  },
  {
    id: "mushrooms-adaptogens",
    section: "foundation",
    label: "Nấm & adaptogen",
    description: "Lion's mane, đông trùng hạ thảo, linh chi và ashwagandha.",
    queries: ["lion's mane", "cordyceps", "reishi", "ashwagandha"],
    tagHints: [],
    aliases: ["adaptogen", "nấm", "đông trùng", "linh chi"],
  },
  {
    id: "antioxidants-bioactives",
    section: "foundation",
    label: "Chống oxy hóa & hoạt chất",
    description: "CoQ10, resveratrol, NAC và alpha-lipoic acid.",
    queries: ["coq10", "resveratrol", "nac", "alpha lipoic acid"],
    tagHints: [],
    aliases: ["chống oxy hóa", "coq10", "resveratrol", "nac"],
  },
  {
    id: "greens-algae-superfoods",
    section: "foundation",
    label: "Tảo, rau xanh & superfood",
    description: "Spirulina, chlorella và hỗn hợp bột rau xanh.",
    queries: ["greens powder", "spirulina", "chlorella", "superfood powder"],
    tagHints: ["en:algae-food-supplements"],
    aliases: ["tảo", "rau xanh", "spirulina", "superfood"],
  },
  {
    id: "other-specialty",
    section: "foundation",
    label: "Bổ sung chuyên biệt khác",
    description: "Các sản phẩm bổ sung chưa đủ dữ liệu để vào nhóm hẹp hơn.",
    queries: ["dietary supplement", "food supplement", "nutraceutical"],
    tagHints: ["en:dietary-supplements", "en:food-supplements"],
    aliases: ["thực phẩm bổ sung", "thực phẩm chức năng", "khác"],
  },
  {
    id: "immune",
    section: "body-goal",
    label: "Miễn dịch",
    description: "Nhóm thường được tìm cùng vitamin C, kẽm và elderberry.",
    queries: ["immune support", "elderberry", "vitamin c zinc"],
    tagHints: [],
    aliases: ["miễn dịch", "đề kháng", "immune"],
  },
  {
    id: "bone",
    section: "body-goal",
    label: "Xương",
    description: "Canxi, vitamin D và K2 trong nhóm hỗ trợ dinh dưỡng xương.",
    queries: ["bone health", "calcium vitamin d", "vitamin k2"],
    tagHints: [],
    aliases: ["xương", "bone health"],
  },
  {
    id: "joint-mobility",
    section: "body-goal",
    label: "Khớp & vận động",
    description: "Glucosamine, chondroitin và MSM.",
    queries: ["joint supplement", "glucosamine", "chondroitin", "msm"],
    tagHints: [],
    aliases: ["khớp", "xương khớp", "vận động"],
  },
  {
    id: "heart-circulation",
    section: "body-goal",
    label: "Tim mạch & tuần hoàn",
    description: "CoQ10, omega-3 và các công thức định vị cho tim mạch.",
    queries: ["heart health", "coq10", "omega 3", "garlic extract"],
    tagHints: [],
    aliases: ["tim mạch", "tuần hoàn", "heart"],
  },
  {
    id: "brain-focus",
    section: "body-goal",
    label: "Não bộ & tập trung",
    description: "Nootropic, lion's mane và nhóm sản phẩm tập trung.",
    queries: ["brain supplement", "focus supplement", "nootropic", "lion's mane"],
    tagHints: [],
    aliases: ["não bộ", "tập trung", "nootropic"],
  },
  {
    id: "sleep-stress",
    section: "body-goal",
    label: "Giấc ngủ & căng thẳng",
    description: "Melatonin, magnesium glycinate và nhóm thư giãn.",
    queries: ["sleep supplement", "melatonin", "magnesium glycinate", "stress support"],
    tagHints: [],
    aliases: ["giấc ngủ", "ngủ", "căng thẳng", "stress"],
  },
  {
    id: "gut-digestion",
    section: "body-goal",
    label: "Đường ruột & tiêu hóa",
    description: "Probiotic, enzyme và sản phẩm định vị cho tiêu hóa.",
    queries: ["gut health", "digestive support", "probiotic", "digestive enzyme"],
    tagHints: [],
    aliases: ["đường ruột", "tiêu hóa", "gut health"],
  },
  {
    id: "vision",
    section: "body-goal",
    label: "Thị lực",
    description: "Lutein, zeaxanthin và bilberry.",
    queries: ["eye health", "lutein zeaxanthin", "bilberry"],
    tagHints: [],
    aliases: ["thị lực", "mắt", "lutein"],
  },
  {
    id: "skin-hair-nails",
    section: "body-goal",
    label: "Da, tóc & móng",
    description: "Collagen, biotin và công thức beauty supplement.",
    queries: ["collagen", "biotin", "hair skin nails", "beauty supplement"],
    tagHints: ["en:collagen-supplements"],
    aliases: ["da tóc móng", "collagen", "biotin", "làm đẹp"],
  },
  {
    id: "liver",
    section: "body-goal",
    label: "Gan",
    description: "Kế sữa, atisô và nhóm sản phẩm định vị cho gan.",
    queries: ["liver support", "milk thistle", "artichoke extract"],
    tagHints: [],
    aliases: ["gan", "kế sữa", "atisô"],
  },
  {
    id: "urinary",
    section: "body-goal",
    label: "Tiết niệu",
    description: "Cranberry và D-mannose.",
    queries: ["urinary health", "cranberry", "d mannose"],
    tagHints: [],
    aliases: ["tiết niệu", "cranberry"],
  },
  {
    id: "metabolism-weight",
    section: "body-goal",
    label: "Chuyển hóa & cân nặng",
    description: "Chất xơ và sản phẩm định vị cho quản lý cân nặng.",
    queries: ["weight management", "metabolism supplement", "appetite fiber"],
    tagHints: [],
    aliases: ["cân nặng", "giảm cân", "chuyển hóa"],
  },
  {
    id: "glucose-metabolism",
    section: "body-goal",
    label: "Chuyển hóa đường",
    description: "Berberine, chromium và nhóm glucose metabolism.",
    queries: ["glucose metabolism", "berberine", "chromium supplement"],
    tagHints: [],
    aliases: ["đường huyết", "berberine", "chuyển hóa đường"],
  },
  {
    id: "energy-fatigue",
    section: "body-goal",
    label: "Năng lượng hằng ngày",
    description: "B-complex, sắt, nhân sâm và nhóm năng lượng.",
    queries: ["energy supplement", "b complex", "iron supplement", "ginseng"],
    tagHints: [],
    aliases: ["năng lượng", "mệt mỏi", "energy"],
  },
  {
    id: "prenatal-maternal",
    section: "life-stage",
    label: "Thai kỳ & sau sinh",
    description: "Prenatal, postnatal và công thức cho thai kỳ.",
    queries: ["prenatal", "prenatal vitamin", "postnatal"],
    tagHints: ["en:prenatal-supplements"],
    aliases: ["thai kỳ", "sau sinh", "prenatal"],
  },
  {
    id: "women",
    section: "life-stage",
    label: "Dành cho nữ",
    description: "Công thức được nhà sản xuất định vị cho phụ nữ.",
    queries: ["women's supplement", "women multivitamin"],
    tagHints: [],
    aliases: ["dành cho nữ", "phụ nữ", "women"],
  },
  {
    id: "men",
    section: "life-stage",
    label: "Dành cho nam",
    description: "Công thức được nhà sản xuất định vị cho nam giới.",
    queries: ["men's supplement", "men multivitamin"],
    tagHints: [],
    aliases: ["dành cho nam", "nam giới", "men"],
  },
  {
    id: "children-teens",
    section: "life-stage",
    label: "Trẻ em & thiếu niên",
    description: "Vitamin và sản phẩm bổ sung dành cho trẻ em, thiếu niên.",
    queries: ["children's supplement", "kids multivitamin", "teen supplement"],
    tagHints: ["en:children-supplements"],
    aliases: ["trẻ em", "thiếu niên", "kids"],
  },
  {
    id: "seniors",
    section: "life-stage",
    label: "Người lớn tuổi",
    description: "Công thức 50+ và sản phẩm định vị cho người lớn tuổi.",
    queries: ["senior supplement", "50 plus multivitamin", "elderly nutrition"],
    tagHints: [],
    aliases: ["người lớn tuổi", "người già", "senior", "50+"],
  },
  {
    id: "whey-protein",
    section: "sport",
    label: "Whey protein",
    description: "Whey concentrate, isolate và hydrolyzed whey.",
    queries: ["whey protein", "whey isolate", "whey concentrate"],
    tagHints: ["en:whey-proteins", "en:protein-powders"],
    aliases: ["whey", "whey protein", "đạm whey"],
  },
  {
    id: "casein-protein",
    section: "sport",
    label: "Casein protein",
    description: "Micellar casein và protein tiêu hóa chậm.",
    queries: ["casein protein", "micellar casein"],
    tagHints: ["en:protein-powders"],
    aliases: ["casein", "casein protein"],
  },
  {
    id: "plant-protein",
    section: "sport",
    label: "Protein thực vật",
    description: "Đạm đậu Hà Lan, đậu nành, gạo và hỗn hợp thực vật.",
    queries: ["plant protein", "pea protein", "soy protein", "rice protein"],
    tagHints: ["en:plant-based-protein-powders", "en:protein-powders"],
    aliases: ["protein thực vật", "pea protein", "đạm thực vật"],
  },
  {
    id: "protein-blends-other",
    section: "sport",
    label: "Protein hỗn hợp & loại khác",
    description: "Protein blend, egg protein và các nguồn đạm khác.",
    queries: ["protein blend", "egg protein", "beef protein"],
    tagHints: ["en:protein-powders"],
    aliases: ["protein hỗn hợp", "protein blend"],
  },
  {
    id: "mass-gainer",
    section: "sport",
    label: "Mass gainer",
    description: "Bột giàu năng lượng được định vị cho mục tiêu tăng khối lượng.",
    queries: ["mass gainer", "weight gainer", "high calorie protein"],
    tagHints: ["en:mass-gainers", "en:bodybuilding-supplements"],
    aliases: ["mass gainer", "tăng cân", "tăng cơ"],
  },
  {
    id: "creatine",
    section: "sport",
    label: "Creatine",
    description: "Creatine monohydrate và các dạng creatine khác.",
    queries: ["creatine monohydrate", "creatine"],
    tagHints: ["en:creatine-supplements", "en:bodybuilding-supplements"],
    aliases: ["creatine"],
  },
  {
    id: "bcaa-eaa-sport-amino",
    section: "sport",
    label: "BCAA, EAA & acid amin",
    description: "BCAA, EAA, glutamine và acid amin quanh buổi tập.",
    queries: ["bcaa", "eaa", "sports amino", "glutamine powder"],
    tagHints: ["en:amino-acid-supplements", "en:bodybuilding-supplements"],
    aliases: ["bcaa", "eaa", "acid amin thể thao"],
  },
  {
    id: "pre-workout",
    section: "sport",
    label: "Trước buổi tập",
    description: "Pre-workout có hoặc không caffeine.",
    queries: ["pre workout", "preworkout", "caffeine pre workout"],
    tagHints: ["en:pre-workout-supplements", "en:bodybuilding-supplements"],
    aliases: ["pre workout", "trước tập", "tiền tập"],
  },
  {
    id: "hydration-electrolytes",
    section: "sport",
    label: "Bù nước & điện giải",
    description: "Bột điện giải, đồ uống thể thao và công thức hydration.",
    queries: ["electrolyte", "hydration", "isotonic", "sports drink"],
    tagHints: ["en:electrolyte-drinks", "en:sports-drinks"],
    aliases: ["điện giải", "bù nước", "hydration"],
  },
  {
    id: "endurance-carbohydrate",
    section: "sport",
    label: "Sức bền & carbohydrate",
    description: "Gel năng lượng, sports chews và carbohydrate trong vận động.",
    queries: ["energy gel", "carbohydrate drink", "endurance fuel", "sports chews"],
    tagHints: ["en:energy-gels", "en:sports-drinks"],
    aliases: ["sức bền", "gel năng lượng", "carbohydrate"],
  },
  {
    id: "recovery-post-workout",
    section: "sport",
    label: "Phục hồi sau tập",
    description: "Đồ uống và công thức được định vị cho sau buổi tập.",
    queries: ["post workout", "recovery drink", "recovery protein"],
    tagHints: ["en:bodybuilding-supplements"],
    aliases: ["phục hồi", "sau tập", "post workout"],
  },
  {
    id: "protein-bars-rtd",
    section: "sport",
    label: "Thanh & đồ uống protein",
    description: "Protein bar, RTD protein và protein shake.",
    queries: ["protein bar", "protein drink", "protein shake"],
    tagHints: ["en:protein-bars", "en:protein-drinks"],
    aliases: ["thanh protein", "protein bar", "protein shake"],
  },
  {
    id: "meal-replacement",
    section: "sport",
    label: "Thay thế bữa ăn",
    description: "Shake, bột và đồ uống dinh dưỡng hoàn chỉnh.",
    queries: ["meal replacement", "complete nutrition drink"],
    tagHints: ["en:meal-replacements"],
    aliases: ["thay thế bữa ăn", "meal replacement"],
  },
  {
    id: "performance-compounds",
    section: "sport",
    label: "Hoạt chất hiệu suất",
    description: "Beta-alanine, citrulline, HMB và L-carnitine.",
    queries: ["beta alanine", "citrulline malate", "hmb", "l carnitine"],
    tagHints: ["en:bodybuilding-supplements"],
    aliases: ["hiệu suất", "beta alanine", "citrulline", "hmb"],
  },
];

export const CATEGORY_BY_ID = new Map(
  CATEGORIES.map((category) => [category.id, category]),
);

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

export function resolveCategoryFromQuery(query: string) {
  const normalized = normalizeText(query);
  if (!normalized) return null;

  return (
    CATEGORIES.find((category) =>
      [category.label, ...category.aliases]
        .map(normalizeText)
        .some((alias) => alias === normalized),
    ) ?? null
  );
}

const BROAD_TAGS = new Set([
  "en:dietary-supplements",
  "en:food-supplements",
  "en:bodybuilding-supplements",
  "en:protein-powders",
]);

export function classifyProduct(
  name: string,
  tags: string[],
  requestedCategoryId?: string | null,
) {
  const normalizedName = normalizeText(name);
  const normalizedTags = new Set(tags.map((tag) => tag.toLowerCase()));
  const scored = CATEGORIES.map((category) => {
    const exactTag = category.tagHints.some(
      (tag) => !BROAD_TAGS.has(tag) && normalizedTags.has(tag),
    );
    const phraseMatch = category.queries.some((query) => {
      const phrase = normalizeText(query);
      return phrase.length >= 3 && normalizedName.includes(phrase);
    });
    const requested = category.id === requestedCategoryId;
    const score = requested ? 1 : exactTag ? 0.95 : phraseMatch ? 0.75 : 0;
    return { id: category.id, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return {
      primaryCategoryId: requestedCategoryId ?? "other-specialty",
      categoryIds: [requestedCategoryId ?? "other-specialty"],
      confidence: requestedCategoryId ? 1 : 0.5,
    };
  }

  return {
    primaryCategoryId: scored[0].id,
    categoryIds: scored.slice(0, 4).map((item) => item.id),
    confidence: scored[0].score,
  };
}
