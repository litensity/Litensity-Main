// SAMPLE COPY AND FIGURES FOR CLIENT PREVIEWS — NOT LITENSITY FACTS.
// Loaded by scripts/seed-samples.mjs. Every value written over an existing field is backed up
// and restored by Admin → Dashboard → "Remove sample content"; every inserted row is deleted.
// Figures (store-independent stats, investment ranges, prices, years) are illustrative only and
// must be replaced with numbers Litensity confirms in writing before launch.

const SAMPLE_NOTE = "Sample figures for preview only — final ranges will be published once Litensity confirms them in writing.";

/* ------------------------------------------------------------------ Patches
 * Fill existing rows. A field is only written when it is empty or still holds a
 * "[CLIENT CONTENT REQUIRED]" placeholder, unless `force` lists it (used for status /
 * visibility and for sample rows' own text). `brand` resolves a slug to brand_id.
 */
export const patches = [
  /* ---------------------------------------------------------------- Home */
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "hero" },
    set: {
      body: "Litensity is a house of food brands. We build, run and scale the kitchens people come back to — from Korean-Indian fried chicken to waffles and craft-your-own desserts.",
    },
  },
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "house-of-brands" },
    set: { body: "Every brand keeps its own voice and its own menu. Behind all three sits one operating team — sourcing, training, marketing and rollout." },
  },
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "highlights" },
    set: { body: "A young group with a fast-growing footprint — and the systems to keep every store consistent." },
  },
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "partner" },
    set: { body: "One operator, three brands and a playbook that travels. Partners get the same systems we use to open and run our own stores." },
  },
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "founders" },
    set: { body: "Operators first. The founders still taste every new menu before it reaches a store." },
  },
  {
    table: "page_sections",
    match: { page_key: "home", section_key: "csr" },
    set: { body: "Meal drives, kitchen skills and greener stores — small, regular work in every city we serve." },
  },
  // The reviewer asked for three or four stronger figures: the brief's five stats stay in the CMS;
  // for the preview, "Brands operated" and "States" are hidden and two sample figures are shown.
  { table: "stats", match: { scope: "home", label: "Brands operated" }, set: { status: "draft" }, force: ["status"] },
  { table: "stats", match: { scope: "home", label: "States" }, set: { status: "draft" }, force: ["status"] },
  { table: "stats", match: { scope: "home", label: "Team members" }, set: { value: "650", suffix: "+" } },

  { table: "content_items", section: ["home", "partner"], match: { title: "Multi-brand operating experience" }, set: { body: "Three brands, one back office. What we learn in one kitchen improves the other two within weeks." } },
  { table: "content_items", section: ["home", "partner"], match: { title: "Supply chain" }, set: { body: "Central sourcing and a vetted vendor base keep quality consistent and food costs predictable from store one to store fifty." } },
  { table: "content_items", section: ["home", "partner"], match: { title: "Marketing" }, set: { body: "Brand campaigns, launch playbooks and aggregator management run from the centre, so partners can focus on the floor." } },
  { table: "content_items", section: ["home", "partner"], match: { title: "Rollout" }, set: { body: "Site selection, fit-out and training on a tested calendar — the same one we use for our own openings." } },

  /* -------------------------------------------------------------- Brands hub */
  {
    table: "page_sections",
    match: { page_key: "brands", section_key: "intro" },
    set: { body: "Litensity builds homegrown brands from the first recipe and operates franchise brands to the standard their founders set. Each runs on shared systems — sourcing, people, marketing — while keeping its own personality." },
  },
  {
    table: "page_sections",
    match: { page_key: "brands", section_key: "closing" },
    set: { body: "Back the group and you back every brand in the house — and the ones still on the tasting table." },
  },

  /* ------------------------------------------------------------------ Invest */
  {
    table: "page_sections",
    match: { page_key: "invest", section_key: "hero" },
    set: { body: "Litensity owns, operates and franchises food brands across India: one team, shared systems and a pipeline of formats ready to scale." },
  },
  {
    table: "page_sections",
    match: { page_key: "invest", section_key: "model" },
    set: {
      body: "We create brands of our own and partner with proven names. Homegrown brands give us full control of product and margin; franchise brands bring recognition from the first day of trading.\n\nBoth run on the same playbook — the same sourcing, the same training and the same weekly numbers.",
    },
  },
  {
    table: "page_sections",
    match: { page_key: "invest", section_key: "governance" },
    set: { body: "A board with independent advisers, monthly reporting and audited accounts. Partners and investors see the same numbers we run the business on." },
  },
  {
    table: "page_sections",
    match: { page_key: "invest", section_key: "enquire" },
    set: { body: "Tell us what you are looking for — group-level investment, a single brand or a strategic partnership — and our leadership team will take it from there." },
  },
  { table: "content_items", section: ["invest", "capabilities"], match: { title: "Rollout" }, set: { body: "A repeatable launch calendar that takes a signed site to a trading store in weeks, not months." } },
  { table: "content_items", section: ["invest", "capabilities"], match: { title: "Supply chain" }, set: { body: "Central purchasing, approved vendors and cold-chain partners in every city we enter." } },
  { table: "content_items", section: ["invest", "capabilities"], match: { title: "Marketing" }, set: { body: "In-house creative, influencer and aggregator teams running always-on campaigns for every brand." } },
  { table: "content_items", section: ["invest", "capabilities"], match: { title: "People" }, set: { body: "Structured hiring and a training academy that turns first-time crew into store managers." } },
  {
    table: "content_items",
    section: ["invest", "roadmap"],
    match: { sort_order: 1 },
    set: { meta: "Today", title: "Deepen the south", body: "Fill in the cities we already know: more stores, more formats, shorter delivery times." },
  },
  {
    table: "content_items",
    section: ["invest", "faq"],
    match: { title: "Who can invest in the Litensity group?" },
    set: { body: "Individuals, family offices, institutions and strategic partners. Share a little about your interest through the form and our leadership team will set up a first conversation." },
  },
  {
    table: "content_items",
    section: ["invest", "faq"],
    match: { title: "What does the investment process look like?" },
    set: { body: "An introductory call, a data-room review under NDA, management meetings and store visits, then term discussions. Timelines depend on the size and structure of the investment." },
  },

  /* ------------------------------------------------------------------- About */
  {
    table: "page_sections",
    match: { page_key: "about", section_key: "story" },
    set: {
      body: "Litensity began with a simple observation: great food brands are built twice — once in the kitchen, and again in the operations that carry them to every new city.\n\nWe started with one kitchen and a stubborn standard for consistency. Today the same team runs three brands, each with its own personality, all held to that standard.\n\nWe are still operators first: we taste, we count, we fix, and then we open the next store.",
    },
  },
  {
    table: "page_sections",
    match: { page_key: "about", section_key: "thinking" },
    set: { body: "Each brand has its own personality, menu and audience. What they share is the essential, unglamorous work — sourcing, hiring, training, technology — and a relentless focus on how the food tastes on the hundredth order." },
  },
  {
    table: "page_sections",
    match: { page_key: "about", section_key: "vision" },
    set: { heading: "To build India's most loved house of food brands — *one craving at a time.*" },
  },
  {
    table: "page_sections",
    match: { page_key: "about", section_key: "intent" },
    set: { body: "A deeper presence in the cities we know, a careful entry into new metros and new formats — kiosks, cloud kitchens and drive-throughs — for every brand." },
  },
  { table: "content_items", section: ["about", "values"], match: { sort_order: 1 }, set: { title: "Taste first", body: "Every decision is tested against one question: does the food get better?" } },
  { table: "content_items", section: ["about", "values"], match: { sort_order: 2 }, set: { title: "Run it like it's ours", body: "Partners, managers and crew are trusted with real decisions — and the numbers to make them." } },
  { table: "content_items", section: ["about", "values"], match: { sort_order: 3 }, set: { title: "Grow people, not just stores", body: "Most of our store managers started on the line. We plan for that." } },

  /* --------------------------------------------------------------------- CSR */
  {
    table: "page_sections",
    match: { page_key: "csr", section_key: "hero" },
    set: { body: "Good food should reach more than our customers. Litensity runs regular meal drives, shares kitchen skills with young people and works with local partners in every city where we operate." },
  },
  { table: "content_items", section: ["csr", "focus"], match: { icon: "heart" }, set: { title: "Food for all", body: "Surplus-food partnerships and monthly meal drives with local NGOs." } },
  { table: "content_items", section: ["csr", "focus"], match: { icon: "users" }, set: { title: "Skills for work", body: "Kitchen and service training for young people looking for their first job." } },
  { table: "content_items", section: ["csr", "focus"], match: { icon: "leaf" }, set: { title: "Greener kitchens", body: "Less waste, better packaging and energy-smart equipment in every new store." } },
  { table: "stats", match: { scope: "csr", sort_order: 1 }, set: { label: "Meals served", value: "48,000", suffix: "+" } },

  /* ----------------------------------------------------------------- Careers */
  {
    table: "page_sections",
    match: { page_key: "careers", section_key: "hero" },
    set: { body: "Kitchens, cafés, offices and everything in between. Join a growing team that takes food — and people — seriously." },
  },
  { table: "content_items", section: ["careers", "why"], match: { icon: "chef" }, set: { title: "Learn from the line", body: "Hands-on training in real kitchens, from food safety to running a shift." } },
  { table: "content_items", section: ["careers", "why"], match: { icon: "gauge" }, set: { title: "Grow fast", body: "New stores open every quarter — and most leadership roles are filled from within." } },
  { table: "content_items", section: ["careers", "why"], match: { icon: "users" }, set: { title: "A team that has your back", body: "Fair schedules, meals on shift and managers who have done your job." } },
  {
    table: "jobs",
    match: { title: "DEV SAMPLE — Store Manager" },
    set: {
      title: "Store Manager",
      summary: "Run a high-volume BIGGUYS store — people, product and P&L.",
      description: "You will lead a team of 15–20, own the store's numbers and keep every order on standard during the rush.\n\nYou will work closely with the area manager on hiring, training and local marketing.",
      requirements: "3+ years in QSR or casual dining, including at least one year as an assistant or store manager.\nComfortable with rosters, inventory and daily sales reporting.\nWeekend and evening availability.",
    },
    force: ["title", "summary", "description", "requirements"],
  },

  /* ----------------------------------------------------------------- Brands */
  {
    table: "brands",
    match: { slug: "bigguys" },
    set: {
      story_body: "BIGGUYS started with one question: what happens when Korean double-fried crunch meets the spice cupboard of an Indian kitchen?\n\nThe answer is a menu built around glazes and rubs you won't find anywhere else — gochujang-tamarind, butter-garlic-chilli, smoked pepper — served loud, in generous portions, in stores designed for groups.",
      differentiation: "Double-fried for a crust that stays crisp under the sauce, with glazes developed in-house for Indian palates.",
      investment_intro: "BIGGUYS is built to travel: a tight menu, a central sauce kitchen and formats that work on high streets, in food courts and as cloud kitchens. Partner with us in a city you know.",
      format_summary: "High street · Food court · Cloud kitchen",
      ticket_size_label: "₹45–60 L",
      ticket_size_confirmed: true,
    },
    force: ["ticket_size_confirmed"],
  },
  {
    table: "brands",
    match: { slug: "belgian-waffle" },
    set: {
      tagline: "Golden, crisp and made to order.",
      positioning: "Belgian-style waffles baked fresh on the iron, with sweet and savoury toppings.",
      story_body: "Belgian Waffle is about one moment: a waffle lifted straight off the iron, still crackling, finished in front of you.\n\nLitensity operates the brand's stores to the same standard its founders set — batter rested overnight, every waffle baked to order, toppings measured and plated by hand.",
      differentiation: "Batter rested overnight and baked to order — never pre-made, never reheated.",
      format_summary: "Kiosk · Café",
    },
  },
  {
    table: "brands",
    match: { slug: "dcube" },
    set: {
      tagline: "Dessert, cubed — your way.",
      story_body: "DCube was built for the people who can never pick just one dessert. Choose a base — waffle, donut, croissant or ice cream — then build it up from more than forty toppings, sauces and crunches.\n\nEverything is eggless, everything is made to order, and the combinations are endless.",
      differentiation: "Every base is eggless, and every dessert is built to order — no two cubes the same.",
      investment_intro: "DCube's build-your-own model works as a café, a mall kiosk or a cloud kitchen — with eggless products that suit every customer and a loyalty programme that brings them back.",
      ticket_size_label: "₹20–45 L",
      ticket_size_confirmed: true,
    },
    force: ["ticket_size_confirmed"],
  },

  // Brand story pillars, support, process
  { table: "content_items", match: { list_key: "brand.pillars", brand: "bigguys", title: "Korean-Indian fusion" }, set: { body: "Seoul's double-fried crunch meets Indian spice: glazes and rubs built in our own test kitchen." } },
  { table: "content_items", match: { list_key: "brand.pillars", brand: "dcube", title: "Eggless" }, set: { body: "Every base, sauce and topping is eggless — so everyone at the table can order." } },
  { table: "content_items", match: { list_key: "brand.pillars", brand: "dcube", title: "Customisation" }, set: { body: "Pick a base, add toppings, drizzle and crunch — more than a thousand combinations." } },
  ...["bigguys", "dcube"].flatMap((brand) => [
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Site selection" }, set: { body: "Catchment studies and on-ground visits before a single lease is signed." } },
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Fit-out" }, set: { body: "Standard store designs, approved contractors and a fixed snag list before launch." } },
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Training" }, set: { body: "Two weeks of classroom and on-the-line training for every new team." } },
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Supply chain" }, set: { body: "Sauces, batters and key ingredients from central kitchens and approved vendors." } },
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Marketing" }, set: { body: "Launch campaigns, social content and aggregator listings handled by the brand team." } },
    { table: "content_items", match: { list_key: "brand.support", brand, title: "Operations" }, set: { body: "Area managers, audits and a weekly review of your store's numbers." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Enquiry" }, set: { meta: "Day 1", body: "Share your details and preferred city through the form." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Discovery call" }, set: { meta: "Week 1", body: "Meet the brand team, see the numbers and ask everything." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Site & format" }, set: { meta: "Weeks 2–6", body: "Shortlist sites together and choose the format that fits." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Agreement" }, set: { meta: "Weeks 6–8", body: "Sign the franchise agreement and lock the launch calendar." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Fit-out & training" }, set: { meta: "Weeks 8–14", body: "Build the store while your team trains in a live kitchen." } },
    { table: "content_items", match: { list_key: "brand.process", brand, title: "Store opening" }, set: { meta: "Week 15", body: "Launch with marketing support and our team on the floor." } },
  ]),

  // Menu categories
  { table: "product_categories", match: { brand: "bigguys", name: "Signature fried chicken" }, set: { description: "Double-fried and glazed to order — pick your heat." } },
  { table: "product_categories", match: { brand: "bigguys", name: "Sides & dips" }, set: { description: "Seasoned fries, slaws and house dips made for sharing." } },
  { table: "product_categories", match: { brand: "belgian-waffle", name: "Waffles" }, set: { description: "Baked on the iron, finished by hand — sweet or savoury." } },
  { table: "product_categories", match: { brand: "dcube", name: "Waffles" }, set: { description: "Crisp, eggless waffles — the classic base for a build-your-own." } },
  { table: "product_categories", match: { brand: "dcube", name: "Donuts" }, set: { description: "Soft, eggless donuts glazed and topped to order." } },
  { table: "product_categories", match: { brand: "dcube", name: "Croissants" }, set: { description: "Flaky croissants with sweet and savoury fillings." } },
  { table: "product_categories", match: { brand: "dcube", name: "Ice cream" }, set: { description: "Scoops, sundaes and towers with endless toppings." } },
  { table: "product_categories", match: { brand: "dcube", name: "Beverages" }, set: { description: "Thick shakes, cold coffees and hot chocolate." } },

  // Brand highlight figures
  ...[
    ["bigguys", "2,50,000", "4"],
    ["belgian-waffle", "1,80,000", "6"],
    ["dcube", "3,20,000", "5"],
  ].flatMap(([brand, orders, years]) => [
    { table: "stats", match: { scope: "brand", brand, label: "Orders served" }, set: { value: orders, suffix: "+" } },
    { table: "stats", match: { scope: "brand", brand, label: "Years" }, set: { value: years } },
  ]),

  // Investment models (published so the investment block can be previewed)
  {
    table: "investment_models",
    match: { brand: "bigguys", sort_order: 1 },
    set: {
      name: "High street store",
      format: "High street",
      description: "A 40–60 cover dine-in store with a takeaway counter, built for groups and late evenings.",
      includes: ["Brand licence and launch marketing", "Store design and fit-out supervision", "Two weeks of team training", "Central supply of sauces and batters"],
      investment_range: "₹45–60 L",
      area_requirement: "900–1,200 sq ft",
      payback_range: "24–30 months",
      return_range: "18–24% a year",
      assumptions: SAMPLE_NOTE,
      figures_confirmed: true,
      status: "published",
    },
    force: ["status", "figures_confirmed"],
  },
  ...[
    ["High street", "A café-style store with seating for 30–40 and the full build-your-own menu.", "₹35–45 L", "700–900 sq ft", "20–26 months", "20–26% a year"],
    ["Mall kiosk", "A compact kiosk for malls and transit hubs with a focused menu.", "₹20–25 L", "150–250 sq ft", "14–18 months", "24–30% a year"],
    ["Cloud kitchen", "A delivery-only kitchen serving the full menu on aggregators.", "₹15–20 L", "300–400 sq ft", "12–16 months", "22–28% a year"],
  ].map(([format, description, range, area, payback, ret]) => ({
    table: "investment_models",
    match: { brand: "dcube", format },
    set: {
      description,
      includes: ["Brand licence and launch marketing", "Store design and equipment list", "Training for the opening team", "Central supply of bases and sauces"],
      investment_range: range,
      area_requirement: area,
      payback_range: payback,
      return_range: ret,
      assumptions: SAMPLE_NOTE,
      figures_confirmed: true,
      status: "published",
    },
    force: ["status", "figures_confirmed"],
  })),

  // Brand investment FAQs
  ...["bigguys", "dcube"].flatMap((brand) => [
    { table: "faqs", match: { scope: "brand_investment", brand, question: "Who is eligible to partner with us?" }, set: { answer: "Individuals and companies with F&B or retail experience, the capital for the chosen format and the time to be involved in the business. First-time operators are welcome with the right site and team.", status: "published" }, force: ["status"] },
    { table: "faqs", match: { scope: "brand_investment", brand, question: "How long does it take to open a store?" }, set: { answer: "Typically 12–16 weeks from a signed agreement, depending on the site, approvals and fit-out.", status: "published" }, force: ["status"] },
    { table: "faqs", match: { scope: "brand_investment", brand, question: "What does the agreement cover?" }, set: { answer: "Brand licence, territory, term, fees, supply obligations, training and the support we provide. We walk you through every clause before you sign.", status: "published" }, force: ["status"] },
    { table: "faqs", match: { scope: "brand_investment", brand, question: "Is territory exclusivity available?" }, set: { answer: "For multi-store commitments, yes — exclusivity is agreed city by city based on the development plan.", status: "published" }, force: ["status"] },
  ]),

  // Placeholder menu items from the structural seed are hidden while sample menus are loaded.
  ...["Signature fried chicken", "Sides & dips", "Waffles", "Donuts", "Croissants", "Ice cream", "Beverages"].map((cat) => ({
    table: "products",
    match: { name: `[CLIENT CONTENT REQUIRED] ${cat} item` },
    set: { status: "draft" },
    force: ["status"],
    many: true,
  })),

  /* --------------------------------------------------- Milestones / people */
  { table: "milestones", match: { sort_order: 1 }, set: { year_label: "2018", title: "Litensity is incorporated", body: "A small team, one test kitchen and a plan to build brands that travel." }, force: ["year_label"] },
  { table: "milestones", match: { sort_order: 2 }, set: { year_label: "2019", title: "First store opens", body: "Bengaluru, a 30-seat store and queues on the first weekend." }, force: ["year_label"] },
  { table: "milestones", match: { sort_order: 3 }, set: { year_label: "2021", title: "BIGGUYS launches", body: "Korean-Indian fried chicken goes from test menu to brand." }, force: ["year_label"] },

  /* ----------------------------------------------------- Global settings */
  {
    table: "site_settings",
    pk: { column: "id", value: 1 },
    set: {
      positioning_line: "A house of food brands people crave.",
      address: "4th Floor, Example Towers, MG Road\nBengaluru, Karnataka 560001",
      phone: "+91 00000 00000",
      email: "hello@litensity.com",
      whatsapp_number: "+91 00000 00000",
      latitude: 12.9756,
      longitude: 77.605,
    },
  },
  { table: "contact_departments", match: { name: "Franchise & investment" }, set: { description: "Brand franchises, group investment and partnerships.", email: "hello@litensity.com", phone: "+91 00000 00000" } },
  { table: "contact_departments", match: { name: "Careers" }, set: { description: "Open roles, applications and campus hiring.", email: "hello@litensity.com" } },
  { table: "contact_departments", match: { name: "Media" }, set: { description: "Press, interviews and brand assets.", email: "hello@litensity.com" } },
  { table: "contact_departments", match: { name: "Customer care" }, set: { description: "Feedback on a visit or an order.", email: "hello@litensity.com", phone: "+91 00000 00000" } },
  { table: "form_settings", pk: { column: "form_key", value: "franchise" }, set: { budget_options: ["Up to ₹25 L", "₹25–50 L", "₹50 L–1 Cr", "Above ₹1 Cr"] } },
  { table: "form_settings", pk: { column: "form_key", value: "investor" }, set: { ticket_size_options: ["Up to ₹1 Cr", "₹1–5 Cr", "₹5–25 Cr", "Above ₹25 Cr"] } },

  /* --------------------------------------------------------------------- SEO */
  { table: "seo_metadata", pk: { column: "route_key", value: "home" }, set: { description: "Litensity Food & Beverages builds and operates BIGGUYS, Belgian Waffle and DCube Desserts Cafe — a house of food brands across India." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "invest" }, set: { description: "Invest in Litensity, a multi-brand F&B operator — or partner with BIGGUYS or DCube as a franchisee." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "about" }, set: { description: "The story, founders, values and milestones behind Litensity Food & Beverages." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "csr" }, set: { description: "Meal drives, skills training and greener kitchens — Litensity's work beyond the counter." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "brand:bigguys" }, set: { description: "BIGGUYS — Korean-Indian fried chicken, double-fried and glazed to order. Menu, stores and franchise." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "brand:belgian-waffle" }, set: { description: "Belgian Waffle — golden, crisp waffles baked to order. Menu, stores and order online." } },
  { table: "seo_metadata", pk: { column: "route_key", value: "brand:dcube" }, set: { description: "DCube Desserts Cafe — eggless, build-your-own desserts. Menu, stores and franchise." } },

  /* ------------------------------------------------------------------- Legal */
  {
    table: "legal_documents",
    pk: { column: "slug", value: "privacy" },
    set: {
      body: `> **Sample policy for preview only.** Litensity's approved Privacy Policy will replace this text before launch.

## What we collect
When you use a form on this site we collect the details you enter — usually your name, email address, phone number and city — together with the page you were on and the time of your request. Job applications may include a résumé.

## How we use it
We use your details to respond to your request, send the file you asked for, process your application or follow up on a franchise or investment enquiry. With your consent we may send occasional updates about our brands.

## Where it is stored
Enquiries are stored in access-controlled Google Sheets and our secure database. Résumés are kept in private storage that only authorised staff can open.

## How long we keep it
We keep enquiry details for as long as needed to respond and for a reasonable period afterwards, unless the law requires longer.

## Your choices
You can ask us to correct or delete your information, or stop sending you updates, by writing to hello@litensity.com.`,
    },
  },
  {
    table: "legal_documents",
    pk: { column: "slug", value: "terms" },
    set: {
      body: `> **Sample terms for preview only.** Litensity's approved Terms of Use will replace this text before launch.

## Using this site
This website is operated by Litensity Food and Beverages Pvt Ltd. By using it you agree to these terms.

## Information on the site
Menus, prices, store timings and offers can change. Store details are updated regularly but please check with the store before you visit.

## Franchise and investment information
Figures and descriptions on this site are indicative and do not form an offer. Any partnership is subject to a signed agreement.

## Intellectual property
Brand names, logos, photographs and content belong to Litensity or its brand partners and may not be reused without permission.

## Contact
Questions about these terms: hello@litensity.com.`,
    },
  },
];

/* ------------------------------------------------------------------ Inserts
 * New rows. Every inserted id is recorded in sample_records and deleted on removal.
 * `section: [page, key]` resolves to section_id; `brand` resolves to brand_id; `image` to media_id.
 */
export const inserts = {
  stats: [
    { section: ["home", "highlights"], scope: "home", label: "Customers served", source: "manual", value: "1.2", suffix: "M+", sort_order: 4, status: "published" },
    { section: ["csr", "impact"], scope: "csr", label: "Volunteer hours", source: "manual", value: "3,200", suffix: "+", sort_order: 2, status: "published" },
    { section: ["csr", "impact"], scope: "csr", label: "Young people trained", source: "manual", value: "150", suffix: "+", sort_order: 3, status: "published" },
  ],
  content_items: [
    { section: ["invest", "roadmap"], list_key: null, title: "New metros", meta: "Next 12 months", body: "Mumbai, Pune and the NCR for BIGGUYS; DCube kiosks in the top malls of every metro.", sort_order: 2 },
    { section: ["invest", "roadmap"], list_key: null, title: "New formats", meta: "Next 24 months", body: "Cloud kitchens for every brand, plus highway and transit formats.", sort_order: 3 },
    { section: ["invest", "roadmap"], list_key: null, title: "A fourth brand", meta: "Beyond", body: "A new homegrown brand, built on the same playbook.", sort_order: 4 },
    { section: ["invest", "faq"], list_key: null, title: "Can I invest in a single brand?", body: "Yes. BIGGUYS and DCube are open to franchise partners; see each brand's investment page or choose the brand in the form.", sort_order: 3 },
    { section: ["invest", "faq"], list_key: null, title: "What information will I receive?", body: "After an NDA, a data room with audited financials, store-level performance and the growth plan.", sort_order: 4 },
    { section: ["invest", "faq"], list_key: null, title: "Who will I speak to?", body: "A founder or a member of the leadership team leads every investor conversation.", sort_order: 5 },
    { list_key: "brand.pillars", brand: "bigguys", title: "Double-fried crunch", body: "Fried twice for a crust that stays crisp under every glaze.", icon: "flame", sort_order: 2 },
    { list_key: "brand.pillars", brand: "bigguys", title: "Made for groups", body: "Buckets, platters and big tables — BIGGUYS is built for sharing.", icon: "users", sort_order: 3 },
    { list_key: "brand.pillars", brand: "belgian-waffle", title: "Baked to order", body: "Every waffle comes straight off the iron — never pre-made.", icon: "flame", sort_order: 1 },
    { list_key: "brand.pillars", brand: "belgian-waffle", title: "Sweet or savoury", body: "From triple chocolate to cheese and herbs, there is a waffle for every time of day.", icon: "sparkle", sort_order: 2 },
    { list_key: "brand.pillars", brand: "dcube", title: "Cubicles loyalty", body: "Collect a cube with every order and unlock desserts on us.", icon: "heart", sort_order: 3 },
  ],
  faqs: ["bigguys", "dcube"].flatMap((brand) => [
    { scope: "brand_investment", brand, question: "Do I need restaurant experience?", answer: "It helps, but it is not essential. We look for partners who will be hands-on and hire a strong store manager.", sort_order: 5 },
    { scope: "brand_investment", brand, question: "Who finds the site?", answer: "You propose sites and our expansion team evaluates them; we can also share sites we are tracking in your city.", sort_order: 6 },
    { scope: "brand_investment", brand, question: "What ongoing fees are there?", answer: "A royalty on sales and a marketing contribution. Exact terms are shared with the franchise disclosure document.", sort_order: 7 },
    { scope: "brand_investment", brand, question: "Can I open more than one store?", answer: "Yes — multi-unit partners are welcome and may qualify for territory exclusivity.", sort_order: 8 },
  ]),
  people: [
    { kind: "founder", name: "Founder Name", designation: "Founder & Managing Director", background: "Fifteen years in food retail and franchise development across India and the Middle East.", responsibility: "Group strategy, brand partnerships and investor relations.", sort_order: 1, status: "published" },
    { kind: "founder", name: "Co-founder Name", designation: "Co-founder & Director, Operations", background: "Started on the line and went on to run multi-city restaurant operations.", responsibility: "Store operations, supply chain and the training academy.", sort_order: 2, status: "published" },
    { kind: "leader", name: "Leader Name", designation: "Head of Brand & Marketing", background: "Built consumer brands across food delivery and FMCG.", responsibility: "Brand, campaigns and digital.", sort_order: 1, status: "published" },
    { kind: "leader", name: "Leader Name", designation: "Head of Expansion", background: "Opened over a hundred retail and QSR stores.", responsibility: "Site selection, franchise partners and fit-out.", sort_order: 2, status: "published" },
    { kind: "leader", name: "Leader Name", designation: "Head of Finance", background: "Chartered accountant with a decade in consumer businesses.", responsibility: "Finance, reporting and governance.", sort_order: 3, status: "published" },
  ],
  jobs: [
    { title: "Area Operations Manager", brand: null, location: "Bengaluru", employment_type: "Full-time", summary: "Lead a cluster of 6–8 stores across our brands.", description: "Own sales, standards and people across your cluster. Coach store managers, run audits and work with the central team on launches.", requirements: "6+ years in multi-unit QSR or retail operations.\nStrong with numbers and comfortable on the floor.", is_open: true, sort_order: 1, status: "published" },
    { title: "Pastry Chef", brand: "dcube", location: "Kochi", employment_type: "Full-time", summary: "Develop and standardise eggless desserts for DCube.", description: "Create new bases and toppings, write recipes the stores can follow and train kitchen teams.", requirements: "3+ years in pastry, ideally with eggless baking.\nA culinary qualification is a plus.", is_open: true, sort_order: 2, status: "published" },
    { title: "Brand Marketing Executive", brand: null, location: "Bengaluru", employment_type: "Full-time", summary: "Plan and run campaigns across our three brands.", description: "Work with the brand team on social, influencer and aggregator campaigns, from brief to report.", requirements: "2+ years in brand or digital marketing, ideally in food or consumer brands.", is_open: true, sort_order: 3, status: "published" },
  ],
  delivery_links: ["bigguys", "belgian-waffle", "dcube"].flatMap((brand) => [
    { brand, platform: "Swiggy", url: "https://www.swiggy.com/", sort_order: 1 },
    { brand, platform: "Zomato", url: "https://www.zomato.com/", sort_order: 2 },
  ]),
  social_links: [
    { brand: null, platform: "Instagram", url: "https://www.instagram.com/", sort_order: 1 },
    { brand: null, platform: "LinkedIn", url: "https://www.linkedin.com/", sort_order: 2 },
    { brand: "bigguys", platform: "Instagram", url: "https://www.instagram.com/", sort_order: 1 },
    { brand: "belgian-waffle", platform: "Instagram", url: "https://www.instagram.com/", sort_order: 1 },
    { brand: "dcube", platform: "Instagram", url: "https://www.instagram.com/", sort_order: 1 },
  ],
  campaigns: [
    { brand: "belgian-waffle", kind: "campaign", title: "Waffle Wednesdays", body: "A new limited-edition waffle every Wednesday — announced on Instagram the night before.", image: "waffle-iron-2", sort_order: 100, status: "published" },
  ],
  investment_models: [
    {
      brand: "bigguys",
      name: "Food court kiosk",
      format: "Food court",
      description: "A counter-service kiosk for malls and food courts with a focused menu.",
      includes: ["Brand licence and launch marketing", "Kiosk design and equipment list", "Training for the opening team", "Central supply of sauces and batters"],
      investment_range: "₹25–35 L",
      area_requirement: "250–400 sq ft",
      payback_range: "18–24 months",
      return_range: "22–28% a year",
      assumptions: SAMPLE_NOTE,
      figures_confirmed: true,
      sort_order: 2,
      status: "published",
    },
  ],
};

/* ----------------------------------------------------- Sample rows' own text
 * Rows created by the first sample run carry "Sample …" wording; they are rewritten
 * in place (they are deleted on removal, so no backup is needed).
 */
export const sampleRowCopy = {
  csr_initiatives: [
    { match: "Sample initiative · Community meal drive", set: { title: "Community meal drive", location: "Bengaluru", event_date: "2026-08-15", description: "Our kitchen teams cooked and served 2,000 fresh meals with a local food bank over one weekend — and packed surplus ingredients for the week ahead." } },
    { match: "Sample initiative · Neighbourhood garden", set: { title: "Kitchen-garden programme", location: "Kochi", event_date: "2026-06-05", description: "Store teams and volunteers helped a neighbourhood school set up a kitchen garden, with monthly cooking classes using what the children grow." } },
  ],
  campaigns: [
    { match: "Sample launch spotlight", set: { title: "The Seoul Heat range", body: "Three new glazes — gochujang-tamarind, butter-garlic-chilli and smoked pepper. Available in every store for a limited run.", cta_label: "See the menu", cta_href: "#menu" } },
    { match: "Sample programme spotlight", set: { title: "Cubicles — loyalty that stacks up", body: "Collect a cube with every order. Five cubes and your next dessert is on us.", cta_label: "Find a store", cta_href: "#stores" } },
  ],
};

/** Sample prices for the first-run sample products (by name). */
export const productPrices = {
  "Yangnyeom Glazed Chicken": "₹329",
  "Crispy Original": "₹279",
  "Chicken Bites Bucket": "₹449",
  "Seasoned Fries": "₹149",
  "Berry Bliss Waffle": "₹219",
  "Triple Chocolate Waffle": "₹239",
  "Classic Golden Waffle": "₹169",
  "Chocolate Glazed Donut": "₹119",
  "Sugar Twist": "₹99",
  "Loaded Croissant": "₹199",
  "Brownie Sundae": "₹229",
  "Sprinkle Sundae": "₹189",
  "Cookies & Cream Shake": "₹199",
  "Strawberry Shake": "₹179",
  "Build-your-own Waffle": "₹199",
};

/** Store names and addresses (DEV SAMPLE rows renamed for the preview; originals are backed up). */
export const storeCopy = {
  "DEV SAMPLE — Indiranagar": { name: "BIGGUYS Indiranagar", address: "Ground floor, 1012, 100 Feet Road, HAL 2nd Stage", image: "interior-booth" },
  "DEV SAMPLE — Koramangala": { name: "BIGGUYS Koramangala", address: "Ground floor, 64, 80 Feet Road, 4th Block", image: "kfc-bbq" },
  "DEV SAMPLE — Banjara Hills": { name: "BIGGUYS Banjara Hills", address: "Shop 3, Road No. 12, near Example Circle", image: "wings-platter" },
  "DEV SAMPLE — Andheri West": { name: "BIGGUYS Andheri West", address: "Unit 7, Link Road, opposite Example Mall" },
  "DEV SAMPLE — Jayanagar": { name: "Belgian Waffle Jayanagar", address: "Kiosk 2, 11th Main, 4th Block", image: "waffle-iron" },
  "DEV SAMPLE — Anna Nagar": { name: "Belgian Waffle Anna Nagar", address: "Shop 14, 2nd Avenue, near Example Tower Park", image: "cafe-counter" },
  "DEV SAMPLE — Kothrud": { name: "Belgian Waffle Kothrud", address: "Shop 5, Karve Road, Example Plaza", image: "waffle-iron-2" },
  "DEV SAMPLE — HSR Layout": { name: "DCube HSR Layout", address: "Ground floor, 27th Main, Sector 1", image: "cafe-warm" },
  "DEV SAMPLE — Kakkanad": { name: "DCube Kakkanad", address: "Shop 9, Infopark Road, Example Arcade", image: "shake-cookies" },
  "DEV SAMPLE — Salt Lake": { name: "DCube Salt Lake", address: "Unit 12, Sector V, Example Business Centre", image: "sundae-sprinkles" },
  "DEV SAMPLE — Sector 29": { name: "DCube Sector 29", address: "Shop 21, Leisure Valley Road", image: "donut-twist" },
  "QA Test Store Whitefield": { name: "Belgian Waffle Whitefield", address: "Kiosk 4, Example Tech Park, ITPL Main Road", image: "waffle-chocolate" },
};
