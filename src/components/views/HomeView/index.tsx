"use client";
import { Link } from "next-view-transitions";
import {
    Button,
    Container,
    Group,
    Stack,
    Text,
    Title,
    Card,
    SimpleGrid,
    Center,
    Box,
    Badge,
    ThemeIcon,
    List,
    Paper,
    Flex,
    rem,
} from "@mantine/core";
import {
    IconUsers,
    IconFileText,
    IconCalendar,
    // IconCurrencyDollar,
    IconTruck,
    // IconClock,
    IconPhone,
    IconCheck,
    IconArrowRight,
} from "@tabler/icons-react";
import { YardliIcon } from "../../icons/Yardli";
import styles from "./styles.module.css";

export default function HomeView() {
    return (
        <>
            <Paper className={styles.stickyHeader}>
                <Container size="xl">
                    <Group justify="space-between" h={70}>
                        <Group>
                            <YardliIcon fill="white" height={24} width={24} />

                            <Title order={3} c="white" fw={700}>
                                Yardli
                            </Title>
                        </Group>

                        <Group gap="sm">
                            <Button
                                component={Link}
                                href="/dashboard"
                                variant="outline"
                                radius="xl"
                                style={{
                                    transition: "all 0.2s ease",
                                }}
                            >
                                View App
                            </Button>
                        </Group>
                    </Group>
                </Container>
            </Paper>

            <Box className={styles.heroSection}>
                <Box className={styles.heroBackground} />
                <Container size="xl" className={styles.heroContainer}>
                    <Center id="hero">
                        <Stack
                            align="center"
                            gap="xl"
                            className={styles.heroContent}
                            maw={900}
                        >
                            <Box>
                                <Title className={styles.heroTitle}>
                                    Transform Your
                                    <br />
                                    <Text
                                        component="span"
                                        className={styles.heroTitleAccent}
                                    >
                                        Landscaping
                                    </Text>{" "}
                                    Business
                                </Title>
                            </Box>

                            <Text
                                c="dimmed"
                                maw={700}
                                className={styles.heroSubtitle}
                            >
                                The complete business management platform
                                designed specifically for landscaping
                                professionals. Manage customers, create
                                estimates, schedule jobs, and grow your business
                                — all in one powerful, free solution.
                            </Text>

                            <Group justify="center" gap="lg" mt="xl">
                                <Button
                                    component={Link}
                                    href="/login"
                                    size="xl"
                                    radius="xl"
                                    rightSection={<IconArrowRight size={18} />}
                                    className={styles.heroButton}
                                >
                                    Get Started Free
                                </Button>
                            </Group>
                        </Stack>
                    </Center>
                </Container>
            </Box>

            <Box className={styles.featuresSection}>
                <Container size="xl" className={styles.featuresContainer}>
                    <Stack className={styles.featuresStack}>
                        {/* Features Grid */}
                        <Box id="features">
                            <Stack
                                align="center"
                                gap="xl"
                                className={styles.featuresHeader}
                            >
                                <Badge
                                    variant="gradient"
                                    gradient={{
                                        from: "blue",
                                        to: "cyan",
                                        deg: 45,
                                    }}
                                    size="lg"
                                    radius="xl"
                                >
                                    Core Features
                                </Badge>
                                <Title
                                    order={2}
                                    ta="center"
                                    size={rem(48)}
                                    fw={700}
                                    className={styles.featuresTitle}
                                >
                                    Everything You Need to Run Your Business
                                </Title>
                                <Text
                                    size="lg"
                                    c="dimmed"
                                    ta="center"
                                    maw={600}
                                >
                                    Powerful tools designed specifically for
                                    landscaping professionals to streamline
                                    operations and grow revenue.
                                </Text>
                            </Stack>

                            <SimpleGrid
                                cols={{ base: 1, sm: 2, lg: 3 }}
                                spacing="xl"
                            >
                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "blue",
                                            to: "cyan",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIcon}
                                    >
                                        <IconUsers size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Customer Management
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Organize customer contacts, track
                                        history, and build lasting relationships
                                        with powerful CRM tools designed for
                                        landscaping businesses.
                                    </Text>
                                </Card>

                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "green",
                                            to: "lime",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIconGreen}
                                    >
                                        <IconFileText size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Professional Estimates
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Create beautiful, professional estimates
                                        with custom pricing, templates, and
                                        matrix pricing for square footage
                                        calculations.
                                    </Text>
                                </Card>

                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "orange",
                                            to: "yellow",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIconOrange}
                                    >
                                        <IconCalendar size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Job Scheduling
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Schedule jobs efficiently with status
                                        tracking and recurring job support.
                                        {/* TODO: Add route optimization and mobile access */}
                                    </Text>
                                </Card>

                                {/* TODO: Implement invoicing and payment processing
                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "purple",
                                            to: "pink",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIconPurple}
                                    >
                                        <IconCurrencyDollar size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Invoicing & Payments
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Send professional invoices, accept
                                        online payments with Stripe, and track
                                        your cash flow with automated billing.
                                    </Text>
                                </Card>
                                */}

                                {/* TODO: Implement time tracking and employee management
                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "red",
                                            to: "orange",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIconRed}
                                    >
                                        <IconClock size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Time Tracking
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Track employee hours, manage timesheets,
                                        and monitor job progress with clock
                                        in/out functionality.
                                    </Text>
                                </Card>
                                */}

                                {/* TODO: Implement equipment and inventory management
                                <Card
                                    padding="xl"
                                    radius="xl"
                                    className={`${styles.featureCard} feature-card`}
                                >
                                    <ThemeIcon
                                        variant="gradient"
                                        gradient={{
                                            from: "teal",
                                            to: "cyan",
                                            deg: 45,
                                        }}
                                        size={60}
                                        radius="xl"
                                        mb="lg"
                                        className={styles.featureIconTeal}
                                    >
                                        <IconTruck size={28} />
                                    </ThemeIcon>
                                    <Title
                                        order={4}
                                        mb="sm"
                                        size={rem(20)}
                                        fw={600}
                                    >
                                        Equipment & Inventory
                                    </Title>
                                    <Text
                                        size="md"
                                        c="dimmed"
                                        className={styles.featureText}
                                    >
                                        Manage equipment maintenance schedules,
                                        track inventory, and ensure your tools
                                        are always job-ready.
                                    </Text>
                                </Card>
                                */}
                            </SimpleGrid>
                        </Box>

                        {/* Industry-Specific Features */}
                        <Box id="specialized">
                            <Stack
                                align="center"
                                gap="xl"
                                className={styles.specializedHeader}
                            >
                                <Badge
                                    variant="gradient"
                                    gradient={{
                                        from: "green",
                                        to: "lime",
                                        deg: 45,
                                    }}
                                    size="lg"
                                    radius="xl"
                                >
                                    Industry Specialized
                                </Badge>
                                <Title
                                    order={2}
                                    ta="center"
                                    size={rem(48)}
                                    fw={700}
                                    className={styles.specializedTitle}
                                >
                                    Built Specifically for Landscaping
                                </Title>
                                <Text
                                    size="lg"
                                    c="dimmed"
                                    ta="center"
                                    maw={600}
                                >
                                    Advanced features tailored to the unique
                                    needs of landscaping and outdoor service
                                    businesses.
                                </Text>
                            </Stack>

                            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                                <Card
                                    padding={rem(40)}
                                    radius="xl"
                                    className={`${styles.specializedCardGreen} specialized-card`}
                                >
                                    <Flex align="center" gap="md" mb="xl">
                                        <ThemeIcon
                                            variant="gradient"
                                            gradient={{
                                                from: "green",
                                                to: "lime",
                                                deg: 45,
                                            }}
                                            size={50}
                                            radius="xl"
                                            className={
                                                styles.specializedIconGreen
                                            }
                                        >
                                            <IconTruck size={24} />
                                        </ThemeIcon>
                                        <Title
                                            order={3}
                                            size={rem(24)}
                                            fw={700}
                                        >
                                            Specialized Tools
                                        </Title>
                                    </Flex>
                                    <List
                                        spacing="md"
                                        size="md"
                                        icon={
                                            <ThemeIcon
                                                variant="gradient"
                                                gradient={{
                                                    from: "green",
                                                    to: "lime",
                                                    deg: 45,
                                                }}
                                                size={24}
                                                radius="xl"
                                            >
                                                <IconCheck size={14} />
                                            </ThemeIcon>
                                        }
                                    >
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Recurring job scheduling for regular
                                            maintenance
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Service catalog with
                                            landscaping-specific categories
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Professional estimate templates for
                                            outdoor services
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Customer history tracking for
                                            seasonal work
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Job status management for field
                                            operations
                                        </List.Item>
                                        {/* TODO: Add advanced landscaping features
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Chemical application tracking for
                                            lawn care
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Snow plowing and removal management
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Satellite lot size measurement
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Property management tools
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Photo uploads for completed work
                                        </List.Item>
                                        */}
                                    </List>
                                </Card>

                                <Card
                                    padding={rem(40)}
                                    radius="xl"
                                    className={`${styles.specializedCardBlue} specialized-card`}
                                >
                                    <Flex align="center" gap="md" mb="xl">
                                        <ThemeIcon
                                            variant="gradient"
                                            gradient={{
                                                from: "blue",
                                                to: "cyan",
                                                deg: 45,
                                            }}
                                            size={50}
                                            radius="xl"
                                            className={
                                                styles.specializedIconBlue
                                            }
                                        >
                                            <IconPhone size={24} />
                                        </ThemeIcon>
                                        <Title
                                            order={3}
                                            size={rem(24)}
                                            fw={700}
                                        >
                                            Communication & Mobility
                                        </Title>
                                    </Flex>
                                    <List
                                        spacing="md"
                                        size="md"
                                        icon={
                                            <ThemeIcon
                                                variant="gradient"
                                                gradient={{
                                                    from: "blue",
                                                    to: "cyan",
                                                    deg: 45,
                                                }}
                                                size={24}
                                                radius="xl"
                                            >
                                                <IconCheck size={14} />
                                            </ThemeIcon>
                                        }
                                    >
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Responsive web interface for mobile
                                            devices
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Google OAuth for secure
                                            authentication
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Cloud-based data storage and sync
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Real-time job status updates
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Professional PDF generation for
                                            estimates
                                        </List.Item>
                                        {/* TODO: Add advanced communication features
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Email and SMS integration
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Mobile apps for iOS and Android
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Offline functionality for field work
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            Business logo integration
                                        </List.Item>
                                        <List.Item
                                            className={
                                                styles.specializedListItem
                                            }
                                        >
                                            File attachment system
                                        </List.Item>
                                        */}
                                    </List>
                                </Card>
                            </SimpleGrid>
                        </Box>

                        {/* Get Started Section */}
                        <Box
                            id="get-started"
                            className={styles.getStartedSection}
                        >
                            {/* Background decoration */}
                            <Box className={styles.getStartedBackground1} />
                            <Box className={styles.getStartedBackground2} />

                            <Container size="lg" py={rem(120)}>
                                <Stack
                                    align="center"
                                    gap="xl"
                                    className={styles.getStartedContent}
                                >
                                    <Badge
                                        variant="light"
                                        color="white"
                                        size="lg"
                                        radius="xl"
                                        mb="md"
                                    >
                                        Get Started Today
                                    </Badge>

                                    <Title
                                        order={2}
                                        c="white"
                                        size={rem(48)}
                                        fw={700}
                                        className={styles.getStartedTitle}
                                    >
                                        Ready to Transform Your Business?
                                    </Title>

                                    <Text
                                        size="xl"
                                        c="white"
                                        opacity={0.95}
                                        maw={700}
                                        className={styles.getStartedDescription}
                                    >
                                        Join thousands of landscaping
                                        professionals who are already using
                                        Yardli to streamline their operations,
                                        increase efficiency, and grow their
                                        business.
                                    </Text>

                                    <Group gap="lg" justify="center" mt="xl">
                                        <Button
                                            component={Link}
                                            href="/login"
                                            variant="white"
                                            size="xl"
                                            radius="xl"
                                            rightSection={
                                                <IconArrowRight size={18} />
                                            }
                                            className={styles.getStartedButton}
                                        >
                                            Start Your Free Account
                                        </Button>
                                        <Button
                                            component={Link}
                                            href="/dashboard"
                                            variant="outline"
                                            color="white"
                                            size="xl"
                                            radius="xl"
                                            className={
                                                styles.getStartedButtonOutline
                                            }
                                        >
                                            Explore Features
                                        </Button>
                                    </Group>

                                    <Text
                                        size="sm"
                                        c="white"
                                        opacity={0.8}
                                        mt="lg"
                                    >
                                        No credit card required • Setup in
                                        minutes • Free forever plan
                                    </Text>
                                </Stack>
                            </Container>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box className={styles.footer}>
                <Container size="xl" py="xl">
                    <Stack align="center" gap="md">
                        <Group>
                            <YardliIcon fill="white" height={20} width={20} />
                            <Text c="white" fw={600} size="sm">
                                Yardli
                            </Text>
                        </Group>
                        <Group gap="xl">
                            <Link
                                href="/privacy"
                                style={{ textDecoration: "none" }}
                            >
                                <Text
                                    c="dimmed"
                                    size="sm"
                                    className={styles.navLink}
                                >
                                    Privacy Policy
                                </Text>
                            </Link>
                            <Link
                                href="/terms"
                                style={{ textDecoration: "none" }}
                            >
                                <Text
                                    c="dimmed"
                                    size="sm"
                                    className={styles.navLink}
                                >
                                    Terms of Service
                                </Text>
                            </Link>
                        </Group>
                        <Text c="dimmed" size="xs" ta="center">
                            © {new Date().getFullYear()} Yardli. All rights
                            reserved.
                        </Text>
                    </Stack>
                </Container>
            </Box>

            <style jsx global>{`
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
                }

                .specialized-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7) !important;
                }

                .quick-nav-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .feature-card,
                .specialized-card {
                    animation: fadeInUp 0.6s ease-out;
                }

                .feature-card:nth-child(1) {
                    animation-delay: 0.1s;
                }
                .feature-card:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .feature-card:nth-child(3) {
                    animation-delay: 0.3s;
                }
                .feature-card:nth-child(4) {
                    animation-delay: 0.4s;
                }
                .feature-card:nth-child(5) {
                    animation-delay: 0.5s;
                }
                .feature-card:nth-child(6) {
                    animation-delay: 0.6s;
                }

                .specialized-card:nth-child(1) {
                    animation-delay: 0.2s;
                }
                .specialized-card:nth-child(2) {
                    animation-delay: 0.4s;
                }
            `}</style>
        </>
    );
}
