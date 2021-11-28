/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  
  async redirects() {
    return [
      {
        source: "/",
        destination: "/fixedrates",
        permanent: true
      }
    ];
  }
}
