export type Leader = {
  name: string;
  role: string;
  initials: string;
  image?: string;
  description: string;
};

export const leaders: Leader[] = [
  {
    name: "K Marcel TRAORE",
    role: "Responsable des opérations & coordination",
    initials: "KM",
    image: "/k-marcel-traore.png",
    description: "Coordination opérationnelle, suivi des parcours et organisation des échanges internationaux.",
  },
  {
    name: "Jean Lansana KOUNDOUNO",
    role: "Responsable légal",
    initials: "JLK",
    description: "Gouvernance, vision institutionnelle et développement responsable de la plateforme ICX.",
  },
];
