import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

const YARDLI_GREEN = "#339966";

interface OrganizationInviteEmailProps {
    inviterName: string;
    organizationName: string;
    inviteLink: string;
    recipientEmail: string;
}

export default function OrganizationInviteEmail({
    inviterName = "A team member",
    organizationName = "the team",
    inviteLink,
    recipientEmail = "you",
}: OrganizationInviteEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>You've been invited to join {organizationName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Yardli</Heading>
                    <Text style={paragraph}>
                        Hi{recipientEmail !== "you" ? ` ${recipientEmail}` : ""}
                        ,
                    </Text>
                    <Text style={paragraph}>
                        <strong>{inviterName}</strong> has invited you to join{" "}
                        <strong>{organizationName}</strong> on Yardli.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={inviteLink}>
                            Accept invitation
                        </Button>
                    </Section>
                    <Text style={smallText}>
                        Or copy and paste this link into your browser:{" "}
                        <a href={inviteLink} style={link}>
                            {inviteLink}
                        </a>
                    </Text>
                    <Hr style={hr} />
                    <Text style={footer}>
                        If you didn't expect this invitation, you can safely
                        ignore this email.
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

const buttonContainer = {
    padding: "0 48px",
    margin: "24px 0",
};

const button = {
    backgroundColor: YARDLI_GREEN,
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const smallText = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "20px",
    padding: "0 48px",
};

const link = {
    color: YARDLI_GREEN,
    wordBreak: "break-all" as const,
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
