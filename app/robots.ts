import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/transactions/', '/analytics/'],
        },
        sitemap: 'https://www.dailybudget.in/sitemap.xml',
    }
}
