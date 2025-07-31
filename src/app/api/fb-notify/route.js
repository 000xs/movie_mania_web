// src/app/api/fb-notify/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  // 1. Parse JSON safely
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 2. Destructure with fall-backs
  const {
    movieId,
    image_url,
    posterPath,
    title,
    name,
    release_date,
    first_air_date,
    genres = [],
  } = body;

  const imageUrl = (image_url || posterPath || "").replace(
    /<url[^>]*>(.*?)<\/url>/gi,
    "$1"
  ); // strip <url …> wrappers
  const displayTitle = title || name;
  const releaseDate = release_date || first_air_date;
  const genreText = genres.join(", ");
  const year = releaseDate ? releaseDate.split("-")[0] : "N/A";

  if (!imageUrl || !movieId) {
    return NextResponse.json(
      { status: "error", message: "Missing image_url / posterPath or movieId" },
      { status: 400 }
    );
  }

  // 3. Build the caption
  const message = `
🎬 Title: ${displayTitle} (${year}) | සිංහල උපසිරැස සමගින් 
🎞 Year: ${year}
📣 Genre: ${genreText}


🔰 DOWNLOADS :  https://www.moviemanialk.com/movie/${encodeURIComponent(movieId)}
 
${displayTitle} (${year}) නවතම චිත්‍රපටය සඳහා පහත සදහන් ලින්ක් එක මත පිවිස අපගේ වෙබ්අඩවියෙන්, Telegram සහ Direct WEB  පිටපත් සිංහල උපසිරැසි සමඟ බාගත කළ හැක. 

 
ඔබට පහසුවෙන්ම නරඹිය හැක්කක් ලෙස, අපගේ WEBDL පිටපතටම උපසිරැසි දැනටමත් එකතු කර ඇත (Softcode). එබැවින් වෙනම උපසිරැසි ගොනුවක් අවශ්‍ය නොවේ!
${displayTitle} (${year}) — Telegram Direct WEB-DL.

#SinhalaSubtitles | #SriLanka | #MovieManiaLK
`.trim();

  // 4. Facebook credentials
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!pageToken || !pageId) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing Facebook credentials in environment",
      },
      { status: 500 }
    );
  }

  // 5. Upload image (unpublished)
  const mediaId = await uploadImageToFacebook(pageId, pageToken, imageUrl);
  if (!mediaId) {
    return NextResponse.json(
      { status: "error", message: "Failed to upload image to Facebook" },
      { status: 500 }
    );
  }

  // 6. Publish post
  const postId = await createFacebookPost(pageId, pageToken, message, mediaId);
  if (!postId) {
    return NextResponse.json(
      { status: "error", message: "Failed to publish post to Facebook" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Posted to Facebook", post_id: postId },
    { status: 200 }
  );
}

/* ---------- helpers ---------- */

async function uploadImageToFacebook(pageId, pageToken, imageUrl) {
  const url = `https://graph.facebook.com/v18.0/${pageId}/photos`;
  const params = new URLSearchParams();
  params.append("url", imageUrl);
  params.append("published", "false");
  params.append("access_token", pageToken);

  try {
    const { data } = await axios.post(url, params);
    return data.id;
  } catch (err) {
    console.error("FB image upload error:", err.response?.data || err.message);
    return null;
  }
}

async function createFacebookPost(pageId, pageToken, message, mediaId) {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const payload = new URLSearchParams();
  payload.append("message", message);
  payload.append("attached_media", JSON.stringify([{ media_fbid: mediaId }]));
  payload.append("access_token", pageToken);

  try {
    const { data } = await axios.post(url, payload);
    return data.id;
  } catch (err) {
    console.error("FB post creation error:", err.response?.data || err.message);
    return null;
  }
}
