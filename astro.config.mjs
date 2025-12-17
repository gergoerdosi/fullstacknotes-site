// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Fullstack Notes',
			favicon: '/favicon-dark-32.png',
			head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon-light-32.png',
            media: '(prefers-color-scheme: light)',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon-dark-32.png',
            media: '(prefers-color-scheme: dark)',
          },
        },
      ],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
			components: {
				SiteTitle: './src/components/SiteLogo.astro',
        Footer: './src/components/CustomFooter.astro',
      },
		}),
	],
});
