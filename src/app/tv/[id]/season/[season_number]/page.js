// app/tv/[id]/season/[season_number]/page.js
import { generateMetadata } from "@/lib/GenerateSeasonMetaData"; // optional, if you keep it
import SeasonPage from "./season";                 // pure client component

export { generateMetadata };                                       // re-export server fn

export default async function TvSeasonPage({ params }) {
  const { id, season_number } = await params;  // Next.js 15 async params
  return <SeasonPage id={id} seasonNumber={season_number} />;
}