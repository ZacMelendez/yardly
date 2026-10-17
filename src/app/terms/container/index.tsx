"use client";

import { Title, Text, Stack, Divider, List, Anchor } from "@mantine/core";
import { LegalLayout } from "@/components/layout/LegalLayout";

export default function Container() {
    return (
        <LegalLayout>
            <Stack gap="xl">
                <div>
                    <Title order={1} mb="md">
                        Terms of Service
                    </Title>
                    <Text c="dimmed" size="sm">
                        Last Updated: {new Date().toLocaleDateString()}
                    </Text>
                </div>

                <Divider />

                <section>
                    <Title order={2} mb="md">
                        1. Acceptance of Terms
                    </Title>
                    <Text mb="md">
                        Welcome to Yardli! These Terms of Service ("Terms")
                        constitute a legally binding agreement between you and
                        Yardli ("Company," "we," "our," or "us") regarding your
                        use of our landscaping business management platform and
                        services.
                    </Text>
                    <Text>
                        By accessing or using Yardli, you agree to be bound by
                        these Terms and our Privacy Policy. If you disagree with
                        any part of these Terms, you may not access or use our
                        services.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        2. Description of Service
                    </Title>
                    <Text mb="md">
                        Yardli is a cloud-based software platform designed to
                        help landscaping and lawn care businesses manage their
                        operations, including:
                    </Text>
                    <List mb="md">
                        <List.Item>
                            Customer relationship management (CRM)
                        </List.Item>
                        <List.Item>
                            Job scheduling {/* TODO: Add route optimization */}
                        </List.Item>
                        <List.Item>Estimate and quote generation</List.Item>
                        {/* TODO: Implement the following features
                        <List.Item>
                            Invoice creation and billing management
                        </List.Item>
                        <List.Item>
                            Payment processing through third-party providers
                        </List.Item>
                        <List.Item>
                            Time tracking and employee management
                        </List.Item>
                        <List.Item>Equipment and inventory tracking</List.Item>
                        <List.Item>Financial reporting and analytics</List.Item>
                        <List.Item>Communication tools (email, SMS)</List.Item>
                        */}
                    </List>
                </section>

                <section>
                    <Title order={2} mb="md">
                        3. User Accounts and Registration
                    </Title>

                    <Title order={3} mb="sm">
                        3.1 Account Creation
                    </Title>
                    <Text mb="md">
                        To use Yardli, you must create an account using Google
                        OAuth authentication. You agree to provide accurate,
                        current, and complete information during registration
                        and to update such information to keep it accurate,
                        current, and complete.
                    </Text>

                    <Title order={3} mb="sm">
                        3.2 Account Responsibility
                    </Title>
                    <Text mb="md">
                        You are responsible for safeguarding your account
                        credentials and for all activities that occur under your
                        account. You agree to immediately notify us of any
                        unauthorized use of your account.
                    </Text>

                    <Title order={3} mb="sm">
                        3.3 Eligibility
                    </Title>
                    <Text>
                        You must be at least 18 years old and legally able to
                        enter into contracts to use Yardli. By using our
                        services, you represent and warrant that you meet these
                        requirements.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        4. Acceptable Use
                    </Title>

                    <Title order={3} mb="sm">
                        4.1 Permitted Use
                    </Title>
                    <Text mb="md">
                        You may use Yardli solely for lawful business purposes
                        related to landscaping, lawn care, and related service
                        businesses.
                    </Text>

                    <Title order={3} mb="sm">
                        4.2 Prohibited Activities
                    </Title>
                    <Text mb="md">You agree not to:</Text>
                    <List mb="md">
                        <List.Item>
                            Use the service for any illegal, fraudulent, or
                            unauthorized purpose
                        </List.Item>
                        <List.Item>
                            Violate any local, state, national, or international
                            law or regulation
                        </List.Item>
                        <List.Item>
                            Transmit, or procure the sending of, any advertising
                            or promotional material not authorized by us
                        </List.Item>
                        <List.Item>
                            Impersonate or attempt to impersonate the Company, a
                            Company employee, another user, or any other person
                            or entity
                        </List.Item>
                        <List.Item>
                            Engage in any conduct that restricts or inhibits
                            anyone's use or enjoyment of the platform
                        </List.Item>
                        <List.Item>
                            Use any robot, spider, or other automatic device to
                            access the service
                        </List.Item>
                        <List.Item>
                            Attempt to gain unauthorized access to, interfere
                            with, damage, or disrupt any parts of the platform
                        </List.Item>
                        <List.Item>
                            Upload, transmit, or distribute any malicious code,
                            viruses, or other harmful content
                        </List.Item>
                        <List.Item>
                            Reverse engineer, decompile, disassemble, or
                            otherwise attempt to discover the source code
                        </List.Item>
                    </List>
                </section>

                <section>
                    <Title order={2} mb="md">
                        5. User Content and Data
                    </Title>

                    <Title order={3} mb="sm">
                        5.1 Your Data
                    </Title>
                    <Text mb="md">
                        You retain ownership of all data, content, and
                        information you submit to or store on Yardli ("User
                        Content"). You grant us a limited, non-exclusive,
                        royalty-free license to use, process, and store your
                        User Content solely to provide our services.
                    </Text>

                    <Title order={3} mb="sm">
                        5.2 Data Accuracy
                    </Title>
                    <Text mb="md">
                        You are solely responsible for the accuracy, quality,
                        integrity, legality, reliability, and appropriateness of
                        all User Content. You represent and warrant that you
                        have all necessary rights to provide such content to us.
                    </Text>

                    <Title order={3} mb="sm">
                        5.3 Content Restrictions
                    </Title>
                    <Text mb="md">
                        User Content must not contain material that is
                        defamatory, obscene, threatening, harassing, abusive,
                        slanderous, hateful, or embarrassing to any other person
                        or entity.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        6. Payment Terms
                    </Title>

                    <Title order={3} mb="sm">
                        6.1 Free Tier
                    </Title>
                    <Text mb="md">
                        Yardli offers a free tier with basic features supported
                        by advertising. Access to the free tier is subject to
                        these Terms and our acceptable use policies.
                    </Text>

                    <Title order={3} mb="sm">
                        6.2 Premium Features
                    </Title>
                    <Text mb="md">
                        Premium features may be available for an additional fee.
                        Payment terms for premium features will be clearly
                        disclosed before purchase. All fees are non-refundable
                        unless otherwise specified.
                    </Text>

                    <Title order={3} mb="sm">
                        6.3 Third-Party Payments
                    </Title>
                    <Text mb="md">
                        Payment processing is handled by third-party providers
                        (such as Stripe). You agree to their terms of service
                        for payment processing. We are not responsible for
                        payment processing issues beyond our control.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        7. Third-Party Integrations
                    </Title>
                    <Text mb="md">
                        Yardli integrates with various third-party services
                        including but not limited to:
                    </Text>
                    <List mb="md">
                        <List.Item>
                            Google services (for authentication and mapping)
                        </List.Item>
                        <List.Item>Stripe (for payment processing)</List.Item>
                        <List.Item>Plaid (for banking integrations)</List.Item>
                        <List.Item>Email and SMS providers</List.Item>
                    </List>
                    <Text>
                        Your use of these third-party services is subject to
                        their respective terms of service and privacy policies.
                        We are not responsible for the availability, accuracy,
                        or reliability of third-party services.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        8. Intellectual Property
                    </Title>

                    <Title order={3} mb="sm">
                        8.1 Our Rights
                    </Title>
                    <Text mb="md">
                        The Yardli platform, including its original content,
                        features, and functionality, is owned by us and is
                        protected by international copyright, trademark, patent,
                        trade secret, and other intellectual property laws.
                    </Text>

                    <Title order={3} mb="sm">
                        8.2 Limited License
                    </Title>
                    <Text mb="md">
                        We grant you a limited, non-exclusive, non-transferable,
                        revocable license to access and use Yardli solely for
                        your business purposes in accordance with these Terms.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        9. Privacy and Data Protection
                    </Title>
                    <Text mb="md">
                        Your privacy is important to us. Please review our
                        Privacy Policy, which also governs your use of Yardli,
                        to understand our practices regarding the collection,
                        use, and disclosure of your information.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        10. Service Availability and Modifications
                    </Title>

                    <Title order={3} mb="sm">
                        10.1 Availability
                    </Title>
                    <Text mb="md">
                        We strive to maintain high service availability but do
                        not guarantee uninterrupted access to Yardli. The
                        service may be temporarily unavailable due to
                        maintenance, updates, or circumstances beyond our
                        control.
                    </Text>

                    <Title order={3} mb="sm">
                        10.2 Modifications
                    </Title>
                    <Text mb="md">
                        We reserve the right to modify, suspend, or discontinue
                        any aspect of Yardli at any time, with or without
                        notice. We may also impose limits on certain features or
                        restrict access to parts of the service.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        11. Disclaimers
                    </Title>
                    <Text mb="md">
                        YARDLI IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                        WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                        INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
                        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                        NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                    </Text>
                    <Text mb="md">
                        WE DO NOT WARRANT THAT YARDLI WILL BE UNINTERRUPTED,
                        ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL
                        COMPONENTS. YOUR USE OF YARDLI IS AT YOUR SOLE RISK.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        12. Limitation of Liability
                    </Title>
                    <Text mb="md">
                        TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT
                        SHALL YARDLI, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR
                        AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                        CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                        LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR
                        OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF
                        YARDLI.
                    </Text>
                    <Text mb="md">
                        OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM
                        OR RELATING TO THESE TERMS OR YARDLI SHALL NOT EXCEED
                        THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS
                        PRECEDING THE CLAIM.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        13. Indemnification
                    </Title>
                    <Text mb="md">
                        You agree to defend, indemnify, and hold harmless Yardli
                        and its officers, directors, employees, and agents from
                        and against any claims, liabilities, damages, judgments,
                        awards, losses, costs, expenses, or fees arising out of
                        or relating to your violation of these Terms or your use
                        of Yardli.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        14. Termination
                    </Title>

                    <Title order={3} mb="sm">
                        14.1 Termination by You
                    </Title>
                    <Text mb="md">
                        You may terminate your account at any time by
                        discontinuing use of Yardli and requesting account
                        deletion through our support channels.
                    </Text>

                    <Title order={3} mb="sm">
                        14.2 Termination by Us
                    </Title>
                    <Text mb="md">
                        We may terminate or suspend your account immediately,
                        without prior notice or liability, for any reason,
                        including if you breach these Terms.
                    </Text>

                    <Title order={3} mb="sm">
                        14.3 Effect of Termination
                    </Title>
                    <Text mb="md">
                        Upon termination, your right to use Yardli will cease
                        immediately. We may delete your account and all
                        associated data in accordance with our data retention
                        policies.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        15. Governing Law and Dispute Resolution
                    </Title>
                    <Text mb="md">
                        These Terms shall be governed by and construed in
                        accordance with the laws of the United States, without
                        regard to conflict of law principles. Any legal suit,
                        action, or proceeding arising out of or relating to
                        these Terms shall be instituted exclusively in the
                        federal courts of the United States or the courts of the
                        state where our principal place of business is located.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        16. Severability
                    </Title>
                    <Text mb="md">
                        If any provision of these Terms is held to be invalid or
                        unenforceable by a court, the remaining provisions will
                        remain in full force and effect.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        17. Changes to Terms
                    </Title>
                    <Text mb="md">
                        We reserve the right to modify these Terms at any time.
                        We will notify you of any material changes by posting
                        the new Terms on this page and updating the "Last
                        Updated" date. Your continued use of Yardli after such
                        changes constitutes acceptance of the updated Terms.
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        18. Contact Information
                    </Title>
                    <Text mb="md">
                        If you have any questions about these Terms, please
                        contact us at:
                    </Text>
                    <Text mb="sm">
                        <strong>Email:</strong>{" "}
                        <Anchor href="mailto:legal@yardli.app">
                            legal@yardli.app
                        </Anchor>
                    </Text>
                    <Text mb="sm">
                        <strong>Support:</strong>{" "}
                        <Anchor href="mailto:support@yardli.app">
                            support@yardli.app
                        </Anchor>
                    </Text>
                </section>

                <section>
                    <Title order={2} mb="md">
                        19. Entire Agreement
                    </Title>
                    <Text>
                        These Terms, together with our Privacy Policy,
                        constitute the sole and entire agreement between you and
                        Yardli regarding your use of our services and supersede
                        all prior and contemporaneous understandings,
                        agreements, representations, and warranties.
                    </Text>
                </section>
            </Stack>
        </LegalLayout>
    );
}
