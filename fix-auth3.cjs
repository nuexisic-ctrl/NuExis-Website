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

        // Regex to catch the current state:
        const regex1 = /if\s*\(!user\)\s*\{\s*\}\s*else\s*\{\s*action\(\);\s*\}/g;
        // Regex to catch the original state just in case it wasn't modified:
        const regex2 = /if\s*\(!user\)\s*\{\s*openAuthModal\(\);\s*\}\s*else\s*\{\s*action\(\);\s*\}/g;

        content = content.replace(regex1, 'action();');
        content = content.replace(regex2, 'action();');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
