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

        // Remove import
        content = content.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+['"]\.\.\/context\/AuthContext['"];?\r?\n?/g, '');
        
        // Remove hook
        content = content.replace(/\s*const\s+\{\s*user\s*,\s*openAuthModal\s*\}\s*=\s*useAuth\(\);\r?\n?/g, '');
        content = content.replace(/\s*const\s+\{\s*openAuthModal\s*,\s*user\s*\}\s*=\s*useAuth\(\);\r?\n?/g, '');

        // Update handleActionClick
        const handleActionPattern = /const\s+handleActionClick\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?if\s*\(!user\)\s*\{[\s\S]*?openAuthModal\(\);[\s\S]*?\}\s*else\s*\{[\s\S]*?action\(\);[\s\S]*?\}[\s\S]*?\};/g;
        
        content = content.replace(handleActionPattern, `const handleActionClick = (action: () => void) => {
        action();
    };`);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
