export type Stage = {
  id: string;
  label: string;
  title: string;
  body: string;
  /** Stage 6: the channels the system is carried into, highlighted one by one (beat ids in DISCIPLINE_BEATS). */
  disciplines?: string[];
};

/**
 * The eight stages of "From one idea to a whole brand": their words. The drawing that shows each
 * step is in plate.ts, and the steps themselves in beats.ts.
 */
export const stages: Stage[] = [
  {
    id: "idea",
    label: "The idea",
    title: "It starts with one point.",
    body: "Every brand begins as a single idea. Before anything is drawn, it needs room around it.",
  },
  {
    id: "strategy",
    label: "Strategy",
    title: "Four questions, one direction.",
    body: "Who it serves, what it promises, why it matters and how it will be found. The answers set the course for everything after.",
  },
  {
    id: "mark",
    label: "The mark",
    title: "Drawn from the idea.",
    body: "A mark is constructed, not decorated: geometry first, then the form that remains.",
  },
  {
    id: "identity",
    label: "Colour and type",
    title: "A palette, and a voice in type.",
    body: "A few colours and two typefaces, chosen to work together and used the same way every time.",
  },
  {
    id: "system",
    label: "The system",
    title: "Rules that hold it together.",
    body: "A grid, measured spacing and a tone of voice turn separate pieces into one identity.",
  },
  {
    id: "applications",
    label: "Applications",
    title: "Carried into every channel.",
    body: "The same system, built into each place people meet the brand:",
    disciplines: ["Web design and development", "SEO", "GEO", "Content", "Digital marketing"],
  },
  {
    id: "presented",
    label: "Presented",
    title: "One brand, presented whole.",
    body: "Every piece traces back to the same point. That is what makes a brand recognisable at a glance.",
  },
  {
    id: "ecosystem",
    label: "The ecosystem",
    title: "A whole brand.",
    body: "Consistent wherever it appears, so each new place adds to what people already know.",
  },
];

/** The beat at which each of stage 6's disciplines becomes active, in the same order. */
export const DISCIPLINE_BEATS = ["f1", "f2", "f2", "f3", "f6"] as const;
