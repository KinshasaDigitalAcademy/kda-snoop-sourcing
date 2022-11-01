import { handleWebhook } from "../components/pipelines/webhook";
import { capturePosthogEvent } from "./posthog";
import { prisma } from "./prisma";
import { sendTelemetry } from "./telemetry";
import { ApiEvent, Schema } from "./types";

type validationError = {
  status: number;
  message: string;
};

export const validateEvents = (
  events: ApiEvent[]
): validationError | undefined => {
  if (!Array.isArray(events)) {
    return { status: 400, message: `"events" needs to be a list` };
  }
  for (const event of events) {
    if (
      ![
        "createSubmissionSession",
        "pageSubmission",
        "submissionCompleted",
        "formOpened",
        "updateSchema",
      ].includes(event.type)
    ) {
      return {
        status: 400,
        message: `event type ${event.type} is not suppported`,
      };
    }
    return;
  }
};

export const processApiEvent = async (event: ApiEvent, formId, candidateId) => {
  // save submission
  if (event.type === "pageSubmission") {
    const data = event.data;

    const sessionEvent = await prisma.sessionEvent.findFirst({
      where: {
        data: {
          array_contains: {
            formId,
            candidateId,
            pageName: event.data.pageName,
          },
        },
      },
    });

    if (sessionEvent) {
      sessionEvent.data = data;
      await prisma.sessionEvent.update({
        where: {
          id: sessionEvent.id,
        },
        data: {
          data: { ...sessionEvent.data, formId, candidateId },
        },
      });
    } else {
      await prisma.sessionEvent.create({
        data: {
          type: "pageSubmission",
          data: {
            formId,
            candidateId,
            ...data,
          },
          submissionSession: { connect: { id: data.submissionSessionId } },
        },
      });
    }

    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
    });
    capturePosthogEvent(form.ownerId, "pageSubmission received", { formId });
    sendTelemetry("pageSubmission received");
  } else if (event.type === "submissionCompleted") {
    // TODO
  } else if (event.type === "updateSchema") {
    //const data = { schema: event.data, updatedAt: new Date() };

    const form = await prisma.form.findUnique({ where: { id: formId } });
    const schema = form.schema as Schema;

    console.log("schema", schema);
    console.log("pages", schema.pages);

    const data = {
      schema: [...event.data.pages, ...schema.pages],
      updatedAt: new Date(),
    };

    await prisma.form.update({
      where: { id: formId },
      data,
    });
  } else if (event.type === "formOpened") {
    // check if usr  opened form

    const userOpenFormSession = await prisma.sessionEvent.findFirst({
      where: {
        type: "formOpened",
        data: {
          array_contains: {
            formId,
            candidateId: candidateId,
          },
        },
      },
    });
    console.log(userOpenFormSession);

    if (userOpenFormSession === null) {
      console.log(userOpenFormSession);

      const { id } = await prisma.submissionSession.create({
        data: { form: { connect: { id: formId } } },
      });

      await prisma.sessionEvent.create({
        data: {
          type: "formOpened",
          data: {
            formId,
            candidateId,
          },
          submissionSession: { connect: { id } },
        },
      });
    }
  } else {
    throw Error(
      `apiEvents: unsupported event type in event ${JSON.stringify(event)}`
    );
  }
  // handle integrations
  const pipelines = await prisma.pipeline.findMany({
    where: {
      form: { id: formId },
      enabled: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  for (const pipeline of pipelines) {
    if (pipeline.type === "WEBHOOK") {
      handleWebhook(pipeline, event);
    }
  }
};
