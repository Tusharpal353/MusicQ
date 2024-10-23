import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? " ",
    },
  });

  if (!user) {
    return NextResponse.json({
      message: "unauthenticated ",
    });
  }

  try {
    const data = UpvoteSchema.parse(await req.json());
    await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({
      message: "error while upvoting",
    });
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });
  return NextResponse.json({
    streams,
  });
}
