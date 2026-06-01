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

const target1 = `const handleActionClick = (action: () => void) => {
        if (!user) {
            openAuthModal();
        } else {
            action();
        }
    };`;
const target2 = `const handleActionClick = (action: () => void) => {
    if (!user) {
      openAuthModal();
    } else {
      action();
    }
  };`;
const replacementRegex = /const\s+handleActionClick\s*=\s*\([^)]*\)\s*=>\s*\{\s*if\s*\(!user\)\s*\{\s*openAuthModal\(\);\s*\}\s*else\s*\{\s*action\(\);\s*\}\s*\};/g;

files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(target1, `const handleActionClick = (action: () => void) => { action(); };`);
        content = content.replace(target2, `const handleActionClick = (action: () => void) => { action(); };`);
        content = content.replace(replacementRegex, `const handleActionClick = (action: () => void) => { action(); };`);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
