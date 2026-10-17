"use server";

import { prisma } from "@/lib/prisma";
import {
    getUserIdOrOrgId,
    buildScopeWhere,
} from "@/app/api/utils";
import { Customer } from "@/lib/atoms";

export interface CustomerFilters {
    search?: string;
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: "name" | "email" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface CustomerQueryResult {
    data: Customer[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export async function getCustomers(
    filters: CustomerFilters = {}
): Promise<CustomerQueryResult> {
    const scope = await getUserIdOrOrgId();

    // Extract and validate parameters
    const {
        search,
        createdAfter,
        createdBefore,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { ...buildScopeWhere(scope) };

    // Add search filter (searches across name, email, phone, address)
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
        ];
    }

    // Add date range filters
    if (createdAfter || createdBefore) {
        where.createdAt = {};
        if (createdAfter) {
            where.createdAt.gte = new Date(createdAfter);
        }
        if (createdBefore) {
            where.createdAt.lte = new Date(createdBefore);
        }
    }

    // Build orderBy clause
    const validSortFields = ["name", "email", "createdAt", "updatedAt"];
    const validSortOrders = ["asc", "desc"];

    const orderBy: any = {};
    if (
        validSortFields.includes(sortBy) &&
        validSortOrders.includes(sortOrder)
    ) {
        orderBy[sortBy] = sortOrder;
    } else {
        orderBy.createdAt = "desc"; // Default fallback
    }

    try {
        // Get total count for pagination metadata
        const totalCount = await prisma.customer.count({ where });

        // Get paginated customers
        const customersFromDb = await prisma.customer.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        });

        // Transform customers to match the expected type
        const customers: Customer[] = customersFromDb.map((customer) => ({
            ...customer,
            createdAt: customer.createdAt.toISOString(),
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            data: customers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            },
        };
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw new Error("Failed to fetch customers");
    }
}

// Simplified version for cases where you don't need pagination
export async function getAllCustomers(): Promise<Customer[]> {
    const result = await getCustomers({ limit: 1000 }); // Large limit to get all
    return result.data;
}
