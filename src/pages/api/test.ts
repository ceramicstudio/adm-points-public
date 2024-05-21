import { patchMissions } from "@/utils/pg/patchMissions";
import {getNotion} from "@/utils/notion/index";
import { type NextApiRequest, type NextApiResponse } from "next";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | { error: string },
  ): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const data = await getNotion();
    const newData = await patchMissions(data!);
    res.status(200).json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
