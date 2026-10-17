import type { Metadata } from "next";
import Container from "./container";

export const metadata: Metadata = {
    title: "Privacy Policy - Yardli",
    description:
        "Yardli's privacy policy outlining how we collect, use, and protect your personal information.",
    robots: {
        index: true,
        follow: true,
    },
};

export default async function PrivacyPage() {
    return <Container />;
}
