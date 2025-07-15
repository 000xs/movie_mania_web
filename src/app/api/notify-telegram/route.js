import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!botToken || !channelId) {
  console.error("Telegram bot token or channel ID not configured.");
}

const bot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

export async function POST(request) {
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
    const type = body.type;
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

    // -----------------------------
    // ✅ GROUP DOWNLOAD BUTTONS BY TYPE (e.g., DIRECT, TELEGRAM)
    // -----------------------------
    const grouped = {};

    downloads.forEach((dl) => {
      if (!dl.link || !dl.link.startsWith("http")) return;

      const type = dl.downloadType || "DIRECT";
      const quality = dl.quality || "720p";
      const videoType = dl.videoType || "";
      const label = `${quality} ${videoType}`.trim();

      if (!grouped[type]) grouped[type] = [];

      grouped[type].push({
        text: `${type} ${label}`,
        url: dl.link,
      });
    });

    // Sort preferred order
    const typeOrder = ["TELEGRAM", "DRIVE", "DIRECT"];
    const sortedGroups = Object.entries(grouped).sort(
      ([a], [b]) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
    );

    const downloadButtons = sortedGroups.map(([_, btns]) => btns);

    // -----------------------------
    // ✅ SUBTITLE BUTTONS
    // -----------------------------
    const subtitleButtons = subtitles
      .filter((s) => s.url?.startsWith("http"))
      .map((s) => ({
        text: `Sub - ${s.language.toUpperCase()}`,
        url: s.url,
      }));

    const replyMarkup = {
      inline_keyboard: [
        ...downloadButtons,
        ...(subtitleButtons.length > 0 ? [subtitleButtons] : []),
      ],
    };

    // -----------------------------
    // ✅ SEND TO TELEGRAM
    // -----------------------------
    let result;
    if (fullPosterPath) {
      result = await bot.sendPhoto(channelId, fullPosterPath, {
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
    } else {
      result = await bot.sendMessage(channelId, caption, {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
    }

    return NextResponse.json(
      {
        message: `${type === "movie" ? "Movie" : "TV Series"} sent to Telegram`,
        message_id: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error sending ${body?.type} to Telegram:`, error);
    return NextResponse.json(
      { error: `Failed to send ${body?.type} notification` },
      { status: 500 }
    );
  }
}
