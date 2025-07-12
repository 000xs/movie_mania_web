import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!botToken || !channelId) {
  console.error("Telegram bot token or channel ID not configured.");
}

const bot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

export async function POST(request) {
  let type = "";

  const escapeHtml = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  try {
    if (!bot) {
      return NextResponse.json(
        { error: "Telegram bot not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    type = body.type;
    const media = body.media;

    if (!["movie", "tv"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid media type provided" },
        { status: 400 }
      );
    }

    if (!media) {
      return NextResponse.json(
        { error: "No media data provided" },
        { status: 400 }
      );
    }

    const {
      title = type === "tv" ? media.name : media.title,
      releaseDate = type === "tv" ? media.first_air_date : media.releaseDate,
      genres = [],
      overview,
      posterPath,
      downloads = [],
      subtitles = [],
    } = media;

    const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
    const genreNames = genres.map((g) => (typeof g === "string" ? g : g.name));
    const genreList = genreNames
      .map((g) => `#${g.replace(/\s+/g, "")}`)
      .join(" | ");

    const fullPosterPath = posterPath?.startsWith("http")
      ? posterPath
      : `https://image.tmdb.org/t/p/original${posterPath}`;

    const escapedTitle = escapeHtml(title);
    const escapedOverview = escapeHtml(overview?.slice(0, 300) || "");

    const caption = `
<b>${type === "movie" ? "🎬 Movie" : "📺 TV Series"}:</b> ${escapedTitle}
<b>🎞 Year:</b> ${year}
<b>📣 Genre:</b> ${genreNames.join(", ")}

<b>📝 Overview:</b>
<i>${escapedOverview}...</i>

${genreList}
    `.trim();

    // Inline keyboard buttons
    const buttons = [];

    // Flatten downloads array to get all links with quality and type
    const flattenedDownloads = downloads.flatMap(download => {
      if (download.links && Array.isArray(download.links)) {
        return download.links.map(link => ({
          url: link.url,
          type: link.type || download.downloadType || 'DIRECT',
          quality: download.quality || '720p',
          format: link.format || 'WEB DL'
        }));
      } else if (download.url) {
        return [{
          url: download.url,
          type: download.type || download.downloadType || 'DIRECT',
          quality: download.quality || '720p',
          format: download.format || 'WEB DL'
        }];
      }
      return [];
    });

    // One row for all download links
    const downloadButtons = flattenedDownloads
      .filter(dl => dl.url?.startsWith("http"))
      .map(dl => ({
        text: `${dl.type.toUpperCase()} ${dl.quality || "720p"} (${dl.format || "WEB DL"})`,
        url: dl.url,
      }));
    if (downloadButtons.length > 0) {
      buttons.push(downloadButtons);
    }

    // One row for all subtitle links
    const subtitleButtons = subtitles
      .filter(sub => sub.url?.startsWith("http"))
      .map(sub => ({
        text: `Sub - ${sub.language.toUpperCase()}`,
        url: sub.url,
      }));
    if (subtitleButtons.length > 0) {
      buttons.push(subtitleButtons);
    }

    const replyMarkup = {
      inline_keyboard: buttons,
    };

    if (fullPosterPath) {
      await bot.sendPhoto(channelId, fullPosterPath, {
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
    } else {
      await bot.sendMessage(channelId, caption, {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
    }

    return NextResponse.json(
      {
        message: `${type === "movie" ? "Movie" : "TV Series"} sent to Telegram`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error sending ${type} to Telegram:`, error);
    return NextResponse.json(
      { error: `Failed to send ${type} notification` },
      { status: 500 }
    );
  }
}
