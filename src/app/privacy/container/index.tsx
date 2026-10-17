"use client";

import { Title, Text, Stack, Divider, List, Anchor } from "@mantine/core";
import { LegalLayout } from "@/components/layout/LegalLayout";

export default function Container() {
    return (
        <LegalLayout>
            <Stack gap="xl">
                <div>
                    <Title order={1} mb="md">
                        Privacy Policy
                    </Title>
                    <Text c="dimmed" size="sm">
                        Last Updated: {new Date().toLocaleDateString()}
                    </Text>
                </div>

                <Divider />

                <section>
                    <Title order={2} mb="md">
                        1. Introduction
                    </Title>
                    <Text mb="md">
                        Welcome to Yardli ("we," "our," or "us"). This Privacy
                        Policy explains how we collect, use, disclose, and
                        safeguard your information when you use our landscaping
                        business management platform and services.
                    </Text>
                    <Text>
                        By using Yardli, you consent to the data practices
                        described in this policy. If you do not agree with this
                        policy, please do not use our services.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        2. Information We Collect
                    </Title>

                    <Title order={3} mb="sm">
                        2.1 Information You Provide
                    </Title>
                    <List mb="md">
                        <List.Item>
                            Account information (name, email address) through
                            Google OAuth authentication
                        </List.Item>
                        <List.Item>
                            Business information and profile details
                        </List.Item>
                        <List.Item>
                            Customer contact information (names, emails, phone
                            numbers, addresses)
                        </List.Item>
                        <List.Item>
                            Service descriptions, pricing, and business data
                        </List.Item>
                        <List.Item>
                            Job schedules, estimates, invoices, and related
                            business documents
                        </List.Item>
                        <List.Item>
                            Photos and files you upload related to your work
                        </List.Item>
                        <List.Item>Communication data and notes</List.Item>
                    </List>

                    <Title order={3} mb="sm">
                        2.2 Information Automatically Collected
                    </Title>
                    <List mb="md">
                        <List.Item>
                            Usage data and analytics about how you interact with
                            our platform
                        </List.Item>
                        <List.Item>
                            Device information (browser type, operating system)
                        </List.Item>
                        <List.Item>
                            IP address and general location information
                        </List.Item>
                        <List.Item>
                            Cookies and similar tracking technologies
                        </List.Item>
                        <List.Item>
                            Log files and technical data for platform
                            maintenance
                        </List.Item>
                    </List>

                    <Title order={3} mb="sm">
                        2.3 Third-Party Information
                    </Title>
                    <List>
                        <List.Item>
                            Google account information when you authenticate via
                            Google OAuth
                        </List.Item>
                        <List.Item>
                            Payment information processed through Stripe (we do
                            not store payment card details)
                        </List.Item>
                        <List.Item>
                            Banking information through Plaid integration (when
                            you choose to connect accounts)
                        </List.Item>
                        <List.Item>
                            Location and address data from mapping services
                        </List.Item>
                    </List>
                </section>

                <section>
                    <Title order={2} mb="md">
                        3. How We Use Your Information
                    </Title>
                    <Text mb="md">We use your information to:</Text>
                    <List mb="md">
                        <List.Item>
                            Provide and maintain our landscaping business
                            management services
                        </List.Item>
                        <List.Item>
                            Authenticate your account and ensure platform
                            security
                        </List.Item>
                        <List.Item>
                            Enable customer relationship management features
                        </List.Item>
                        <List.Item>
                            Process estimates{" "}
                            {/* TODO: Add invoices and payment transactions */}
                        </List.Item>
                        <List.Item>
                            Facilitate job scheduling{" "}
                            {/* TODO: Add route optimization */}
                        </List.Item>
                        {/* TODO: Implement reporting and analytics
                        <List.Item>
                            Generate reports and analytics for your business
                        </List.Item>
                        */}
                        <List.Item>
                            Provide customer support and technical assistance
                        </List.Item>
                        <List.Item>
                            Send important service updates and notifications
                        </List.Item>
                        <List.Item>
                            Improve our platform features and user experience
                        </List.Item>
                        <List.Item>
                            Ensure compliance with legal obligations
                        </List.Item>
                        <List.Item>Detect and prevent fraud or abuse</List.Item>
                    </List>
                </section>

                <section>
                    <Title order={2} mb="md">
                        4. Information Sharing and Disclosure
                    </Title>
                    <Text mb="md">
                        We may share your information in the following
                        circumstances:
                    </Text>

                    <Title order={3} mb="sm">
                        4.1 Service Providers
                    </Title>
                    <List mb="md">
                        <List.Item>
                            Google (for authentication services)
                        </List.Item>
                        <List.Item>Stripe (for payment processing)</List.Item>
                        <List.Item>Plaid (for banking integrations)</List.Item>
                        <List.Item>
                            Cloud hosting providers (for data storage and
                            platform operation)
                        </List.Item>
                        <List.Item>
                            Email and SMS service providers (for communications)
                        </List.Item>
                        <List.Item>
                            Analytics providers (for platform improvement)
                        </List.Item>
                    </List>

                    <Title order={3} mb="sm">
                        4.2 Business Transfers
                    </Title>
                    <Text mb="md">
                        If we are involved in a merger, acquisition, or sale of
                        assets, your information may be transferred as part of
                        that transaction.
                    </Text>

                    <Title order={3} mb="sm">
                        4.3 Legal Requirements
                    </Title>
                    <Text mb="md">
                        We may disclose your information when required by law,
                        court order, or to protect our rights, privacy, safety,
                        or property.
                    </Text>

                    <Title order={3} mb="sm">
                        4.4 With Your Consent
                    </Title>
                    <Text>
                        We may share information with third parties when you
                        explicitly consent to such sharing.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        5. Data Security
                    </Title>
                    <Text mb="md">
                        We implement appropriate technical and organizational
                        measures to protect your personal information against
                        unauthorized access, alteration, disclosure, or
                        destruction. These measures include:
                    </Text>
                    <List mb="md">
                        <List.Item>
                            Encryption of data in transit and at rest
                        </List.Item>
                        <List.Item>Secure authentication systems</List.Item>
                        <List.Item>
                            Regular security assessments and updates
                        </List.Item>
                        <List.Item>Access controls and monitoring</List.Item>
                        <List.Item>
                            Employee training on data protection
                        </List.Item>
                    </List>
                    <Text>
                        However, no method of transmission or storage is 100%
                        secure. While we strive to protect your information, we
                        cannot guarantee absolute security.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        6. Data Retention
                    </Title>
                    <Text mb="md">
                        We retain your personal information for as long as
                        necessary to provide our services and fulfill the
                        purposes outlined in this policy. Specific retention
                        periods include:
                    </Text>
                    <List mb="md">
                        <List.Item>
                            Account information: Until account deletion plus 30
                            days for backup purposes
                        </List.Item>
                        <List.Item>
                            Business data: As long as you maintain an active
                            account
                        </List.Item>
                        <List.Item>
                            Financial records: 7 years for tax and regulatory
                            compliance
                        </List.Item>
                        <List.Item>
                            Usage logs: 2 years for platform improvement and
                            security
                        </List.Item>
                    </List>
                </section>

                <section>
                    <Title order={2} mb="md">
                        7. Your Rights and Choices
                    </Title>
                    <Text mb="md">
                        Depending on your location, you may have the following
                        rights:
                    </Text>
                    <List mb="md">
                        <List.Item>
                            <strong>Access:</strong> Request a copy of the
                            personal information we hold about you
                        </List.Item>
                        <List.Item>
                            <strong>Correction:</strong> Request correction of
                            inaccurate or incomplete information
                        </List.Item>
                        <List.Item>
                            <strong>Deletion:</strong> Request deletion of your
                            personal information (subject to legal requirements)
                        </List.Item>
                        <List.Item>
                            <strong>Portability:</strong> Request transfer of
                            your data to another service
                        </List.Item>
                        <List.Item>
                            <strong>Restriction:</strong> Request limitation of
                            processing in certain circumstances
                        </List.Item>
                        <List.Item>
                            <strong>Objection:</strong> Object to processing of
                            your information for direct marketing
                        </List.Item>
                        <List.Item>
                            <strong>Withdraw Consent:</strong> Withdraw consent
                            where processing is based on consent
                        </List.Item>
                    </List>
                    <Text>
                        To exercise these rights, please contact us at
                        privacy@yardli.app.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        8. Cookies and Tracking
                    </Title>
                    <Text mb="md">
                        We use cookies and similar technologies to enhance your
                        experience, authenticate users, and analyze platform
                        usage. You can control cookie preferences through your
                        browser settings, though disabling cookies may affect
                        platform functionality.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        9. Third-Party Links
                    </Title>
                    <Text mb="md">
                        Our platform may contain links to third-party websites
                        or services. We are not responsible for the privacy
                        practices of these external sites. Please review their
                        privacy policies before providing any information.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        10. Children's Privacy
                    </Title>
                    <Text mb="md">
                        Yardli is not intended for use by individuals under 18
                        years of age. We do not knowingly collect personal
                        information from children under 18. If we become aware
                        of such collection, we will delete the information
                        immediately.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        11. International Users
                    </Title>
                    <Text mb="md">
                        Yardli is operated from the United States. If you are
                        accessing our services from outside the US, please be
                        aware that your information may be transferred to,
                        stored, and processed in the United States where our
                        servers are located and our central database is
                        operated.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        12. Changes to This Policy
                    </Title>
                    <Text mb="md">
                        We may update this Privacy Policy from time to time. We
                        will notify you of any material changes by posting the
                        new policy on this page and updating the "Last Updated"
                        date. Your continued use of Yardli after such changes
                        constitutes acceptance of the updated policy.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        13. Contact Us
                    </Title>
                    <Text mb="md">
                        If you have any questions about this Privacy Policy or
                        our data practices, please contact us at:
                    </Text>
                    <Text mb="sm">
                        <strong>Email:</strong>{" "}
                        <Anchor href="mailto:privacy@yardli.app">
                            privacy@yardli.app
                        </Anchor>
                    </Text>
                    <Text mb="sm">
                        <strong>Support:</strong>{" "}
                        <Anchor href="mailto:support@yardli.app">
                            support@yardli.app
                        </Anchor>
                    </Text>
                </section>
            </Stack>
        </LegalLayout>
    );
}
