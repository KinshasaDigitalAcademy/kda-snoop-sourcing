import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import NextCors from "nextjs-cors";
import { prisma } from "../../../../../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const formId = req.query.id.toString();
  const pageId = req.query.candidateId.toString();
  const session = await getSession({ req: req });

  // GET /api/forms
  // Gets all forms of a user
  if (req.method === "GET") {
    // check if session exist
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const pageSubmissions = await prisma.sessionEvent.findMany({
      select: {
        data: true,
      },
      where: {
        AND: [
          { type: "pageSubmission" },
          {
            data: {
              path: ["pageName"],
              equals: pageId,
            },
          },
          {
            data: {
              path: ["formId"],
              equals: formId,
            },
          },
        ],
      },
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
    });
    const candidates = pageSubmissions.map((s) => s.data["candidateId"]);
    const responses = pageSubmissions.map((s) => s.data["submission"]);
    let qStats = {};
    console.log("res...", responses);
    responses.map((r) => {
      if (r)
        Object.keys(r).map((qId) => {
          if ([qStats[r[qId]]]) qStats[r[qId]] += 1;
          else qStats[r[qId]] = 1;
        });
    });
    console.log('stats2...', qStats);
    return res.json({ candidates, qStats });
  }

  // Unknown HTTP Method
  else {
    throw new Error(
      `The HTTP ${req.method} method is not supported by this route.`
    );
  }
}