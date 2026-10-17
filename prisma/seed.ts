import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to create offset timestamps
function getOffsetTimestamp(offsetMs: number = 0): Date {
    return new Date(Date.now() + offsetMs);
}

// Helper function to validate entity exists
async function validateEntityExists(
    model: any,
    where: any,
    entityName: string,
) {
    const entity = await model.findUnique({ where });
    if (!entity) {
        throw new Error(
            `${entityName} not found with criteria: ${JSON.stringify(where)}`,
        );
    }
    return entity;
}

async function main() {
    const demoUserId = "cmelongvh0000zeonp7gjn1vn";

    // Create or get demo user (Better Auth User schema: emailVerified boolean, createdAt, updatedAt)
    const existingUser = await prisma.user.upsert({
        where: { id: demoUserId },
        create: {
            id: demoUserId,
            name: "Demo User",
            email: "demo@yardli.example",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        update: {},
    });

    console.log(
        `✓ Using user: ${existingUser.email || existingUser.name || demoUserId}`,
    );

    // Create customers linked to the existing user
    console.log("Creating customers...");
    const customers = await prisma.customer.createMany({
        data: [
            {
                userId: demoUserId,
                name: "Green Acres HOA",
                email: "hoa@greenacres.com",
                phone: "555-1000",
                address: "101 Maple St",
                notes: "Weekly mowing and monthly edging.",
                createdAt: getOffsetTimestamp(100), // +100ms
            },
            {
                userId: demoUserId,
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "555-2000",
                address: "202 Oak Ave",
                notes: "Prefers eco-friendly treatments.",
                createdAt: getOffsetTimestamp(200), // +200ms
            },
        ],
        skipDuplicates: true,
    });
    console.log(`✓ Created ${customers.count} customers`);

    // Create services linked to the existing user
    console.log("Creating services...");
    const services = await prisma.service.createMany({
        data: [
            // Lawn Care Services
            {
                userId: demoUserId,
                name: "Weekly Lawn Mowing",
                description: "Professional grass cutting and trimming service",
                category: "Lawn Care",
                defaultPrice: 45.0,
                unit: "visit",
                isActive: true,
                createdAt: getOffsetTimestamp(300), // +300ms
            },
            {
                userId: demoUserId,
                name: "Edging and Trimming",
                description:
                    "Edge walkways, driveways, and trim around landscaping",
                category: "Lawn Care",
                defaultPrice: 25.0,
                unit: "visit",
                isActive: true,
                createdAt: getOffsetTimestamp(350), // +350ms
            },
            {
                userId: demoUserId,
                name: "Leaf Blowing",
                description: "Clear walkways, driveways, and patios of debris",
                category: "Cleaning",
                defaultPrice: 15.0,
                unit: "visit",
                isActive: true,
                createdAt: getOffsetTimestamp(400), // +400ms
            },
            // Landscaping Services
            {
                userId: demoUserId,
                name: "Mulch Installation",
                description: "Delivery and installation of premium mulch",
                category: "Landscaping",
                defaultPrice: 80.0,
                unit: "cubic yard",
                isActive: true,
                createdAt: getOffsetTimestamp(450), // +450ms
            },
            {
                userId: demoUserId,
                name: "Plant Installation",
                description:
                    "Professional planting of shrubs, perennials, and annuals",
                category: "Landscaping",
                defaultPrice: 35.0,
                unit: "plant",
                isActive: true,
                createdAt: getOffsetTimestamp(500), // +500ms
            },
            {
                userId: demoUserId,
                name: "Garden Bed Edging",
                description: "Create clean borders around garden beds",
                category: "Landscaping",
                defaultPrice: 120.0,
                unit: "job",
                isActive: true,
                createdAt: getOffsetTimestamp(550), // +550ms
            },
            // Cleanup Services
            {
                userId: demoUserId,
                name: "Leaf Removal",
                description:
                    "Comprehensive leaf collection and removal service",
                category: "Cleaning",
                defaultPrice: 150.0,
                unit: "job",
                isActive: true,
                createdAt: getOffsetTimestamp(600), // +600ms
            },
            {
                userId: demoUserId,
                name: "Debris Cleanup",
                description: "Remove branches, leaves, and other yard debris",
                category: "Cleaning",
                defaultPrice: 180.0,
                unit: "job",
                isActive: true,
                createdAt: getOffsetTimestamp(650), // +650ms
            },
            // Tree Services
            {
                userId: demoUserId,
                name: "Tree Removal",
                description: "Safe removal of trees and large branches",
                category: "Tree Service",
                defaultPrice: 650.0,
                unit: "tree",
                isActive: true,
                createdAt: getOffsetTimestamp(700), // +700ms
            },
            {
                userId: demoUserId,
                name: "Stump Grinding",
                description: "Complete stump removal and grinding",
                category: "Tree Service",
                defaultPrice: 150.0,
                unit: "stump",
                isActive: true,
                createdAt: getOffsetTimestamp(750), // +750ms
            },
            {
                userId: demoUserId,
                name: "Tree Pruning",
                description:
                    "Professional pruning and trimming of trees and shrubs",
                category: "Tree Service",
                defaultPrice: 95.0,
                unit: "tree",
                isActive: true,
                createdAt: getOffsetTimestamp(800), // +800ms
            },
            // Maintenance Services
            {
                userId: demoUserId,
                name: "Irrigation System Installation",
                description:
                    "Complete sprinkler system design and installation",
                category: "Maintenance",
                defaultPrice: 850.0,
                unit: "system",
                isActive: true,
                createdAt: getOffsetTimestamp(850), // +850ms
            },
            {
                userId: demoUserId,
                name: "Sprinkler Winterization",
                description: "Winterize and blow out irrigation systems",
                category: "Maintenance",
                defaultPrice: 125.0,
                unit: "system",
                isActive: true,
                createdAt: getOffsetTimestamp(900), // +900ms
            },
            {
                userId: demoUserId,
                name: "Soil Preparation",
                description:
                    "Soil testing, amendments, and preparation for planting",
                category: "Landscaping",
                defaultPrice: 200.0,
                unit: "area",
                isActive: true,
                createdAt: getOffsetTimestamp(950), // +950ms
            },
            // Specialty Services
            {
                userId: demoUserId,
                name: "Stone Border Installation",
                description: "Install decorative stone borders and pathways",
                category: "Landscaping",
                defaultPrice: 8.0,
                unit: "linear foot",
                isActive: true,
                createdAt: getOffsetTimestamp(1000), // +1000ms
            },
            {
                userId: demoUserId,
                name: "Fertilizer Application",
                description: "Seasonal fertilizer and treatment application",
                category: "Lawn Care",
                defaultPrice: 65.0,
                unit: "application",
                isActive: true,
                createdAt: getOffsetTimestamp(1050), // +1050ms
            },
        ],
        skipDuplicates: true,
    });
    console.log(`✓ Created ${services.count} services`);

    // Get all customers and services to create estimates for
    const allCustomers = await prisma.customer.findMany({
        where: { userId: demoUserId },
    });
    const allServices = await prisma.service.findMany({
        where: { userId: demoUserId, isActive: true },
    });

    console.log(
        `✓ Found ${allCustomers.length} customers and ${allServices.length} services for user ${demoUserId}`,
    );

    if (allCustomers.length > 0 && allServices.length > 0) {
        // Helper function to find service by name
        const findServiceByName = (name: string) => {
            return allServices.find((service) => service.name === name);
        };

        // Create multiple estimates with different statuses and services
        console.log("Creating estimates...");
        const estimates = [];

        // Estimate 1: Spring Cleanup for first customer (approved)
        const estimate1 = await prisma.estimate.create({
            data: {
                userId: demoUserId,
                customerId: allCustomers[0].id,
                title: "Spring Cleanup Package",
                status: "approved",
                createdAt: getOffsetTimestamp(1100), // +1100ms
                items: {
                    create: [
                        {
                            serviceId: findServiceByName("Leaf Removal")?.id,
                            description: "Leaf removal and debris cleanup",
                            quantity: 1,
                            unitPrice: 150,
                        },
                        {
                            serviceId:
                                findServiceByName("Mulch Installation")?.id,
                            description: "Mulch delivery and installation",
                            quantity: 3,
                            unitPrice: 80,
                        },
                        {
                            serviceId:
                                findServiceByName("Garden Bed Edging")?.id,
                            description: "Garden bed edging",
                            quantity: 1,
                            unitPrice: 120,
                        },
                    ],
                },
            },
            include: { items: true },
        });
        estimates.push(estimate1);

        // Estimate 2: Weekly Lawn Care for second customer (sent)
        if (allCustomers.length > 1) {
            const estimate2 = await prisma.estimate.create({
                data: {
                    userId: demoUserId,
                    customerId: allCustomers[1].id,
                    title: "Weekly Lawn Maintenance",
                    status: "sent",
                    createdAt: getOffsetTimestamp(1200), // +1200ms
                    items: {
                        create: [
                            {
                                serviceId:
                                    findServiceByName("Weekly Lawn Mowing")?.id,
                                description: "Weekly grass cutting",
                                quantity: 4,
                                unitPrice: 45,
                            },
                            {
                                serviceId: findServiceByName(
                                    "Edging and Trimming",
                                )?.id,
                                description: "Edging and trimming",
                                quantity: 4,
                                unitPrice: 25,
                            },
                            {
                                serviceId:
                                    findServiceByName("Leaf Blowing")?.id,
                                description: "Blowing walkways and driveways",
                                quantity: 4,
                                unitPrice: 15,
                            },
                        ],
                    },
                },
                include: { items: true },
            });
            estimates.push(estimate2);
        }

        // Estimate 3: Summer Landscaping Project for first customer (draft)
        const estimate3 = await prisma.estimate.create({
            data: {
                userId: demoUserId,
                customerId: allCustomers[0].id,
                title: "Summer Landscaping Project",
                status: "draft",
                createdAt: getOffsetTimestamp(1300), // +1300ms
                items: {
                    create: [
                        {
                            serviceId: findServiceByName(
                                "Irrigation System Installation",
                            )?.id,
                            description: "Install irrigation system",
                            quantity: 1,
                            unitPrice: 850,
                        },
                        {
                            serviceId:
                                findServiceByName("Plant Installation")?.id,
                            description: "Plant new shrubs and perennials",
                            quantity: 12,
                            unitPrice: 35,
                        },
                        {
                            serviceId: findServiceByName(
                                "Stone Border Installation",
                            )?.id,
                            description: "Install decorative stone border",
                            quantity: 50,
                            unitPrice: 8,
                        },
                        {
                            serviceId:
                                findServiceByName("Soil Preparation")?.id,
                            description: "Soil preparation and amendments",
                            quantity: 1,
                            unitPrice: 200,
                        },
                    ],
                },
            },
            include: { items: true },
        });
        estimates.push(estimate3);

        // Estimate 4: Fall Cleanup for second customer (rejected)
        if (allCustomers.length > 1) {
            const estimate4 = await prisma.estimate.create({
                data: {
                    userId: demoUserId,
                    customerId: allCustomers[1].id,
                    title: "Fall Cleanup and Winterization",
                    status: "rejected",
                    createdAt: getOffsetTimestamp(1400), // +1400ms
                    items: {
                        create: [
                            {
                                serviceId:
                                    findServiceByName("Debris Cleanup")?.id,
                                description: "Leaf collection and removal",
                                quantity: 1,
                                unitPrice: 180,
                            },
                            {
                                serviceId: findServiceByName(
                                    "Sprinkler Winterization",
                                )?.id,
                                description: "Winterize sprinkler system",
                                quantity: 1,
                                unitPrice: 125,
                            },
                            {
                                serviceId:
                                    findServiceByName("Tree Pruning")?.id,
                                description: "Prune trees and shrubs",
                                quantity: 1,
                                unitPrice: 95,
                            },
                        ],
                    },
                },
                include: { items: true },
            });
            estimates.push(estimate4);
        }

        // Estimate 5: Tree Service for first customer (sent)
        const estimate5 = await prisma.estimate.create({
            data: {
                userId: demoUserId,
                customerId: allCustomers[0].id,
                title: "Tree Service and Removal",
                status: "sent",
                createdAt: getOffsetTimestamp(1500), // +1500ms
                items: {
                    create: [
                        {
                            serviceId: findServiceByName("Tree Removal")?.id,
                            description: "Remove dead oak tree",
                            quantity: 1,
                            unitPrice: 650,
                        },
                        {
                            serviceId: findServiceByName("Stump Grinding")?.id,
                            description: "Stump grinding",
                            quantity: 1,
                            unitPrice: 150,
                        },
                        // Custom item without service link
                        {
                            description: "Cleanup and hauling",
                            quantity: 1,
                            unitPrice: 100,
                        },
                    ],
                },
            },
            include: { items: true },
        });
        estimates.push(estimate5);
        console.log(`✓ Created ${estimates.length} estimates`);

        // Create invoice from the first approved estimate
        console.log("Creating invoice...");
        await prisma.invoice.create({
            data: {
                userId: demoUserId,
                customerId: allCustomers[0].id,
                status: "unpaid",
                createdAt: getOffsetTimestamp(1600), // +1600ms
                items: {
                    create: estimate1.items.map((i) => ({
                        serviceId: i.serviceId, // Preserve service relationship
                        description: i.description,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                    })),
                },
            },
        });
        console.log("✓ Created invoice");

        console.log("Creating jobs...");
        const jobsResult = await prisma.job.createMany({
            data: [
                {
                    userId: demoUserId,
                    customerId: allCustomers[0].id,
                    title: "Mowing",
                    status: "scheduled",
                    createdAt: getOffsetTimestamp(1700), // +1700ms
                },
                {
                    userId: demoUserId,
                    customerId: allCustomers[0].id,
                    title: "Edging",
                    status: "scheduled",
                    createdAt: getOffsetTimestamp(1750), // +1750ms
                },
                {
                    userId: demoUserId,
                    customerId: allCustomers[1]?.id || allCustomers[0].id,
                    title: "Leaf Cleanup",
                    status: "completed",
                    createdAt: getOffsetTimestamp(1800), // +1800ms
                },
            ],
        });
        console.log(`✓ Created ${jobsResult.count} jobs`);
    } else {
        console.log(
            "⚠ No customers or services found, skipping estimates, invoices, and jobs creation",
        );
    }

    // Final validation: verify all entities are properly linked to the user
    console.log("Validating entity relationships...");
    const finalValidation = await prisma.user.findUnique({
        where: { id: demoUserId },
        include: {
            customers: true,
            estimates: {
                include: {
                    items: {
                        include: {
                            service: true, // Include service details
                        },
                    },
                },
            },
            invoices: {
                include: {
                    items: {
                        include: {
                            service: true, // Include service details
                        },
                    },
                },
            },
            jobs: true,
            services: true,
        },
    });

    if (finalValidation) {
        console.log(`✓ User ${demoUserId} now has:`);
        console.log(`  - ${finalValidation.customers.length} customers`);
        console.log(`  - ${finalValidation.services.length} services`);
        console.log(`  - ${finalValidation.estimates.length} estimates`);
        console.log(`  - ${finalValidation.invoices.length} invoices`);
        console.log(`  - ${finalValidation.jobs.length} jobs`);

        // Validate that estimate items have proper service relationships
        const totalEstimateItems = finalValidation.estimates.reduce(
            (sum, estimate) => sum + estimate.items.length,
            0,
        );
        const linkedEstimateItems = finalValidation.estimates.reduce(
            (sum, estimate) =>
                sum + estimate.items.filter((item) => item.serviceId).length,
            0,
        );
        console.log(
            `  - ${totalEstimateItems} estimate items (${linkedEstimateItems} linked to services)`,
        );

        // Validate that invoice items have proper service relationships
        const totalInvoiceItems = finalValidation.invoices.reduce(
            (sum, invoice) => sum + invoice.items.length,
            0,
        );
        const linkedInvoiceItems = finalValidation.invoices.reduce(
            (sum, invoice) =>
                sum + invoice.items.filter((item) => item.serviceId).length,
            0,
        );
        console.log(
            `  - ${totalInvoiceItems} invoice items (${linkedInvoiceItems} linked to services)`,
        );
    }

    console.log("🎉 Seed data creation completed successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
