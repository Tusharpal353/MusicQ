import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import youtubesearchapi from  "youtube-search-api";
const YT_REGEX =
    /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const CreateStramSchema = z.object({
    createrId: z.string(),
    url: z.string(),
    // LATER:::::to add youtube and spotify checks later
});

export async function POST(req: NextRequest) {
    try 
    {

        const data = CreateStramSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);

        if (!isYt) {
            return NextResponse.json({
                message: "wrong url format ",
            });
        }

        const extractedId = data.url.split("?v=")[1];



        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        console.log(res.title)
        console.log(res.thumbnail.thumbnails);
        //console.log(JSON.stringify(res.thumbnail.thumbnails))
        const thumbnails  = res.thumbnail.thumbnails;
        thumbnails.sort((a :{width : number},b:{width : number})=>a.width<b.width ? -1:1)
        const stream = await prismaClient.stream.create({
            data: {
                userId: data.createrId,
                url: data.url,
                extractedId,
                type: "YouTube",
                title:res.title ?? "cant find the video",
                smallImg: (thumbnails.length > 1 ? thumbnails[   thumbnails.length-2].url : thumbnails[   thumbnails.length-1 ].url ?? "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg"),
                bigImg:  thumbnails[   thumbnails.length-1].url ?? "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg "

            },
        });

        return NextResponse.json({
            message: "added stream",
            id: stream.id,
        });
        //LATER:::: add rate limiting so the queue in not floded

        






    } catch (e) {
        return NextResponse.json(
            {
                message: "error while  adding the stream",
            },
            {
                status: 411,
            }
        );
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
  