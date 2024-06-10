import { patchMissions } from "@/utils/pg/patchMissions";
import { saveCustomers } from "@/utils/apollo/saveCustomer";
import { getDeform } from "@/utils/deform/getDeformData";
import { getPgTotalCount } from "@/utils/pg/pgAggregationCount";
import { type NextApiRequest, type NextApiResponse } from "next";

const DEFORM_FORM_ID = process.env.DEFORM_FORM_ID ?? "";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | { error: string },
  ): void;
}

export default async function handler(_req: NextApiRequest, res: Response) {
  try {
    // const data = await getNotion();
    // const newData = await patchMissions(data!);
    // fetch the DeForm data
    const rows = await getDeform(DEFORM_FORM_ID).then((data) => {
      return data?.data;
    });

    // failure mode for fetching DeForm data
    if (!rows) {
      return res.status(500).send({ error: "Unable to fetch DeForm data" });
    }
    //determine the total number of entries
    const totalEntries = rows.length;
    // await totalsQueue.add("totalsQueue", data2);
    // return res.status(200).json({ status: "Message added to the queue" });

    // fetch the total number of entries from the Postgres database
    const aggregations = await getPgTotalCount().then((data) => {
      return data?.aggregationCount;
    });

    // failure mode for fetching aggregation data
    if (aggregations === undefined) {
      return res
        .status(500)
        .send({ error: "Unable to fetch aggregation data" });
    }

    // first, save customers to Postgres
    const customers = await saveCustomers({ rows, startRow: aggregations });
    console.log(customers);
    return res.status(200).send(customers);

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
