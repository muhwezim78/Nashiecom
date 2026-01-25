import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO component for managing meta tags and search engine appearance.
 * 
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} image - Social sharing image URL
 * @param {string} url - Canonical URL
 * @param {object} schema - JSON-LD schema object
 */
const SEO = ({
    title,
    description,
    image = "/nashiecom.jpeg",
    url = "https://nashiecom-technologies.web.app",
    schema
}) => {
    const siteName = "Nashiecom Technologies";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const canonicalUrl = url.startsWith("http") ? url : `https://nashiecom-technologies.web.app${url}`;

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
