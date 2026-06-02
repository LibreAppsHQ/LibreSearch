import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const origin = url.origin;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription
  xmlns="http://a9.com/-/spec/opensearch/1.1/"
  xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>LibreSearch</ShortName>
  <Description>Search the web privately. No tracking, no ads.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/svg">${origin}/favicon.svg</Image>
  <Url type="text/html" method="get" template="${origin}/search?q={searchTerms}"/>
  <moz:SearchForm>${origin}/</moz:SearchForm>
</OpenSearchDescription>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/opensearchdescription+xml; charset=UTF-8',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
