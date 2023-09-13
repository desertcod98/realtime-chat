/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});


/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  images: {
    domains: [
      "pub-a43a3962549e4cdd8496391be5998a56.r2.dev",
      "realtime-chat.070040185192eb230c7401d5761a917d.r2.cloudflarestorage.com",
    ],
  },
  modularizeImports: {
    "react-icons/?(((\\w*)?/?)*)": {
        transform: "@react-icons/all-files/{{ matches.[1] }}/{{ member }}",
        skipDefaultConversion: true
    }
}
});

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   modularizeImports: {
//       "react-icons/?(((\\w*)?/?)*)": {
//           transform: "@react-icons/all-files/{{ matches.[1] }}/{{ member }}",
//           skipDefaultConversion: true
//       }
//   }
// }

// module.exports = nextConfig