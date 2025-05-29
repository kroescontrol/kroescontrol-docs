#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔧 Post-build: Generating status report and securing protected directories...');

    // Generate status report first
    console.log('📊 Generating documentation status report...');
    try {
        const StatusReporter = require('./scripts/statusReport.js');
        const reporter = new StatusReporter();
        
        // Generate the report (this will create statusreport.md)
        reporter.scanDocuments();
        reporter.generateConsoleReport();
        
        // Save markdown report
        await reporter.saveMarkdownReport();
        console.log('✅ Status report generated successfully');
    } catch (error) {
        console.warn('⚠️  Could not generate status report:', error.message);
    }

    // Debug environment variables
    console.log('🔍 Environment check:');
    console.log('  KROESCONTROL_LOCAL_DEV:', process.env.KROESCONTROL_LOCAL_DEV);
    console.log('  VERCEL:', process.env.VERCEL);
    console.log('  CI:', process.env.CI);
    console.log('  NODE_ENV:', process.env.NODE_ENV);

    // Only remove directories in production (when KROESCONTROL_LOCAL_DEV is not set)
    const isLocalDev = process.env.KROESCONTROL_LOCAL_DEV === 'true';
    const isVercelBuild = process.env.VERCEL || process.env.CI;

    if (isLocalDev) {
        console.log('🏠 Local development: Keeping all directories for direct access');
        process.exit(0);
    }

    if (!isVercelBuild) {
        console.log('ℹ️  Not a production build: Keeping directories');
        process.exit(0);
    }

    console.log('🌐 Production build: Removing protected directories to force OAuth');

    const buildDir = path.join(__dirname, 'build');
    const dirsToRemove = ['internal', 'finance', 'operation'];

    dirsToRemove.forEach(dir => {
        const dirPath = path.join(buildDir, dir);
        if (fs.existsSync(dirPath)) {
            console.log(`🗑️  Removing ${dir}/ directory...`);
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ Removed ${dir}/ - OAuth will handle access`);
        } else {
            console.log(`⚠️  Directory ${dir}/ not found`);
        }
    });

    console.log('🔐 Post-build security complete: Protected content now requires OAuth');
}

// Run the main function
main().catch(error => {
    console.error('❌ Post-build script failed:', error);
    process.exit(1);
});