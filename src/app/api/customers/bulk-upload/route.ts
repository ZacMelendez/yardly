import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";
import { validateBulkOperation } from "@/lib/subscription-validation";

interface ColumnMapping {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
}

interface CSVRow {
    [key: string]: string;
}

interface BulkUploadRequest {
    data: CSVRow[];
    columnMapping: ColumnMapping;
}

interface UploadResult {
    success: boolean;
    message: string;
    createdCount: number;
    errorCount: number;
    errors: string[];
}

export async function POST(req: NextRequest) {
    try {
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);
        const body: BulkUploadRequest = await req.json();
        const { data, columnMapping } = body;

        // Validate required mapping
        if (!columnMapping.name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name field mapping is required",
                    createdCount: 0,
                    errorCount: 0,
                    errors: ["Name field must be mapped to a CSV column"],
                },
                { status: 400 }
            );
        }

        // Validate data
        if (!data || data.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No data provided",
                    createdCount: 0,
                    errorCount: 0,
                    errors: ["CSV data is empty"],
                },
                { status: 400 }
            );
        }

        // Validate subscription limits for bulk operation
        const bulkValidation = await validateBulkOperation(
            scope.userId,
            scope.organizationId!,
            "customers",
            data.length
        );
        if (!bulkValidation.success) {
            return bulkValidation.error!;
        }

        // Check for duplicate mappings
        const mappedColumns = Object.values(columnMapping).filter(Boolean);
        const uniqueMappedColumns = [...new Set(mappedColumns)];
        if (mappedColumns.length !== uniqueMappedColumns.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid column mapping",
                    createdCount: 0,
                    errorCount: 0,
                    errors: [
                        "Each CSV column can only be mapped to one customer field",
                    ],
                },
                { status: 400 }
            );
        }

        const results: UploadResult = {
            success: true,
            message: "",
            createdCount: 0,
            errorCount: 0,
            errors: [],
        };

        // Process each row
        const validCustomers = [];
        const errors: string[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 1;

            try {
                // Extract mapped values
                const name = row[columnMapping.name]?.trim();
                const email = columnMapping.email
                    ? row[columnMapping.email]?.trim()
                    : "";
                const phone = columnMapping.phone
                    ? row[columnMapping.phone]?.trim()
                    : "";
                const address = columnMapping.address
                    ? row[columnMapping.address]?.trim()
                    : "";
                const notes = columnMapping.notes
                    ? row[columnMapping.notes]?.trim()
                    : "";

                // Validate required fields
                if (!name) {
                    errors.push(`Row ${rowNumber}: Name is required`);
                    results.errorCount++;
                    continue;
                }

                // Validate email format if provided
                if (email && !isValidEmail(email)) {
                    errors.push(`Row ${rowNumber}: Invalid email format`);
                    results.errorCount++;
                    continue;
                }

                // Check for duplicate email within the same scope
                if (email) {
                    const existingCustomer = await prisma.customer.findFirst({
                        where: {
                            ...scopeWhere,
                            email: email,
                        },
                    });

                    if (existingCustomer) {
                        errors.push(
                            `Row ${rowNumber}: Email "${email}" already exists`
                        );
                        results.errorCount++;
                        continue;
                    }
                }

                validCustomers.push({
                    userId: scope.userId,
                    organizationId: scope.organizationId,
                    name,
                    email: email || null,
                    phone: phone || null,
                    address: address || null,
                    notes: notes || null,
                });
            } catch (error) {
                errors.push(
                    `Row ${rowNumber}: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
                results.errorCount++;
            }
        }

        // Create customers in batch
        if (validCustomers.length > 0) {
            try {
                await prisma.customer.createMany({
                    data: validCustomers,
                    skipDuplicates: true, // Skip duplicates based on unique constraints
                });
                results.createdCount = validCustomers.length;
            } catch (error) {
                console.error("Error creating customers:", error);
                errors.push("Failed to create customers in database");
                results.errorCount += validCustomers.length;
                results.createdCount = 0;
            }
        }

        // Set result message
        if (results.createdCount > 0 && results.errorCount === 0) {
            results.message = `Successfully imported ${results.createdCount} customers`;
        } else if (results.createdCount > 0 && results.errorCount > 0) {
            results.message = `Imported ${results.createdCount} customers, ${results.errorCount} rows had errors`;
        } else {
            results.message = "No customers were imported due to errors";
            results.success = false;
        }

        results.errors = errors;

        return NextResponse.json(results, {
            status: results.success ? 200 : 400,
        });
    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                createdCount: 0,
                errorCount: 0,
                errors: ["An unexpected error occurred"],
            },
            { status: 500 }
        );
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
