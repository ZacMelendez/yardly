import {
    Body,
    Button,
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

interface InvoiceEmailProps {
    customerName: string;
    invoiceNumber: string;
    dueDate?: string | null;
    businessName?: string;
    senderName?: string;
    payLink?: string;
}

export default function InvoiceEmail({
    customerName = "Customer",
    invoiceNumber = "INV-00000000",
    dueDate,
    businessName = "Yardli",
    senderName,
    payLink,
}: InvoiceEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your invoice from {businessName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>{businessName}</Heading>
                    <Text style={paragraph}>Hi {customerName},</Text>
                    <Text style={paragraph}>
                        {senderName
                            ? `${senderName} has sent you an invoice`
                            : "You have received an invoice"}{" "}
                        ({invoiceNumber}). Please find the PDF attached.
                        {dueDate && (
                            <>
                                {" "}
                                The payment is due by{" "}
                                <strong>
                                    {new Date(dueDate).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        },
                                    )}
                                </strong>
                                .
                            </>
                        )}
                    </Text>
                    {payLink && (
                        <Button style={button} href={payLink}>
                            Pay online
                        </Button>
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

const button = {
    backgroundColor: YARDLI_GREEN,
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    padding: "12px 24px",
    margin: "0 48px",
    display: "inline-block",
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
