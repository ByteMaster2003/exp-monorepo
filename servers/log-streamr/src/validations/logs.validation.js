import { z } from "zod";

const queryLogsSchema = {
  query: z.object({
    project: z.enum(["control-deck", "restify"]),
    page: z.string().optional(),
    timestamp: z.coerce.date(),
    limit: z.string().optional()
  })
};

export default { queryLogsSchema };
