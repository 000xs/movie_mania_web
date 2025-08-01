// app/movie/[id]/page.js
import { generateMetadata } from "@/lib/generateTvListMetadata copy";
import TvPage from "./tv";
import { Suspense } from "react";
export { generateMetadata };
 

export default async function Page() {
  return(
    <Suspense fallback={<div className="p-8 text-center text-white">Loading series…</div>}>
      <TvPage />
    </Suspense>
  )
  
  ;
}
 