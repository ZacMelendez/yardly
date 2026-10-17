import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Text,
} from "@react-email/components";
import * as React from "react";

const YARDLI_GREEN = "#339966";

interface EstimateEmailProps {
    customerName: string;
    estimateTitle: string;
    businessName?: string;
    senderName?: string;
    acceptUrl?: string;
}

export default function EstimateEmail({
    customerName = "Customer",
    estimateTitle = "Estimate",
    businessName = "Yardli",
    senderName,
    acceptUrl,
}: EstimateEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your estimate from {businessName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>{businessName}</Heading>
                    <Text style={paragraph}>Hi {customerName},</Text>
                    <Text style={paragraph}>
                        {senderName
                            ? `${senderName} has sent you an estimate`
                            : "You have received an estimate"}{" "}
                        for <strong>{estimateTitle}</strong>. Please find the
                        PDF attached.
                    </Text>
                    {acceptUrl && (
                        <>
                            <Text style={paragraph}>
                                To accept this quote and confirm the work, click
                                the button below.
                            </Text>
                            <Text
                                style={{
                                    ...paragraph,
                                    textAlign: "center",
                                    paddingTop: "24px",
                                }}
                            >
                                <a href={acceptUrl} style={button}>
                                    Accept Quote
                                </a>
                            </Text>
                            <Text style={footer}>
                                If the button doesn&apos;t work, copy and paste
                                this link into your browser:{" "}
                                <a href={acceptUrl}>{acceptUrl}</a>
                            </Text>
                        </>
                    )}
                    <Hr style={hr} />
                    <Text style={footer}>
                        This email was sent by {businessName}. If you have any
                        questions, please reply to this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const heading = {
    color: YARDLI_GREEN,
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0 48px",
};

const paragraph = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    padding: "0 48px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "32px 48px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    padding: "0 48px",
};

const button = {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: YARDLI_GREEN,
    color: "#ffffff",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "16px",
};
