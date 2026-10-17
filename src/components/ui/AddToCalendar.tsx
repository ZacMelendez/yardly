import React from "react";
import { Menu, ActionIcon, Group, Text } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { Job } from "@/lib/atoms";

interface AddToCalendarMenuProps {
    job: Job;
}

export const AddToCalendarMenu: React.FC<AddToCalendarMenuProps> = ({
    job,
}) => {
    const formatEventData = () => {
        const eventTitle = `${job.customer?.name || "Unknown Customer"} - ${
            job.title
        }`;
        const eventDate = job.date ? new Date(job.date) : new Date();
        const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
        const description = `Event: ${job.title}${
            job.customer?.name ? `\nCustomer: ${job.customer.name}` : ""
        }`;
        const location = job.customer?.address || "";

        return {
            title: eventTitle,
            startDate: eventDate,
            endDate: endDate,
            description: description,
            location: location,
        };
    };

    const createGoogleCalendarLink = () => {
        const eventData = formatEventData();
        const startDate =
            eventData.startDate
                .toISOString()
                .replace(/[-:]/g, "")
                .split(".")[0] + "Z";
        const endDate =
            eventData.endDate.toISOString().replace(/[-:]/g, "").split(".")[0] +
            "Z";

        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: eventData.title,
            dates: `${startDate}/${endDate}`,
            details: eventData.description,
            location: eventData.location,
        });

        return `https://calendar.google.com/calendar/render?${params}`;
    };

    const createOutlookLink = () => {
        const eventData = formatEventData();
        const params = new URLSearchParams({
            subject: eventData.title,
            startdt: eventData.startDate.toISOString(),
            enddt: eventData.endDate.toISOString(),
            body: eventData.description,
            location: eventData.location,
        });

        return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
    };

    const downloadICS = () => {
        const eventData = formatEventData();
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Your App//Event//EN",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `DTSTART:${formatDate(eventData.startDate)}`,
            `DTEND:${formatDate(eventData.endDate)}`,
            `SUMMARY:${eventData.title}`,
            `DESCRIPTION:${eventData.description.replace(/\n/g, "\\n")}`,
            `LOCATION:${eventData.location}`,
            `UID:${job.customer?.id || "unknown"}-${Date.now()}@yourapp.com`,
            `DTSTAMP:${formatDate(new Date())}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n");

        const blob = new Blob([icsContent], {
            type: "text/calendar;charset=utf-8",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute(
            "download",
            `${eventData.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    };

    const handleGoogleCalendar = () => {
        window.open(createGoogleCalendarLink(), "_blank");
    };

    const handleOutlookCalendar = () => {
        window.open(createOutlookLink(), "_blank");
    };

    // Don't render if no event data
    if (!job || !job.title) {
        return null;
    }

    return (
        <Menu shadow="md" width={250} position="bottom-end">
            <Menu.Target>
                <ActionIcon variant="light" aria-label="Add to calendar">
                    <IconCalendar size={16} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Add to Calendar</Menu.Label>

                <Menu.Item onClick={handleGoogleCalendar}>
                    <Group>
                        <div>
                            <Text size="sm" fw={500}>
                                Google
                            </Text>
                        </div>
                    </Group>
                </Menu.Item>

                <Menu.Item onClick={handleOutlookCalendar}>
                    <Group>
                        <div>
                            <Text size="sm" fw={500}>
                                Outlook
                            </Text>
                        </div>
                    </Group>
                </Menu.Item>

                <Menu.Item onClick={downloadICS}>
                    <Group>
                        <div>
                            <Text size="sm" fw={500}>
                                Download ICS
                            </Text>
                            <Text size="xs" c="dimmed">
                                For Apple Calendar, other apps
                            </Text>
                        </div>
                    </Group>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
