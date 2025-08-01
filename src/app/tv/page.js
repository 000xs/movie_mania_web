// app/movie/[id]/page.js
import { generateMetadata } from "@/lib/generateTvListMetadata copy";
import TvPage from "./tv";
export { generateMetadata };

export default async function Page() {
  return <TvPage />;
}
 