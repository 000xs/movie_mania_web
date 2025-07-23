import { generateMetadata } from "@/lib/generateTvSeriesMetadata";
export { generateMetadata };

import TvSeriesPage from "./tv";

export default async function TvPage({ params }) {
  const { id } = await params;
 

  return <TvSeriesPage seriesId={id} />;
}
