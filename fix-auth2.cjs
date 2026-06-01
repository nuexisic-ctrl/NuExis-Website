const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = [
    'WoodenDisplayPodiumPage.tsx',
    'WirelessMicrophonesPage.tsx',
    'VCBarPage.tsx',
    'TTypeStandiePage.tsx',
    'SpeakersPage.tsx',
    'PoleStandiePage.tsx',
    'InterpreterConsolePage.tsx',
    'InformationKioskPage.tsx',
    'DynamicProductPage.tsx',
    'DigitalTouchDelegateMicrophonePage.tsx',
    'DigitalTouchChairpersonMicrophonePage.tsx',
    'DigitalMSPodiumPage.tsx',
    'DigitalDiscussionControllerPage.tsx',
    'DigitalAudioSignalProcessorPage.tsx',
    'ATypeStandiePage.tsx',
    'ABSPodiumPage.tsx',
];

files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Robust regex to find the handleActionClick body and replace it
        // It looks for "if (!user) { openAuthModal(); } else { action(); }"
        // with any amount of whitespace.
        const regex = /if\s*\(\s*!user\s*\)\s*\{\s*openAuthModal\(\);\s*\}\s*else\s*\{\s*action\(\);\s*\}/g;
        content = content.replace(regex, 'action();');

        // Also if we missed any `import { useAuth } ...` or `const { ... } = useAuth()` we strip them again.
        content = content.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+[^;]+;/g, '');
        content = content.replace(/const\s+\{\s*[^}]+\s*\}\s*=\s*useAuth\(\);/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
