import { PrismaClient } from "@prisma/client";
import { type PgMission, type ObjectType } from "@/types";

const prisma = new PrismaClient();

export const patchMissions = async (
  data: ObjectType[],
): Promise<PgMission[] | undefined> => {
  try {
    const returnData = [];
    // Loop through the data and update the missions table

    for (const item of data) {
      const name = item.Name.title[0]?.text.content;
      const description =
        item.Description.rich_text.length && item.Description.rich_text[0]
          ? item.Description.rich_text[0].text.content
          : undefined;
      const difficulty =
        item.Difficulty.select !== null
          ? item.Difficulty.select.name
          : undefined;
      const season =
        item.Season.select !== null ? item.Season.select.name : undefined;
      const start =
        item.Start.date !== null ? item.Start.date.start : undefined;
      const active = item.Active.checkbox;
      const persona =
        item.Persona.select !== null ? item.Persona.select.name : undefined;
      const duration =
        item.Duration.select !== null ? item.Duration.select.name : undefined;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const url = item.URL.url !== null ? item.URL.url : undefined;
      const featured = item.Featured.checkbox;
      const frequency =
        item.Frequency.select !== null ? item.Frequency.select.name : undefined;
      const points = item.Points.rich_text[0]
        ? item.Points.rich_text[0].text.content
        : undefined;
      if (
        name &&
        description &&
        difficulty &&
        season &&
        persona &&
        duration &&
        frequency &&
        points &&
        active !== undefined &&
        featured !== undefined &&
        url !== undefined &&
        start !== undefined
      ) {
        const vals = await runPrisma({
          name,
          description,
          points,
          difficulty,
          persona,
          duration,
          frequency,
          season,
          startDate: start,
          active,
          featured,
          url,
        });
      }
    }

    return returnData as PgMission[];
  } catch (Error) {
    return undefined;
  }
};

const runPrisma = async ({
  name,
  description,
  points,
  difficulty,
  persona,
  duration,
  frequency,
  season,
  startDate,
  active,
  featured,
  url,
}: {
  name: string;
  description: string;
  points: string;
  difficulty: string;
  persona: string;
  duration: string;
  frequency: string;
  season: string;
  startDate: string;
  active: boolean;
  featured: boolean;
  url: string;
}) => {
  await prisma.missions
    .create({
      data: {
        name,
        description,
        points,
        difficulty,
        persona,
        duration,
        frequency,
        season,
        startDate,
        active,
        featured,
        url,
      },
    })
    .then((res) => console.log(res))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
};
