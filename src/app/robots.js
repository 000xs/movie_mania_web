export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/*",
      disallow: "/dashboard/*",
       
    },
    sitemap: "https://www.moviemanialk.com/sitemap.xml",
  };
}
