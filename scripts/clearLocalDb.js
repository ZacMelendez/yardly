const { PrismaClient } = require('@prisma/client')

async function clearLocalDatabase() {
    // Check if DATABASE_URL is for localhost
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable is not set')
        process.exit(1)
    }

    // Check if it's a localhost database
    const isLocalhost = databaseUrl.includes('localhost') ||
        databaseUrl.includes('127.0.0.1') ||
        databaseUrl.includes('host.docker.internal')

    if (!isLocalhost) {
        console.error('❌ Safety check failed: DATABASE_URL does not appear to be localhost')
        console.error('Current DATABASE_URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'))
        console.error('This script only works with localhost databases for safety')
        process.exit(1)
    }

    console.log('✅ Safety check passed: DATABASE_URL is localhost')
    console.log('🗑️  Starting database cleanup...')

    const prisma = new PrismaClient()

    try {
        // Delete records in dependency order (child tables first)
        console.log('Deleting EstimateItems...')
        await prisma.estimateItem.deleteMany({})

        console.log('Deleting InvoiceItems...')
        await prisma.invoiceItem.deleteMany({})

        console.log('Deleting Jobs...')
        await prisma.job.deleteMany({})

        console.log('Deleting Estimates...')
        await prisma.estimate.deleteMany({})

        console.log('Deleting Invoices...')
        await prisma.invoice.deleteMany({})

        console.log('Deleting Services...')
        await prisma.service.deleteMany({})

        console.log('Deleting Customers...')
        await prisma.customer.deleteMany({})

        console.log('Deleting Subscriptions...')
        await prisma.subscription.deleteMany({})

        console.log('Deleting Sessions...')
        await prisma.session.deleteMany({})

        console.log('Deleting VerificationTokens...')
        await prisma.verification.deleteMany({})

        console.log('✅ Database cleanup completed successfully!')
        console.log('📊 Preserved tables: Account, User')
        console.log('🗑️  Cleared tables: EstimateItem, InvoiceItem, Job, Estimate, Invoice, Service, Customer, Subscription, Session, VerificationToken')

        // Optional: Show remaining record counts
        const userCount = await prisma.user.count()
        const accountCount = await prisma.account.count()

        console.log(`\n📈 Remaining records:`)
        console.log(`   Users: ${userCount}`)
        console.log(`   Accounts: ${accountCount}`)

    } catch (error) {
        console.error('❌ Error during database cleanup:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the script
clearLocalDatabase()
    .then(() => {
        console.log('\n🎉 Script completed successfully!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Script failed:', error)
        process.exit(1)
    })
