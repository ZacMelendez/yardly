import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import ApiErrorHandler from "@/components/ui/ApiErrorHandler";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "mantine-react-table/styles.css";
import { ViewTransitions } from "next-view-transitions";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

export const metadata: Metadata = {
    title: "Yardli - Landscaping Business Management",
    description:
        "Streamline your landscaping business with Yardli. Manage customers, jobs, estimates, and services all in one powerful platform.",
    keywords: [
        "landscaping",
        "business management",
        "lawn care",
        "yard work",
        "customer management",
        "job scheduling",
        "estimates",
        "landscaping software",
    ],
    authors: [{ name: "Yardli Team" }],
    creator: "Yardli",
    publisher: "Yardli",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://yardli-five.vercel.app"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Yardli - Landscaping Business Management Platform",
        description:
            "Streamline your landscaping business with Yardli. Manage customers, jobs, estimates, and services all in one powerful platform.",
        url: "/",
        siteName: "Yardli",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Yardli - Landscaping Business Management",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Yardli - Landscaping Business Management",
        description:
            "Streamline your landscaping business with Yardli. Manage customers, jobs, estimates, and services all in one powerful platform.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    // verification: {
    //     google: process.env.GOOGLE_SITE_VERIFICATION,
    // },
    category: "business",
    classification: "Business Management Software",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ViewTransitions>
            <html lang="en" {...mantineHtmlProps}>
                <head>
                    <ColorSchemeScript />
                    <meta name="apple-mobile-web-app-title" content="Yardli" />
                </head>
                <body>
                    <MantineProvider>
                        <ModalsProvider>
                            <Providers>
                                <ApiErrorHandler>
                                    <ConditionalLayout>
                                        {children}
                                    </ConditionalLayout>
                                </ApiErrorHandler>
                            </Providers>
                        </ModalsProvider>
                    </MantineProvider>
                </body>
            </html>
        </ViewTransitions>
    );
}
