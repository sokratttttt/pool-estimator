export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        sitemap: 'https://mos-pool-smeta-builed.vercel.app/sitemap.xml',
    };
}
