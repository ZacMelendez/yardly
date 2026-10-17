"use client";
import {
    Card,
    Text,
    Stack,
    Alert,
    useMantineColorScheme,
    Loader,
    Popover,
    ActionIcon,
    Title,
    Group,
    Anchor,
} from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Link } from "next-view-transitions";
import { useState } from "react";

interface JobMarkerProps {
    job: UpcomingJob;
}

function JobMarker({ job }: JobMarkerProps) {
    const [opened, setOpened] = useState(false);

    return (
        <AdvancedMarker position={job.coordinates!}>
            <Popover
                opened={opened}
                onChange={setOpened}
                position="top"
                withArrow
                shadow="md"
                offset={10}
            >
                <Popover.Target>
                    <ActionIcon
                        variant="filled"
                        color="blue"
                        size="lg"
                        radius="xl"
                        onClick={() => setOpened((o) => !o)}
                        style={{
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    >
                        <IconMapPin size={20} />
                    </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                    <Card
                        withBorder={false}
                        p="sm"
                        style={{ minWidth: "200px" }}
                    >
                        <Stack gap="xs">
                            <Anchor
                                component={Link}
                                href={`/jobs/${job.id}`}
                                fw={600}
                                size="sm"
                            >
                                {job.title}
                            </Anchor>

                            <Text size="xs" c="dimmed">
                                <strong>Customer:</strong>{" "}
                                <Anchor
                                    component={Link}
                                    href={`/customers/${job.customer.id}`}
                                >
                                    {job.customer.name}
                                </Anchor>
                            </Text>
                            {job.customer.address && (
                                <Text size="xs" c="dimmed">
                                    <strong>Address:</strong>{" "}
                                    {job.customer.address}
                                </Text>
                            )}
                            {job.date && (
                                <Text size="xs" c="dimmed">
                                    <strong>Date:</strong>{" "}
                                    {new Date(job.date).toLocaleDateString()}
                                </Text>
                            )}
                            {job.customer.phone && (
                                <Text size="xs" c="dimmed">
                                    <strong>Phone:</strong> {job.customer.phone}
                                </Text>
                            )}
                        </Stack>
                    </Card>
                </Popover.Dropdown>
            </Popover>
        </AdvancedMarker>
    );
}

export interface UpcomingJob {
    id: string;
    title: string;
    date: string | null;
    status: string;
    customer: {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
    };
    coordinates?: {
        lat: number;
        lng: number;
    } | null;
}

interface UpcomingJobsMapProps {
    jobs: UpcomingJob[];
    loading?: boolean;
    error?: string;
}

export default function UpcomingJobsMap({
    jobs,
    loading = false,
    error,
}: UpcomingJobsMapProps) {
    const { colorScheme } = useMantineColorScheme();

    // Check for API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return (
            <Card withBorder h={400}>
                <Alert color="red" title="Google Maps API Key Required">
                    Google Maps API key not configured. Please add
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment
                    variables.
                </Alert>
            </Card>
        );
    }

    if (error) {
        return (
            <Card withBorder h={400}>
                <Alert color="red" title="Error">
                    {error}
                </Alert>
            </Card>
        );
    }

    const jobsWithCoordinates = jobs.filter((job) => job.coordinates);

    // Calculate bounds to fit all markers
    const getMapBounds = () => {
        if (jobsWithCoordinates.length === 0) {
            return {
                center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
                zoom: 10,
            };
        }

        if (jobsWithCoordinates.length === 1) {
            return {
                center: jobsWithCoordinates[0].coordinates!,
                zoom: 15,
            };
        }

        // Calculate bounds for multiple markers
        const lats = jobsWithCoordinates.map((job) => job.coordinates!.lat);
        const lngs = jobsWithCoordinates.map((job) => job.coordinates!.lng);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Add padding to bounds (10% on each side)
        const latPadding = (maxLat - minLat) * 0.1;
        const lngPadding = (maxLng - minLng) * 0.1;

        const paddedMinLat = minLat - latPadding;
        const paddedMaxLat = maxLat + latPadding;
        const paddedMinLng = minLng - lngPadding;
        const paddedMaxLng = maxLng + lngPadding;

        // Calculate center
        const centerLat = (paddedMinLat + paddedMaxLat) / 2;
        const centerLng = (paddedMinLng + paddedMaxLng) / 2;

        // Calculate appropriate zoom level based on bounds
        const latDiff = paddedMaxLat - paddedMinLat;
        const lngDiff = paddedMaxLng - paddedMinLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        // Determine zoom level based on the span of coordinates
        let zoom = 10;
        if (maxDiff > 10) zoom = 4;
        else if (maxDiff > 5) zoom = 6;
        else if (maxDiff > 2) zoom = 8;
        else if (maxDiff > 1) zoom = 10;
        else if (maxDiff > 0.5) zoom = 12;
        else if (maxDiff > 0.1) zoom = 14;
        else zoom = 16;

        return {
            center: { lat: centerLat, lng: centerLng },
            zoom: zoom,
        };
    };

    // Dark mode map styles
    const darkMapStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ];

    // Light mode map styles (minimal styling)
    const lightMapStyles = [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
    ];

    return (
        <Card
            withBorder
            h={"500"}
            p={0}
            m={0}
            style={{ overflow: "hidden" }}
            radius={5}
        >
            <Group mx={"lg"} my="sm" justify="space-between">
                <Title order={3}>Upcoming Jobs</Title>
            </Group>
            <Stack gap="sm" h="100%">
                {loading ? (
                    <Stack align="center" justify="center" flex={1}>
                        <Loader />
                        <Text size="sm" c="dimmed" ta="center">
                            Loading jobs...
                        </Text>
                    </Stack>
                ) : jobsWithCoordinates.length === 0 ? (
                    <Stack align="center" justify="center" flex={1}>
                        <IconMapPin
                            size={48}
                            color="var(--mantine-color-gray-5)"
                        />
                        <Text size="sm" c="dimmed" ta="center">
                            No jobs with addresses found.
                            <br />
                            Add customer addresses to see them on the map.
                        </Text>
                    </Stack>
                ) : (
                    <APIProvider apiKey={apiKey}>
                        <Map
                            style={{ width: "100%", height: "100%", flex: 1 }}
                            defaultCenter={getMapBounds().center}
                            defaultZoom={getMapBounds().zoom}
                            gestureHandling="greedy"
                            disableDefaultUI={true}
                            clickableIcons={false}
                            mapId="yardli-jobs-map"
                            colorScheme={
                                colorScheme === "dark" ? "DARK" : "LIGHT"
                            }
                            styles={
                                colorScheme === "dark"
                                    ? darkMapStyles
                                    : lightMapStyles
                            }
                        >
                            {jobsWithCoordinates.map((job) => (
                                <JobMarker key={job.id} job={job} />
                            ))}
                        </Map>
                    </APIProvider>
                )}
            </Stack>
        </Card>
    );
}
