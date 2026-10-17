import type { Metadata } from "next";
import Container from "./container";

export const metadata: Metadata = {
    title: "Terms of Service - Yardli",
    description:
        "Yardli's terms of service outlining the rules and guidelines for using our landscaping business management platform.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
    return <Container />;
}
