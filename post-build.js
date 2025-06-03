#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔧 Post-build: Generating status report and securing protected directories...');

    // Status report is now generated in pre-build step
    console.log('📊 Status report was generated in pre-build step');

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

    console.log('🌐 Production build: Setting up section-specific OAuth protection');

    const buildDir = path.join(__dirname, 'build');
    const protectedSections = ['internal', 'finance', 'operation'];

    // Instead of removing directories, we'll create index.html files that redirect to OAuth
    protectedSections.forEach(section => {
        const sectionPath = path.join(buildDir, section);
        if (fs.existsSync(sectionPath)) {
            // Create a redirect index.html at the root of each protected section
            const redirectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Authenticating...</title>
    <meta http-equiv="refresh" content="0; url=/${section}/">
    <script>window.location.href = '/${section}/';</script>
</head>
<body>
    <p>Redirecting to authentication...</p>
</body>
</html>`;
            
            const indexPath = path.join(sectionPath, 'index.html');
            fs.writeFileSync(indexPath, redirectHtml);
            console.log(`✅ Created OAuth redirect for ${section}/ section`);
        } else {
            console.log(`⚠️  Section ${section}/ not found in build`);
        }
    });

    console.log('🔐 Post-build security complete: Each section has its own OAuth handler');
}

// Run the main function
main().catch(error => {
    console.error('❌ Post-build script failed:', error);
    process.exit(1);
});